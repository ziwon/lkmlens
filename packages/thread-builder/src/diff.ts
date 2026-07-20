/**
 * Extracts changed file paths from a patch email body, for deterministic
 * subsystem/vendor impact tagging (docs/PLANNING.md-adjacent — not in the
 * original data model, added for patch-impact classification).
 *
 * Primary signal is `diff --git a/PATH b/PATH` headers, which are present
 * in any real unified diff (including new/deleted files, where one side is
 * `/dev/null`) and unambiguous to parse — validated against real
 * lore.kernel.org patches across dri-devel, bpf, and kvm. Falls back to
 * diffstat summary lines (` path/to/file.c | 4 ++--`) for the rare body
 * that includes a diffstat without the full diff (e.g. some cover letters).
 */

const DIFF_GIT_RE = /^diff --git a\/(\S+) b\/(\S+)/gm;
const DIFFSTAT_LINE_RE = /^ ([\w./+-]+\.\w+)\s+\|\s+\d+\s+[+-]*$/gm;

export function extractFilePaths(bodyText: string): string[] {
  const paths = new Set<string>();

  for (const match of bodyText.matchAll(DIFF_GIT_RE)) {
    const path = match[2] === "dev/null" ? match[1] : match[2];
    if (path && path !== "dev/null") paths.add(path);
  }

  if (paths.size === 0) {
    for (const match of bodyText.matchAll(DIFFSTAT_LINE_RE)) {
      if (match[1]) paths.add(match[1]);
    }
  }

  return Array.from(paths);
}
