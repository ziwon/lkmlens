-- Unique natural key for impact_rules, so seeding can upsert instead of
-- replacing the table wholesale.
--
-- listCurationChannels() reads impact_rules at request time to build the
-- vendor channel list. The previous seed did DELETE-then-INSERT, which left a
-- window where a request could observe zero vendor channels. With this index
-- the seed can upsert every rule first and only then drop rows that are no
-- longer in config, so readers always see the old set, the new set, or their
-- union -- never an empty one.
--
-- vendor is nullable (subsystem rules name no vendor) and SQLite treats NULLs
-- as distinct in a unique index, so the key coalesces it to '' to make those
-- rows conflict-detectable too.

CREATE UNIQUE INDEX idx_impact_rules_natural_key
    ON impact_rules(rule_type, pattern, layer, COALESCE(vendor, ''));
