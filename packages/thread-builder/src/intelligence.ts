import { canonicalizeSubject } from "./subject.js";

export const REVIEW_SIGNAL_TYPES = [
  "Reviewed-by",
  "Acked-by",
  "Tested-by",
  "Reported-by",
  "Suggested-by",
  "Co-developed-by",
  "Signed-off-by",
] as const;

export type ReviewSignalType = (typeof REVIEW_SIGNAL_TYPES)[number];

export interface ExtractedReviewSignal {
  type: ReviewSignalType;
  personName: string;
  email: string | null;
}

const REVIEW_TRAILER_RE = /^(Reviewed-by|Acked-by|Tested-by|Reported-by|Suggested-by|Co-developed-by|Signed-off-by):\s*(.+)$/gim;

/** Extracts only explicit, unquoted review trailers from a message body. */
export function extractReviewSignals(bodyText: string): ExtractedReviewSignal[] {
  const signals: ExtractedReviewSignal[] = [];
  const seen = new Set<string>();

  for (const match of bodyText.matchAll(REVIEW_TRAILER_RE)) {
    const type = match[1] as ReviewSignalType | undefined;
    const value = match[2]?.trim();
    if (!type || !value) continue;

    const address = /^(.*?)\s*<([^<>]+)>\s*$/.exec(value);
    const personName = (address?.[1] ?? value).trim().replace(/^"|"$/g, "");
    const email = address?.[2]?.trim() ?? null;
    if (!personName) continue;

    const key = `${type}\0${personName.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    signals.push({ type, personName, email });
  }

  return signals;
}

/** Stable grouping key across v1/v2/RESEND variants of the same subject. */
export function makeSeriesKey(subject: string): string {
  return canonicalizeSubject(subject).toLowerCase().replace(/\s+/g, " ").trim();
}

/** Pulls author-written revision notes from conventional "Changes ..." sections. */
export function extractRevisionNotes(bodyText: string): string | null {
  const lines = bodyText.replace(/\r\n/g, "\n").split("\n");
  const start = lines.findIndex((line) => /^changes\s+(?:since|in|from)\s+v?\d+\s*:/i.test(line.trim()));
  if (start === -1) return null;

  const collected: string[] = [];
  for (const line of lines.slice(start, start + 24)) {
    if (collected.length > 0 && /^(?:diff --git|---$|signed-off-by:)/i.test(line.trim())) break;
    collected.push(line.trimEnd());
  }
  const result = collected.join("\n").trim();
  return result || null;
}

export function summarizeFileChanges(previous: string[], current: string[]): string | null {
  const before = new Set(previous);
  const after = new Set(current);
  const added = current.filter((path) => !before.has(path));
  const removed = previous.filter((path) => !after.has(path));
  if (added.length === 0 && removed.length === 0) return null;

  const parts: string[] = [];
  if (added.length > 0) parts.push(`Added files: ${added.join(", ")}`);
  if (removed.length > 0) parts.push(`Removed files: ${removed.join(", ")}`);
  return parts.join("\n");
}
