-- Deterministic patch-impact tagging: file-path/subject-prefix -> affected
-- layer + likely stakeholders. This is a separate dimension from
-- topic_rules (which decide *which of the 9 broad topics* a thread
-- belongs to) -- a finer, vendor/subsystem-level classification aimed at
-- practitioners who aren't kernel developers themselves (e.g. BSP/platform
-- integration engineers who need to know "does this affect my vendor
-- tree, and who should I loop in").
--
-- Deterministic only, no AI/LLM involved -- matches docs/PLANNING.md's
-- "search before AI" / "evidence before interpretation" principles. An AI
-- layer (generated "what changed" / "why it matters" prose) is a later
-- milestone; this table only stores rule-matched, explainable facts.

CREATE TABLE impact_rules (
    id INTEGER PRIMARY KEY,
    rule_type TEXT NOT NULL,         -- 'file_path' | 'subject_prefix'
    pattern TEXT NOT NULL,           -- glob for file_path, substring for subject_prefix
    layer TEXT NOT NULL,             -- e.g. "GPU driver / display pipeline"
    vendor TEXT,                     -- e.g. "AMD", "Qualcomm" (nullable -- not every rule names a vendor)
    stakeholders_json TEXT NOT NULL, -- JSON array of strings
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_impact_rules_rule_type ON impact_rules(rule_type);

CREATE TABLE thread_impact (
    thread_id INTEGER PRIMARY KEY,
    affected_layers_json TEXT NOT NULL,
    likely_stakeholders_json TEXT NOT NULL,
    suggested_action TEXT,
    matched_by_json TEXT NOT NULL,
    generated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
);
