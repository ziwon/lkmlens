import type { D1Database } from "@cloudflare/workers-types";
import type { SummaryContent, SummaryState } from "@lkmlens/shared";

export interface SummaryCandidate {
  threadId: number;
  summaryState: SummaryState;
}

export interface SaveSummaryInput {
  threadId: number;
  content: SummaryContent;
  model: string;
  promptVersion: string;
  sourceMessageIds: string[];
  sourceSetChecksum: string;
}

export interface SummaryCandidateOptions {
  limit?: number;
  model: string;
  promptVersion: string;
}

export async function listSummaryCandidates(db: D1Database, options: SummaryCandidateOptions): Promise<SummaryCandidate[]> {
  const boundedLimit = Math.max(1, Math.min(options.limit ?? 5, 20));
  const { results } = await db.prepare(
    `SELECT id AS threadId, summary_state AS summaryState
     FROM threads
     WHERE message_count >= 2 AND (
       summary_state IN ('pending', 'stale')
       OR NOT EXISTS (
         SELECT 1 FROM summaries s WHERE s.thread_id = threads.id
         AND s.summary_type = 'thread' AND s.is_current = 1
         AND s.model = ? AND s.prompt_version = ?
       )
     )
     ORDER BY last_activity_at DESC LIMIT ?`,
  ).bind(options.model, options.promptVersion, boundedLimit).all<SummaryCandidate>();
  return results;
}

export async function saveCurrentSummary(db: D1Database, input: SaveSummaryInput): Promise<void> {
  await db.batch([
    db.prepare("UPDATE summaries SET is_current = 0 WHERE thread_id = ? AND summary_type = 'thread' AND is_current = 1")
      .bind(input.threadId),
    db.prepare(
      `INSERT INTO summaries (
        thread_id, summary_type, content_json, model, prompt_version,
        source_message_ids_json, source_set_checksum, is_current, human_review_state
       ) VALUES (?, 'thread', ?, ?, ?, ?, ?, 1, 'unreviewed')`,
    ).bind(
      input.threadId,
      JSON.stringify(input.content),
      input.model,
      input.promptVersion,
      JSON.stringify(input.sourceMessageIds),
      input.sourceSetChecksum,
    ),
    db.prepare("UPDATE threads SET summary_state = 'generated' WHERE id = ?").bind(input.threadId),
  ]);
}

export async function markSummarySkipped(db: D1Database, threadId: number): Promise<void> {
  await db.prepare("UPDATE threads SET summary_state = 'skipped' WHERE id = ?").bind(threadId).run();
}
