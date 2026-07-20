#!/usr/bin/env tsx
/**
 * Bounded backfill of one lore.kernel.org mailing list via a local git
 * mirror (see @lkmlens/lore-client — HTTP scraping is disallowed by
 * lore.kernel.org/robots.txt, so this uses the officially-sanctioned
 * git-mirroring path instead).
 *
 * Idempotent and incremental: tracks the last-processed git commit SHA in
 * collection_checkpoints, so re-running only pulls in new messages.
 *
 * KNOWN LIMITATION: thread grouping (@lkmlens/thread-builder) only sees the
 * messages fetched in the *current* run. A reply arriving in a later run
 * whose parent was ingested in an earlier run will not be attached to the
 * existing thread — it will start a new "partial-confidence" thread of its
 * own. Merging incremental replies into existing threads is not yet
 * implemented; this script is scoped to prove one-source ingestion
 * end-to-end (docs/PLANNING.md section 24 item 8), not continuous
 * collection (that's the collector/indexer Workers' job, still stubs).
 *
 * Usage:
 *   tsx scripts/backfill.ts --inbox rust-for-linux --local
 *   tsx scripts/backfill.ts --inbox rust-for-linux --epoch 0 --max 200 --remote
 */

import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseMessage, type ParsedMessage } from "@lkmlens/mail-parser";
import { syncMirror, readMirrorCommits } from "@lkmlens/lore-client";
import { buildThreads, dedupeByMessageId, parsePatchInfo, type ThreadDraft } from "@lkmlens/thread-builder";
import { classifyMessage, type TopicRuleSet } from "@lkmlens/classifier";
import { execD1File, parseD1Target, queryD1, sqlNumber, sqlString, type D1Target } from "./lib/d1.js";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIRROR_BASE_DIR = join(REPO_ROOT, ".data", "mirrors");
const DEFAULT_MAX_INITIAL_MESSAGES = 200;
const DEFAULT_SHALLOW_SINCE_DAYS = 30;
// Some patch emails carry huge diffs or embedded binary blobs (seen up to
// ~450KB raw on dri-devel) that trip D1/SQLite's per-statement size limit
// ("statement too long: SQLITE_TOOBIG") and add little FTS relevance beyond
// this point anyway. Large raw bodies are a good fit for R2 later
// (docs/PLANNING.md section 7.7); for now, cap what goes into D1.
const MAX_BODY_CHARS = 20_000;

interface Args {
  inbox: string;
  epoch: number;
  target: D1Target;
  max: number;
}

function parseArgs(argv: string[]): Args {
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i === -1 ? undefined : argv[i + 1];
  };
  const inbox = get("--inbox");
  if (!inbox) {
    console.error("Usage: tsx scripts/backfill.ts --inbox <list> [--epoch 0] [--max 200] --local|--remote");
    process.exit(1);
  }
  return {
    inbox,
    epoch: Number(get("--epoch") ?? "0"),
    target: parseD1Target(argv),
    max: Number(get("--max") ?? DEFAULT_MAX_INITIAL_MESSAGES),
  };
}

function sourceUrl(mailingList: string | null, messageId: string, fallbackInbox: string): string {
  const list = mailingList ?? fallbackInbox;
  return `https://lore.kernel.org/${list}/${messageId}/`;
}

function emailHash(email: string | undefined | null): string | null {
  if (!email) return null;
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 32);
}

function messageType(parsed: ParsedMessage, isThreadRoot: boolean): string {
  const info = parsePatchInfo(parsed.subject);
  if (info.isCoverLetter) return "cover_letter";
  if (info.threadType === "patch" || info.threadType === "rfc") return "patch";
  if (!isThreadRoot) return "reply";
  return "unknown";
}

