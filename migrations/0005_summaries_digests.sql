-- Phase 3 / v0.3: bounded evidence-linked summaries and published digests.

ALTER TABLE summaries ADD COLUMN source_set_checksum TEXT;
UPDATE summaries SET is_current = 0
WHERE is_current = 1 AND id NOT IN (
  SELECT MAX(id) FROM summaries WHERE is_current = 1 GROUP BY thread_id, summary_type
);
CREATE UNIQUE INDEX idx_summaries_current_type
    ON summaries(thread_id, summary_type)
    WHERE is_current = 1;

CREATE TABLE digests (
    id INTEGER PRIMARY KEY,
    period_type TEXT NOT NULL,
    period_key TEXT NOT NULL,
    title TEXT NOT NULL,
    content_json TEXT NOT NULL,
    source_thread_ids_json TEXT NOT NULL,
    generated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TEXT,
    UNIQUE(period_type, period_key)
);

CREATE INDEX idx_digests_period ON digests(period_type, period_key DESC);
