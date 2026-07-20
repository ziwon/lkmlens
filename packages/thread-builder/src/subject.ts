/**
 * Subject-line parsing: reply-prefix stripping, patch-series metadata, and
 * canonical-subject normalization for thread/series grouping.
 * See docs/PLANNING.md section 8 (thread_type, patch_version, patch_total)
 * and section 20 ("Thread reconstruction ambiguity").
 */

export type ThreadType =
  | "patch"
  | "rfc"
  | "pull_request"
  | "discussion"
  | "question"
  | "announcement"
  | "unknown";

export interface PatchInfo {
  threadType: ThreadType;
  isCoverLetter: boolean;
  version: number | null;
  patchIndex: number | null;
  patchTotal: number | null;
}

const REPLY_PREFIX_RE = /^(re|fwd?):\s*/i;
const BRACKET_PREFIX_RE = /^\[([^\]]*)\]\s*/;

/** Strips leading "Re: "/"Fwd: " prefixes (repeated), keeping any bracketed tag. */
export function stripReplyPrefix(subject: string): string {
  let s = subject.trim();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const withoutReply = s.replace(REPLY_PREFIX_RE, "");
    if (withoutReply === s) break;
    s = withoutReply.trim();
  }
  return s;
}

/** Strips leading "Re: "/"Fwd: " prefixes and one leading bracketed tag — for cross-version thread/series grouping. */
export function canonicalizeSubject(subject: string): string {
  return stripReplyPrefix(subject).replace(BRACKET_PREFIX_RE, "").trim();
}

/** Extracts the leading bracketed tag (e.g. "PATCH v3 2/2"), skipping any Re:/Fwd: prefix. */
function extractBracketTag(subject: string): string | null {
  let s = subject.trim();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const withoutReply = s.replace(REPLY_PREFIX_RE, "");
    if (withoutReply === s) break;
    s = withoutReply.trim();
  }
  const match = BRACKET_PREFIX_RE.exec(s);
  return match ? (match[1] ?? "") : null;
}

export function parsePatchInfo(subject: string): PatchInfo {
  const tag = extractBracketTag(subject);
  const empty: PatchInfo = {
    threadType: "unknown",
    isCoverLetter: false,
    version: null,
    patchIndex: null,
    patchTotal: null,
  };
  if (!tag) return empty;

  const tokens = tag.split(/\s+/).filter(Boolean);
  const upper = tokens.map((t) => t.toUpperCase());

  const isPatch = upper.includes("PATCH");
  const isRfc = upper.includes("RFC");
  const isPull = upper.includes("PULL") || upper.includes("GIT");

  if (!isPatch && !isRfc && !isPull) return empty;

  let version: number | null = null;
  let patchIndex: number | null = null;
  let patchTotal: number | null = null;

  for (const token of tokens) {
    const versionMatch = /^v(\d+)$/i.exec(token);
    if (versionMatch) {
      version = Number(versionMatch[1]);
      continue;
    }
    const indexMatch = /^(\d+)\/(\d+)$/.exec(token);
    if (indexMatch) {
      patchIndex = Number(indexMatch[1]);
      patchTotal = Number(indexMatch[2]);
    }
  }

  const threadType: ThreadType = isPull ? "pull_request" : isRfc ? "rfc" : "patch";

  return {
    threadType,
    isCoverLetter: patchIndex === 0,
    // A bare "[PATCH]" / "[PATCH 2/5]" with no explicit vN is v1 by kernel convention.
    version: version ?? (isPatch || isRfc ? 1 : null),
    patchIndex,
    patchTotal,
  };
}
