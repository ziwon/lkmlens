#!/usr/bin/env tsx
/**
 * Rebuilds the message_search FTS5 table from canonical tables
 * (messages, threads, thread_topics, topics). See docs/PLANNING.md
 * section 7.6 ("FTS5 tables are derived indexes and must be rebuildable")
 * and section 16 (Backup strategy, step 5: "Recreate FTS5 tables").
 *
 * Usage:
 *   tsx scripts/rebuild-fts.ts --local
 *   tsx scripts/rebuild-fts.ts --remote
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const DB_NAME = "lkmlens";

const SQL = `
DELETE FROM message_search;

INSERT INTO message_search (message_id, subject, body_text, author_name, mailing_list, topic_names)
SELECT
  m.message_id,
  m.subject,
  m.body_text,
  m.author_name,
  m.mailing_list,
  (
    SELECT group_concat(tp.name, ', ')
    FROM thread_topics tt
    JOIN topics tp ON tp.id = tt.topic_id
    WHERE tt.thread_id = m.thread_id
  )
FROM messages m;
`.trim();

function main() {
  const target = process.argv.includes("--remote")
    ? "--remote"
    : process.argv.includes("--local")
      ? "--local"
      : null;

  if (!target) {
    console.error("Usage: tsx scripts/rebuild-fts.ts --local | --remote");
    process.exit(1);
  }

  const dir = mkdtempSync(join(tmpdir(), "lkmlens-rebuild-fts-"));
  const file = join(dir, "rebuild-fts.sql");
  writeFileSync(file, SQL, "utf8");

  console.log(`Rebuilding message_search (${target.slice(2)}) via ${file} ...`);

  const result = spawnSync(
    "wrangler",
    ["d1", "execute", DB_NAME, target, "--file", file],
    { stdio: "inherit" },
  );

  if (result.status !== 0) {
    console.error("wrangler d1 execute failed");
    process.exit(result.status ?? 1);
  }

  console.log("Done.");
}

main();
