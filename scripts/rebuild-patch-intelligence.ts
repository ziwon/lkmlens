#!/usr/bin/env tsx
/**
 * Backfills v0.2 patch intelligence for messages collected before migration
 * 0004: patch x/y metadata, series/revision links, change notes, and explicit
 * review trailers. Idempotent and safe to rerun.
 */

import { createHash } from "node:crypto";
import {
  extractFilePaths,
  extractReviewSignals,
  extractRevisionNotes,
  makeSeriesKey,
  parsePatchInfo,
  summarizeFileChanges,
} from "@lkmlens/thread-builder";
import { execD1File, parseD1Target, queryD1, sqlNumber, sqlString } from "./lib/d1.js";

interface MessageRow {
  thread_id: number;
  message_id: string;
  subject: string;
  body_text: string;
  source_url: string;
  is_root: number;
}

interface RevisionDraft {
  threadId: number;
  key: string;
  subject: string;
  version: number;
  body: string;
}

function emailHash(email: string | null): string | null {
  return email ? createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 32) : null;
}

function main() {
  const target = parseD1Target(process.argv);
  const rows = queryD1<MessageRow>(
    `SELECT m.thread_id, m.message_id, m.subject, COALESCE(m.body_text, '') AS body_text,
            m.source_url, CASE WHEN m.message_id = t.root_message_id THEN 1 ELSE 0 END AS is_root
     FROM messages m JOIN threads t ON t.id = m.thread_id ORDER BY m.posted_at ASC`,
    target,
  );
  const statements: string[] = [];
  const revisions: RevisionDraft[] = [];

  for (const row of rows) {
    const patch = parsePatchInfo(row.subject);
    statements.push(`UPDATE messages SET patch_index = ${sqlNumber(patch.patchIndex)}, patch_total = ${sqlNumber(patch.patchTotal)} WHERE message_id = ${sqlString(row.message_id)};`);

    for (const signal of extractReviewSignals(row.body_text)) {
      statements.push(`INSERT INTO review_signals (thread_id, message_id, signal_type, person_name, person_email_hash, source_url)
VALUES (${row.thread_id}, ${sqlString(row.message_id)}, ${sqlString(signal.type)}, ${sqlString(signal.personName)}, ${sqlString(emailHash(signal.email))}, ${sqlString(row.source_url)})
ON CONFLICT(message_id, signal_type, person_name) DO NOTHING;`);
    }

    if (row.is_root === 1) {
      statements.push(`UPDATE threads SET thread_type = ${sqlString(patch.threadType)}, patch_version = ${sqlNumber(patch.version)}, patch_total = ${sqlNumber(patch.patchTotal)} WHERE id = ${row.thread_id};`);
      if (patch.version != null) {
        revisions.push({ threadId: row.thread_id, key: makeSeriesKey(row.subject), subject: row.subject, version: patch.version, body: row.body_text });
      }
    }
  }

  const bySeries = new Map<string, RevisionDraft[]>();
  for (const revision of revisions) {
    const bucket = bySeries.get(revision.key) ?? [];
    bucket.push(revision);
    bySeries.set(revision.key, bucket);
  }
  for (const [key, series] of bySeries) {
    series.sort((a, b) => a.version - b.version);
    const latest = series.at(-1);
    if (!latest) continue;
    statements.push(`INSERT INTO patch_series (series_key, canonical_subject, latest_version, latest_thread_id)
VALUES (${sqlString(key)}, ${sqlString(key)}, ${latest.version}, ${latest.threadId})
ON CONFLICT(series_key) DO UPDATE SET latest_version = excluded.latest_version, latest_thread_id = excluded.latest_thread_id;`);

    let previousPaths: string[] = [];
    for (const revision of series) {
      const currentPaths = extractFilePaths(revision.body);
      const notes = extractRevisionNotes(revision.body)
        ?? (previousPaths.length > 0 ? summarizeFileChanges(previousPaths, currentPaths) : null);
      statements.push(`INSERT INTO patch_revisions (series_id, version, thread_id, change_notes)
VALUES ((SELECT id FROM patch_series WHERE series_key = ${sqlString(key)}), ${revision.version}, ${revision.threadId}, ${sqlString(notes)})
ON CONFLICT(series_id, version) DO UPDATE SET thread_id = excluded.thread_id, change_notes = COALESCE(excluded.change_notes, patch_revisions.change_notes);`);
      previousPaths = currentPaths;
    }
  }

  if (statements.length === 0) {
    console.log("No messages to process.");
    return;
  }
  execD1File(statements.join("\n"), target, `Rebuilding patch intelligence for ${rows.length} message(s)`);
  console.log(`Done. Linked ${revisions.length} patch revision(s) across ${bySeries.size} series.`);
}

main();