function buildThreadSql(thread: ThreadDraft, inbox: string): string {
  return `
INSERT INTO threads (
  root_message_id, canonical_subject, display_subject, mailing_list, thread_type,
  patch_version, patch_total, author_name, source_url, first_posted_at, last_activity_at,
  message_count, summary_state
) VALUES (
  ${sqlString(thread.rootMessageId)}, ${sqlString(thread.canonicalSubject)}, ${sqlString(thread.displaySubject)},
  ${sqlString(thread.mailingList)}, ${sqlString(thread.threadType)}, ${sqlNumber(thread.patchVersion)},
  ${sqlNumber(thread.patchTotal)}, ${sqlString(thread.authorName)},
  ${sqlString(sourceUrl(thread.mailingList, thread.rootMessageId, inbox))},
  ${sqlString(thread.firstPostedAt)}, ${sqlString(thread.lastActivityAt)}, ${thread.messageIds.length}, 'pending'
)
ON CONFLICT(root_message_id) DO UPDATE SET
  last_activity_at = MAX(threads.last_activity_at, excluded.last_activity_at),
  message_count = threads.message_count + excluded.message_count;`;
}

function truncateBody(bodyText: string): string {
  if (bodyText.length <= MAX_BODY_CHARS) return bodyText;
  return `${bodyText.slice(0, MAX_BODY_CHARS)}\n\n[... truncated, ${bodyText.length - MAX_BODY_CHARS} more characters]`;
}

function buildMessageSql(parsed: ParsedMessage, rootMessageId: string, isThreadRoot: boolean, inbox: string): string {
  const body = truncateBody(parsed.bodyText);
  const checksum = createHash("sha256").update(body).digest("hex");
  return `
INSERT INTO messages (
  message_id, thread_id, parent_message_id, subject, canonical_subject, author_name,
  author_email_hash, mailing_list, message_type, posted_at, source_url, body_text,
  body_checksum, raw_object_key
) VALUES (
  ${sqlString(parsed.messageId)},
  (SELECT id FROM threads WHERE root_message_id = ${sqlString(rootMessageId)}),
  ${sqlString(parsed.inReplyTo)}, ${sqlString(parsed.subject)}, ${sqlString(parsed.subject)},
  ${sqlString(parsed.from?.name ?? parsed.from?.email ?? null)}, ${sqlString(emailHash(parsed.from?.email))},
  ${sqlString(parsed.mailingList)}, ${sqlString(messageType(parsed, isThreadRoot))}, ${sqlString(parsed.postedAt)},
  ${sqlString(sourceUrl(parsed.mailingList, parsed.messageId, inbox))}, ${sqlString(body)}, ${sqlString(checksum)}, NULL
)
ON CONFLICT(message_id) DO NOTHING;`;
}

function buildThreadTopicSql(rootMessageId: string, topicSlug: string, score: number, matchedBy: string[]): string {
  return `
INSERT INTO thread_topics (thread_id, topic_id, score, matched_by_json, is_manual)
VALUES (
  (SELECT id FROM threads WHERE root_message_id = ${sqlString(rootMessageId)}),
  (SELECT id FROM topics WHERE slug = ${sqlString(topicSlug)}),
  ${score}, ${sqlString(JSON.stringify(matchedBy))}, 0
)
ON CONFLICT(thread_id, topic_id) DO UPDATE SET
  score = excluded.score, matched_by_json = excluded.matched_by_json
WHERE thread_topics.is_manual = 0;`;
}

const REBUILD_FTS_SQL = `
DELETE FROM message_search;
INSERT INTO message_search (message_id, subject, body_text, author_name, mailing_list, topic_names)
SELECT m.message_id, m.subject, m.body_text, m.author_name, m.mailing_list,
  (SELECT group_concat(tp.name, ', ') FROM thread_topics tt JOIN topics tp ON tp.id = tt.topic_id WHERE tt.thread_id = m.thread_id)
FROM messages m;`;

interface CheckpointRow {
  cursor: string | null;
}

function fetchTopicRuleSets(target: D1Target): TopicRuleSet[] {
  const rows = queryD1<{
    topic_slug: string;
    rule_type: TopicRuleSet["rules"][number]["ruleType"];
    pattern: string;
    weight: number;
    is_negative: number;
  }>(
    `SELECT t.slug AS topic_slug, r.rule_type, r.pattern, r.weight, r.is_negative
     FROM topic_rules r JOIN topics t ON t.id = r.topic_id
     WHERE t.enabled = 1 AND r.enabled = 1`,
    target,
  );

  const bySlug = new Map<string, TopicRuleSet>();
  for (const row of rows) {
    const set = bySlug.get(row.topic_slug) ?? { topicSlug: row.topic_slug, rules: [] };
    set.rules.push({
      id: 0,
      topicId: 0,
      ruleType: row.rule_type,
      pattern: row.pattern,
      weight: row.weight,
      isNegative: row.is_negative === 1,
      enabled: true,
    });
    bySlug.set(row.topic_slug, set);
  }
  return Array.from(bySlug.values());
}

