/**
 * Thin wrapper around `wrangler d1 execute` for Node-side scripts that need
 * to read or write D1 outside of a Worker (seeding, backfill, FTS rebuild).
 * Shells out rather than using the D1 HTTP API directly so it reuses the
 * developer's existing `wrangler` auth.
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const DB_NAME = "lkmlens";

export type D1Target = "--local" | "--remote";

export function parseD1Target(argv: string[]): D1Target {
  if (argv.includes("--remote")) return "--remote";
  if (argv.includes("--local")) return "--local";
  console.error("Usage: --local | --remote");
  process.exit(1);
}

/** Runs a (possibly large) SQL script against D1 via a temp file, streaming wrangler's own output. */
export function execD1File(sql: string, target: D1Target, label: string): void {
  const dir = mkdtempSync(join(tmpdir(), "lkmlens-d1-"));
  const file = join(dir, "run.sql");
  writeFileSync(file, sql, "utf8");

  console.log(`${label} (${target.slice(2)}) via ${file} ...`);
  // --yes skips wrangler's "About to execute ... on remote database. Ok to
  // proceed? (Y/n)" confirmation so unattended runs (systemd timer, `just
  // sync`) don't hang waiting on stdin. Harmless for --local (no prompt).
  const result = spawnSync("wrangler", ["d1", "execute", DB_NAME, target, "--yes", "--file", file], {
    stdio: "inherit",
  });
  if (result.status !== 0) {
    console.error("wrangler d1 execute failed");
    process.exit(result.status ?? 1);
  }
}

/** Runs a single read-only query and returns its result rows. */
export function queryD1<T = Record<string, unknown>>(sql: string, target: D1Target): T[] {
  const result = spawnSync(
    "wrangler",
    ["d1", "execute", DB_NAME, target, "--json", "--command", sql],
    { encoding: "utf8", maxBuffer: 1024 * 1024 * 64 },
  );
  if (result.status !== 0) {
    console.error(result.stderr);
    console.error("wrangler d1 execute failed");
    process.exit(result.status ?? 1);
  }
  const parsed = JSON.parse(result.stdout) as Array<{ results: T[] }>;
  return parsed[0]?.results ?? [];
}

export function sqlString(value: string | null | undefined): string {
  if (value === null || value === undefined) return "NULL";
  return `'${value.replace(/'/g, "''")}'`;
}

export function sqlNumber(value: number | null | undefined): string {
  return value === null || value === undefined ? "NULL" : String(value);
}
