import type { ParsedMessage } from "@lkmlens/mail-parser";

/**
 * Deduplicates by Message-ID, keeping the first occurrence. lore.kernel.org
 * can legitimately serve the same message twice (cross-posted to multiple
 * lists, or re-fetched across an incremental sync window) — Message-ID is
 * the canonical idempotency key per docs/PLANNING.md section 16.
 */
export function dedupeByMessageId(messages: ParsedMessage[]): ParsedMessage[] {
  const seen = new Set<string>();
  const result: ParsedMessage[] = [];
  for (const message of messages) {
    if (!message.messageId || seen.has(message.messageId)) continue;
    seen.add(message.messageId);
    result.push(message);
  }
  return result;
}
