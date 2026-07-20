-- Phase 2 / v0.2: patch-series navigation and explicit review evidence.

ALTER TABLE threads ADD COLUMN root_confidence TEXT NOT NULL DEFAULT 'complete';
ALTER TABLE messages ADD COLUMN patch_index INTEGER;
ALTER TABLE messages ADD COLUMN patch_total INTEGER;

CREATE TABLE review_signals (
    id INTEGER PRIMARY KEY,
    thread_id INTEGER NOT NULL,
    message_id TEXT NOT NULL,
    signal_type TEXT NOT NULL,
    person_name TEXT NOT NULL,
    person_email_hash TEXT,
    source_url TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, signal_type, person_name),
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
);

CREATE INDEX idx_review_signals_thread_id ON review_signals(thread_id);
DROP INDEX idx_patch_revisions_thread_id;
CREATE UNIQUE INDEX idx_patch_revisions_thread_id ON patch_revisions(thread_id);
