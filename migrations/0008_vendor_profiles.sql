-- Vendor channel copy.
--
-- Vendor channels are derived from impact_rules, which only stores matching
-- rules (pattern -> layer -> stakeholders) and has no room for prose. That
-- forced listCurationChannels() to synthesise one generic sentence per
-- vendor, so every vendor card in the UI read identically.
--
-- config/vendors/*.yaml already carries a curated `description` per vendor.
-- This table is where that copy lands, so the watchlist YAML stays the single
-- editable source of truth for both the rules and the channel description.
-- Seeded by scripts/seed-impact-rules.ts alongside impact_rules.

CREATE TABLE vendor_profiles (
    vendor TEXT PRIMARY KEY,         -- matches impact_rules.vendor exactly
    description TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
