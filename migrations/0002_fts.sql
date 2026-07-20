-- Derived, rebuildable full-text search index. See docs/PLANNING.md
-- section 8.8. This table is populated and kept in sync by application code
-- (the indexer Workflow, or scripts/rebuild-fts.ts) — not by SQL triggers —
-- so it can be dropped and recreated at any time from messages/threads/
-- thread_topics without losing canonical data.
--
-- tokenchars '_' keeps common kernel identifiers (sched_ext, io_uring,
-- rcu_read_lock) as single tokens instead of splitting on the underscore.
-- '.', '-', and '/' remain separators so file-path components and
-- hyphenated terms stay independently searchable. This choice is validated
-- against sample kernel subjects/symbols in scripts/validate-fts.ts —
-- revisit if real ingested data shows it's wrong.
CREATE VIRTUAL TABLE message_search USING fts5(
    message_id UNINDEXED,
    subject,
    body_text,
    author_name,
    mailing_list,
    topic_names,
    tokenize = "unicode61 remove_diacritics 2 tokenchars '_'"
);