function main() {
  const args = parseArgs(process.argv);
  const sourceKey = `${args.inbox}/${args.epoch}`;
  const shallowSince = new Date(Date.now() - DEFAULT_SHALLOW_SINCE_DAYS * 86400_000)
    .toISOString()
    .slice(0, 10);

  console.log(`Syncing mirror for ${args.inbox} epoch ${args.epoch} ...`);
  const { path: mirrorDir, created } = syncMirror(
    MIRROR_BASE_DIR,
    { inbox: args.inbox, epoch: args.epoch },
    { shallowSince },
  );
  console.log(created ? `Cloned to ${mirrorDir}` : `Fetched updates into ${mirrorDir}`);

  const checkpoint = queryD1<CheckpointRow>(
    `SELECT cursor FROM collection_checkpoints WHERE source_key = ${sqlString(sourceKey)}`,
    args.target,
  )[0];

  const commits = readMirrorCommits(mirrorDir, {
    sinceSha: checkpoint?.cursor ?? undefined,
    maxCount: checkpoint?.cursor ? undefined : args.max,
  });

  if (commits.length === 0) {
    console.log("No new commits since last checkpoint. Nothing to do.");
    return;
  }
  console.log(`Found ${commits.length} new commit(s).`);

  const parsedByMessageId = new Map<string, ParsedMessage>();
  let lastSha = checkpoint?.cursor ?? null;
  for (const commit of commits) {
    const parsed = parseMessage(commit.raw);
    if (!parsed.messageId) {
      console.warn(`Skipping commit ${commit.sha}: no Message-ID`);
      continue;
    }
    parsedByMessageId.set(parsed.messageId, parsed);
    lastSha = commit.sha;
  }

  const messages = dedupeByMessageId(Array.from(parsedByMessageId.values()));
  const { threads } = buildThreads(messages);
  const topicRuleSets = fetchTopicRuleSets(args.target);

  console.log(`Parsed ${messages.length} message(s) into ${threads.length} thread(s).`);

  const statements: string[] = [];
  let lastMessageAt: string | null = null;

  for (const thread of threads) {
    statements.push(buildThreadSql(thread, args.inbox));

    for (const messageId of thread.messageIds) {
      const parsed = parsedByMessageId.get(messageId);
      if (!parsed) continue;
      statements.push(buildMessageSql(parsed, thread.rootMessageId, messageId === thread.rootMessageId, args.inbox));
      if (parsed.postedAt && (!lastMessageAt || parsed.postedAt > lastMessageAt)) {
        lastMessageAt = parsed.postedAt;
      }
    }

    const rootMessage = parsedByMessageId.get(thread.rootMessageId);
    if (rootMessage) {
      const matches = classifyMessage(
        { subject: rootMessage.subject, mailingList: rootMessage.mailingList, bodyText: rootMessage.bodyText },
        topicRuleSets,
      );
      for (const match of matches) {
        statements.push(buildThreadTopicSql(thread.rootMessageId, match.topic, match.score, match.matchedBy));
      }
    }
  }

  statements.push(`
INSERT INTO collection_checkpoints (source_key, last_message_at, cursor, last_success_at, failure_count, last_error)
VALUES (${sqlString(sourceKey)}, ${sqlString(lastMessageAt)}, ${sqlString(lastSha)}, CURRENT_TIMESTAMP, 0, NULL)
ON CONFLICT(source_key) DO UPDATE SET
  last_message_at = excluded.last_message_at, cursor = excluded.cursor,
  last_success_at = excluded.last_success_at, failure_count = 0, last_error = NULL;`);

  statements.push(REBUILD_FTS_SQL);

  execD1File(statements.join("\n"), args.target, `Ingesting ${messages.length} message(s)`);
  console.log("Done.");
}

main();
