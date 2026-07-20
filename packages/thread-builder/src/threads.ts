import type { ParsedMessage } from "@lkmlens/mail-parser";
import { canonicalizeSubject, parsePatchInfo, stripReplyPrefix, type ThreadType } from "./subject.js";

export interface ThreadDraft {
  rootMessageId: string;
  canonicalSubject: string;
  displaySubject: string;
  mailingList: string | null;
  threadType: ThreadType;
  patchVersion: number | null;
  patchTotal: number | null;
  authorName: string | null;
  firstPostedAt: string | null;
  lastActivityAt: string | null;
  messageIds: string[];
  /**
   * "partial" means the resolved root's parent (per In-Reply-To/References)
   * points outside this batch — the true thread root may be earlier and
   * simply wasn't fetched yet. The message is never discarded (see
   * docs/PLANNING.md section 20, "Preserve orphan messages"); it's just
   * grouped under the earliest ancestor we do have.
   */
  rootConfidence: "complete" | "partial";
}

export interface MessageThreadAssignment {
  messageId: string;
  rootMessageId: string;
}

export interface BuildThreadsResult {
  threads: ThreadDraft[];
  assignments: MessageThreadAssignment[];
}

function resolveParentId(message: ParsedMessage): string | null {
  return message.inReplyTo ?? message.references.at(-1) ?? null;
}

/**
 * Groups a batch of parsed messages into threads using In-Reply-To/
 * References chains. Pure function over the batch — no I/O, no D1 — so it
 * can run identically whether the batch is a first backfill or an
 * incremental sync of a handful of new messages.
 */
export function buildThreads(messages: ParsedMessage[]): BuildThreadsResult {
  const byId = new Map<string, ParsedMessage>();
  for (const message of messages) {
    if (message.messageId) byId.set(message.messageId, message);
  }

  const rootCache = new Map<string, { rootId: string; confidence: "complete" | "partial" }>();

  function resolveRoot(startId: string): { rootId: string; confidence: "complete" | "partial" } {
    const cached = rootCache.get(startId);
    if (cached) return cached;

    const visited = new Set<string>();
    let current = startId;
    let confidence: "complete" | "partial" = "complete";

    for (;;) {
      if (visited.has(current)) break; // circular reference guard
      visited.add(current);

      const msg = byId.get(current);
      if (!msg) break; // shouldn't happen for a starting id drawn from byId

      const parentId = resolveParentId(msg);
      if (!parentId) break; // true root: no parent header at all
      if (!byId.has(parentId)) {
        confidence = "partial"; // true parent lies outside this batch
        break;
      }
      current = parentId;
    }

    const result = { rootId: current, confidence };
    for (const id of visited) rootCache.set(id, result);
    return result;
  }

  const groups = new Map<string, { messageIds: string[]; confidence: "complete" | "partial" }>();
  const assignments: MessageThreadAssignment[] = [];

  for (const message of byId.values()) {
    const { rootId, confidence } = resolveRoot(message.messageId);
    assignments.push({ messageId: message.messageId, rootMessageId: rootId });

    const group = groups.get(rootId);
    if (group) {
      group.messageIds.push(message.messageId);
      if (confidence === "partial") group.confidence = "partial";
    } else {
      groups.set(rootId, { messageIds: [message.messageId], confidence });
    }
  }

  const threads: ThreadDraft[] = [];
  for (const [rootId, group] of groups) {
    const root = byId.get(rootId);
    if (!root) continue; // rootId is always drawn from byId by construction

    const patchInfo = parsePatchInfo(root.subject);
    const postedDates = group.messageIds
      .map((id) => byId.get(id)?.postedAt)
      .filter((d): d is string => !!d)
      .sort();

    threads.push({
      rootMessageId: rootId,
      canonicalSubject: canonicalizeSubject(root.subject),
      displaySubject: stripReplyPrefix(root.subject),
      mailingList: root.mailingList,
      threadType: patchInfo.threadType,
      patchVersion: patchInfo.version,
      patchTotal: patchInfo.patchTotal,
      authorName: root.from?.name ?? root.from?.email ?? null,
      firstPostedAt: postedDates[0] ?? null,
      lastActivityAt: postedDates.at(-1) ?? null,
      messageIds: group.messageIds,
      rootConfidence: group.confidence,
    });
  }

  return { threads, assignments };
}
