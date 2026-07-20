import type { D1Database } from "@cloudflare/workers-types";
import type { Digest, DigestContent, DigestPeriod } from "@lkmlens/shared";

interface DigestRow {
  id: number;
  period_type: DigestPeriod;
  period_key: string;
  title: string;
  content_json: string;
  source_thread_ids_json: string;
  generated_at: string;
  published_at: string | null;
}

function rowToDigest(row: DigestRow): Digest {
  return {
    id: row.id,
    periodType: row.period_type,
    periodKey: row.period_key,
    title: row.title,
    content: JSON.parse(row.content_json) as DigestContent,
    sourceThreadIds: JSON.parse(row.source_thread_ids_json) as number[],
    generatedAt: row.generated_at,
    publishedAt: row.published_at,
  };
}

export interface DigestCandidateRow {
  threadId: number;
  subject: string;
  sourceUrl: string;
  messageCount: number;
  lastActivityAt: string | null;
  topicSlugs: string | null;
  topicNames: string | null;
  summaryJson: string | null;
}

export async function listDigestCandidates(
  db: D1Database,
  startInclusive: string,
  endExclusive: string,
): Promise<DigestCandidateRow[]> {
  const { results } = await db.prepare(
    `SELECT t.id AS threadId, t.display_subject AS subject, t.source_url AS sourceUrl,
            t.message_count AS messageCount, t.last_activity_at AS lastActivityAt,
            (SELECT group_concat(tp.slug, '|') FROM thread_topics tt JOIN topics tp ON tp.id = tt.topic_id
             WHERE tt.thread_id = t.id) AS topicSlugs,
            (SELECT group_concat(tp.name, '|') FROM thread_topics tt JOIN topics tp ON tp.id = tt.topic_id
             WHERE tt.thread_id = t.id) AS topicNames,
            (SELECT s.content_json FROM summaries s WHERE s.thread_id = t.id
             AND s.summary_type = 'thread' AND s.is_current = 1 LIMIT 1) AS summaryJson
     FROM threads t
     WHERE t.last_activity_at >= ? AND t.last_activity_at < ?
     ORDER BY t.message_count DESC, t.last_activity_at DESC LIMIT 100`,
  ).bind(startInclusive, endExclusive).all<DigestCandidateRow>();
  return results;
}

export async function upsertDigest(
  db: D1Database,
  periodType: DigestPeriod,
  periodKey: string,
  title: string,
  content: DigestContent,
): Promise<void> {
  const threadIds = content.threads.map((thread) => thread.threadId);
  await db.prepare(
    `INSERT INTO digests (period_type, period_key, title, content_json, source_thread_ids_json, published_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(period_type, period_key) DO UPDATE SET
       title = excluded.title, content_json = excluded.content_json,
       source_thread_ids_json = excluded.source_thread_ids_json,
       generated_at = CURRENT_TIMESTAMP, published_at = CURRENT_TIMESTAMP`,
  ).bind(periodType, periodKey, title, JSON.stringify(content), JSON.stringify(threadIds)).run();
}

export async function getDigest(db: D1Database, periodType: DigestPeriod, periodKey: string): Promise<Digest | null> {
  const row = await db.prepare(
    `SELECT id, period_type, period_key, title, content_json, source_thread_ids_json, generated_at, published_at
     FROM digests WHERE period_type = ? AND period_key = ? AND published_at IS NOT NULL`,
  ).bind(periodType, periodKey).first<DigestRow>();
  return row ? rowToDigest(row) : null;
}

export async function listDigests(db: D1Database, limit = 10): Promise<Digest[]> {
  const { results } = await db.prepare(
    `SELECT id, period_type, period_key, title, content_json, source_thread_ids_json, generated_at, published_at
     FROM digests WHERE published_at IS NOT NULL ORDER BY published_at DESC LIMIT ?`,
  ).bind(Math.max(1, Math.min(limit, 30))).all<DigestRow>();
  return results.map(rowToDigest);
}
