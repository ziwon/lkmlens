import type { D1Database } from "@cloudflare/workers-types";
import type { Message, Thread, ThreadImpact } from "@lkmlens/shared";

interface ThreadRow {
  id: number;
  root_message_id: string;
  canonical_subject: string;
  display_subject: string;
  mailing_list: string | null;
  thread_type: Thread["threadType"];
  patch_version: number | null;
  patch_total: number | null;
  author_name: string | null;
  source_url: string;
  first_posted_at: string | null;
  last_activity_at: string | null;
  message_count: number;
  review_state: string | null;
  summary_state: Thread["summaryState"];
  created_at: string;
  updated_at: string;
}

interface MessageRow {
  id: number;
  message_id: string;
  thread_id: number | null;
  parent_message_id: string | null;
  subject: string;
  canonical_subject: string | null;
  author_name: string | null;
  author_email_hash: string | null;
  mailing_list: string | null;
  message_type: Message["messageType"];
  posted_at: string | null;
  source_url: string;
  body_text: string | null;
  body_checksum: string | null;
  raw_object_key: string | null;
  created_at: string;
  updated_at: string;
}

interface ThreadTopicRow {
  slug: string;
  name: string;
  score: number;
  matched_by_json: string;
  is_manual: number;
}

interface ThreadImpactRow {
  thread_id: number;
  affected_layers_json: string;
  likely_stakeholders_json: string;
  suggested_action: string | null;
  matched_by_json: string;
  generated_at: string;
}

function rowToThread(row: ThreadRow): Thread {
  return {
    id: row.id,
    rootMessageId: row.root_message_id,
    canonicalSubject: row.canonical_subject,
    displaySubject: row.display_subject,
    mailingList: row.mailing_list,
    threadType: row.thread_type,
    patchVersion: row.patch_version,
    patchTotal: row.patch_total,
    authorName: row.author_name,
    sourceUrl: row.source_url,
    firstPostedAt: row.first_posted_at,
    lastActivityAt: row.last_activity_at,
    messageCount: row.message_count,
    reviewState: row.review_state,
    summaryState: row.summary_state,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToMessage(row: MessageRow): Message {
  return {
    id: row.id,
    messageId: row.message_id,
    threadId: row.thread_id,
    parentMessageId: row.parent_message_id,
    subject: row.subject,
    canonicalSubject: row.canonical_subject,
    authorName: row.author_name,
    authorEmailHash: row.author_email_hash,
    mailingList: row.mailing_list,
    messageType: row.message_type,
    postedAt: row.posted_at,
    sourceUrl: row.source_url,
    bodyText: row.body_text,
    bodyChecksum: row.body_checksum,
    rawObjectKey: row.raw_object_key,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface ThreadTopicSummary {
  slug: string;
  name: string;
  score: number;
  matchedBy: string[];
  isManual: boolean;
}

function rowToImpact(row: ThreadImpactRow): ThreadImpact {
  return {
    threadId: row.thread_id,
    affectedLayers: JSON.parse(row.affected_layers_json) as string[],
    likelyStakeholders: JSON.parse(row.likely_stakeholders_json) as string[],
    suggestedAction: row.suggested_action,
    matchedBy: JSON.parse(row.matched_by_json) as string[],
    generatedAt: row.generated_at,
  };
}

export interface ThreadDetail {
  thread: Thread;
  messages: Message[];
  topics: ThreadTopicSummary[];
  impact: ThreadImpact | null;
}

/**
 * Fetches a thread with its full message list (chronological), topic
 * assignments, and deterministic impact tags. Returns null if the thread
 * doesn't exist -- callers should 404.
 */
export async function getThreadById(db: D1Database, id: number): Promise<ThreadDetail | null> {
  const threadRow = await db
    .prepare(
      `SELECT id, root_message_id, canonical_subject, display_subject, mailing_list, thread_type,
              patch_version, patch_total, author_name, source_url, first_posted_at, last_activity_at,
              message_count, review_state, summary_state, created_at, updated_at
       FROM threads WHERE id = ?`,
    )
    .bind(id)
    .first<ThreadRow>();

  if (!threadRow) return null;

  const [messagesResult, topicsResult, impactRow] = await Promise.all([
    db
      .prepare(
        `SELECT id, message_id, thread_id, parent_message_id, subject, canonical_subject, author_name,
                author_email_hash, mailing_list, message_type, posted_at, source_url, body_text,
                body_checksum, raw_object_key, created_at, updated_at
         FROM messages WHERE thread_id = ? ORDER BY posted_at ASC`,
      )
      .bind(id)
      .all<MessageRow>(),
    db
      .prepare(
        `SELECT tp.slug, tp.name, tt.score, tt.matched_by_json, tt.is_manual
         FROM thread_topics tt JOIN topics tp ON tp.id = tt.topic_id
         WHERE tt.thread_id = ? ORDER BY tt.score DESC`,
      )
      .bind(id)
      .all<ThreadTopicRow>(),
    db
      .prepare(
        `SELECT thread_id, affected_layers_json, likely_stakeholders_json, suggested_action, matched_by_json, generated_at
         FROM thread_impact WHERE thread_id = ?`,
      )
      .bind(id)
      .first<ThreadImpactRow>(),
  ]);

  return {
    thread: rowToThread(threadRow),
    messages: messagesResult.results.map(rowToMessage),
    topics: topicsResult.results.map((row) => ({
      slug: row.slug,
      name: row.name,
      score: row.score,
      matchedBy: JSON.parse(row.matched_by_json) as string[],
      isManual: row.is_manual === 1,
    })),
    impact: impactRow ? rowToImpact(impactRow) : null,
  };
}
