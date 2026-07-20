-- LKMLens initial schema.
-- Canonical relational tables only — no FTS5 virtual tables here, so this
-- migration can be replayed as part of the export/restore procedure in
-- docs/PLANNING.md section 16 ("Backup strategy") without special handling.
-- See docs/PLANNING.md section 8 (Data Model) for the authoritative design.

CREATE TABLE topics (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    enabled INTEGER NOT NULL DEFAULT 1,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER topics_set_updated_at
AFTER UPDATE ON topics
FOR EACH ROW
BEGIN
    UPDATE topics SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- rule_type: alias | subject | mailing_list | file_path | patch_prefix | body
CREATE TABLE topic_rules (
    id INTEGER PRIMARY KEY,
    topic_id INTEGER NOT NULL,
    rule_type TEXT NOT NULL,
    pattern TEXT NOT NULL,
    weight REAL NOT NULL DEFAULT 1.0,
    is_negative INTEGER NOT NULL DEFAULT 0,
    enabled INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE INDEX idx_topic_rules_topic_id ON topic_rules(topic_id);

-- thread_type: patch | rfc | pull_request | discussion | question | announcement | unknown
-- summary_state: pending | generated | stale | skipped
CREATE TABLE threads (
    id INTEGER PRIMARY KEY,
    root_message_id TEXT NOT NULL UNIQUE,
    canonical_subject TEXT NOT NULL,
    display_subject TEXT NOT NULL,
    mailing_list TEXT,
    thread_type TEXT,
    patch_version INTEGER,
    patch_total INTEGER,
    author_name TEXT,
    source_url TEXT NOT NULL,
    first_posted_at TEXT,
    last_activity_at TEXT,
    message_count INTEGER NOT NULL DEFAULT 0,
    review_state TEXT,
    summary_state TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_threads_mailing_list ON threads(mailing_list);
CREATE INDEX idx_threads_last_activity_at ON threads(last_activity_at);
CREATE INDEX idx_threads_thread_type ON threads(thread_type);

CREATE TRIGGER threads_set_updated_at
AFTER UPDATE ON threads
FOR EACH ROW
BEGIN
    UPDATE threads SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- message_type: patch | reply | cover_letter | unknown
CREATE TABLE messages (
    id INTEGER PRIMARY KEY,
    message_id TEXT NOT NULL UNIQUE,
    thread_id INTEGER,
    parent_message_id TEXT,
    subject TEXT NOT NULL,
    canonical_subject TEXT,
    author_name TEXT,
    author_email_hash TEXT,
    mailing_list TEXT,
    message_type TEXT,
    posted_at TEXT,
    source_url TEXT NOT NULL,
    body_text TEXT,
    body_checksum TEXT,
    raw_object_key TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE SET NULL
);

CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_parent_message_id ON messages(parent_message_id);
CREATE INDEX idx_messages_mailing_list ON messages(mailing_list);
CREATE INDEX idx_messages_posted_at ON messages(posted_at);

CREATE TRIGGER messages_set_updated_at
AFTER UPDATE ON messages
FOR EACH ROW
BEGIN
    UPDATE messages SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TABLE thread_topics (
    thread_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    score REAL NOT NULL,
    matched_by_json TEXT NOT NULL,
    is_manual INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (thread_id, topic_id),
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE INDEX idx_thread_topics_topic_id ON thread_topics(topic_id);

CREATE TRIGGER thread_topics_set_updated_at
AFTER UPDATE ON thread_topics
FOR EACH ROW
BEGIN
    UPDATE thread_topics SET updated_at = CURRENT_TIMESTAMP
    WHERE thread_id = NEW.thread_id AND topic_id = NEW.topic_id;
END;

CREATE TABLE patch_series (
    id INTEGER PRIMARY KEY,
    series_key TEXT NOT NULL UNIQUE,
    canonical_subject TEXT NOT NULL,
    latest_version INTEGER,
    latest_thread_id INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (latest_thread_id) REFERENCES threads(id) ON DELETE SET NULL
);

CREATE TRIGGER patch_series_set_updated_at
AFTER UPDATE ON patch_series
FOR EACH ROW
BEGIN
    UPDATE patch_series SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TABLE patch_revisions (
    series_id INTEGER NOT NULL,
    version INTEGER NOT NULL,
    thread_id INTEGER NOT NULL,
    change_notes TEXT,
    PRIMARY KEY (series_id, version),
    FOREIGN KEY (series_id) REFERENCES patch_series(id) ON DELETE CASCADE,
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
);

CREATE INDEX idx_patch_revisions_thread_id ON patch_revisions(thread_id);

-- human_review_state: unreviewed | confirmed | flagged
CREATE TABLE summaries (
    id INTEGER PRIMARY KEY,
    thread_id INTEGER NOT NULL,
    summary_type TEXT NOT NULL,
    content_json TEXT NOT NULL,
    model TEXT NOT NULL,
    prompt_version TEXT NOT NULL,
    source_message_ids_json TEXT NOT NULL,
    generated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_current INTEGER NOT NULL DEFAULT 1,
    human_review_state TEXT NOT NULL DEFAULT 'unreviewed',
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
);

CREATE INDEX idx_summaries_thread_id ON summaries(thread_id);
CREATE INDEX idx_summaries_thread_current ON summaries(thread_id, is_current);

-- Collection checkpoints (docs/PLANNING.md section 16).
CREATE TABLE collection_checkpoints (
    source_key TEXT PRIMARY KEY,
    last_message_at TEXT,
    cursor TEXT,
    last_success_at TEXT,
    failure_count INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
