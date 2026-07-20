/**
 * Reads lore.kernel.org archives via git mirroring (grokmirror-style),
 * *not* HTTP scraping of the lore.kernel.org WWW interface.
 *
 * lore.kernel.org/robots.txt disallows all automated HTTP access
 * ("User-agent: *" / "Disallow: /"), so the Atom-feed/raw-message HTTP
 * endpoints documented in public-inbox's WWW design notes are off-limits
 * for a collector. kernel.org instead documents and encourages bulk
 * access via git cloning — see
 * https://people.kernel.org/monsieuricon/mirroring-lore-kernel-org — which
 * this module uses instead.
 *
 * Node-only (shells out to the `git` binary and touches the filesystem),
 * so it cannot run inside a Cloudflare Worker. It's meant for an external
 * ingestion process (a script, cron job, or container) that syncs a local
 * mirror and pushes normalized results into D1 — see docs/PLANNING.md
 * section 19's note about a container-based worker for exactly this kind
 * of git-native access.
 *
 * public-inbox v2 format: each commit on the epoch's `master` branch adds
 * exactly one raw RFC822 message as a blob named "m" in the commit's tree.
 * Verified against a real shallow clone of lore.kernel.org/rust-for-linux/0.
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

export interface MirrorTarget {
  /** public-inbox archive name, e.g. "rust-for-linux". */
  inbox: string;
  /** v2 epoch number. Most active lists only have epoch 0 for now. */
  epoch: number;
  /** Defaults to https://lore.kernel.org. */
  baseUrl?: string;
}

export function mirrorUrl(target: MirrorTarget): string {
  const base = target.baseUrl ?? "https://lore.kernel.org";
  return `${base}/${target.inbox}/${target.epoch}`;
}

export function mirrorPath(baseDir: string, target: MirrorTarget): string {
  return join(baseDir, `${target.inbox}-${target.epoch}.git`);
}

function git(args: string[], cwd?: string): string {
  return execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: 1024 * 1024 * 256 });
}

/**
 * Clones a mirror if it doesn't exist yet (shallow, bounded by
 * `shallowSince`, per docs/PLANNING.md section 17 — "avoid full historical
 * backfills at launch"), or fetches new commits into an existing one.
 */
export function syncMirror(
  baseDir: string,
  target: MirrorTarget,
  options: { shallowSince?: string } = {},
): { path: string; created: boolean } {
  const path = mirrorPath(baseDir, target);
  const url = mirrorUrl(target);

  if (existsSync(path)) {
    git(["fetch", "origin", "+refs/heads/master:refs/heads/master"], path);
    return { path, created: false };
  }

  const shallowArgs = options.shallowSince ? ["--shallow-since", options.shallowSince] : ["--depth", "500"];
  git(["clone", "--bare", ...shallowArgs, url, path]);
  return { path, created: true };
}

export interface MirrorCommit {
  sha: string;
  /** Raw RFC822 message text (the commit's "m" blob). */
  raw: string;
}

/**
 * Lists commits in chronological order (oldest first). When `sinceSha` is
 * given, only commits strictly after it are returned — the idempotent
 * incremental-sync path, keyed off collection_checkpoints.cursor.
 */
export function listCommitShas(
  mirrorPath: string,
  options: { sinceSha?: string; maxCount?: number } = {},
): string[] {
  const range = options.sinceSha ? `${options.sinceSha}..HEAD` : "HEAD";
  const args = ["log", "--format=%H", "--reverse"];
  if (!options.sinceSha && options.maxCount) args.push(`--max-count=${options.maxCount}`);
  args.push(range);

  try {
    const out = git(args, mirrorPath).trim();
    const shas = out ? out.split("\n") : [];
    // When bounding by count without a `since` cursor, --max-count keeps the
    // *most recent* N commits, which --reverse then lists oldest-first.
    return options.sinceSha && options.maxCount ? shas.slice(0, options.maxCount) : shas;
  } catch (err) {
    if (options.sinceSha && String(err).includes("Invalid revision range")) {
      // sinceSha fell outside the shallow clone's history (e.g. an older
      // checkpoint against a repo that was re-cloned) — nothing new to do
      // from that cursor; caller should treat this as "no new commits".
      return [];
    }
    throw err;
  }
}

export function readMessageAtCommit(mirrorPath: string, sha: string): string {
  return git(["show", `${sha}:m`], mirrorPath);
}

export function readMirrorCommits(
  mirrorPath: string,
  options: { sinceSha?: string; maxCount?: number } = {},
): MirrorCommit[] {
  return listCommitShas(mirrorPath, options).map((sha) => ({
    sha,
    raw: readMessageAtCommit(mirrorPath, sha),
  }));
}
