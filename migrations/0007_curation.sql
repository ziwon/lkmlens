-- Product-signal curation: preserve vendor matches and record observed
-- integration milestones without predicting merge or release outcomes.

ALTER TABLE thread_impact ADD COLUMN vendors_json TEXT NOT NULL DEFAULT '[]';

CREATE TABLE patch_lifecycle (
    series_id INTEGER PRIMARY KEY,
    maintainer_tree TEXT,
    maintainer_tree_url TEXT,
    mainline_commit TEXT,
    mainline_commit_url TEXT,
    mainline_merged_at TEXT,
    linux_version TEXT,
    stable_versions_json TEXT NOT NULL DEFAULT '[]',
    android_common_branches_json TEXT NOT NULL DEFAULT '[]',
    source_urls_json TEXT NOT NULL DEFAULT '[]',
    checked_at TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (series_id) REFERENCES patch_series(id) ON DELETE CASCADE
);

CREATE TRIGGER patch_lifecycle_set_updated_at
AFTER UPDATE ON patch_lifecycle
FOR EACH ROW
BEGIN
    UPDATE patch_lifecycle SET updated_at = CURRENT_TIMESTAMP WHERE series_id = NEW.series_id;
END;
