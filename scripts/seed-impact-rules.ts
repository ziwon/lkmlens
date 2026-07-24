#!/usr/bin/env tsx
/**
 * Seeds impact_rules: file-path/subject-prefix -> affected layer + likely
 * stakeholders, for deterministic patch-impact tagging (see
 * packages/impact). Idempotent: rules are fully replaced on every run, so
 * this script is the source of truth for the *default* rule set.
 *
 * Rule definitions live in config/vendors/*.yaml (per-vendor curated
 * watchlists) and config/subsystems/*.yaml (non-vendor kernel subsystems)
 * — see scripts/lib/config.ts. Editing the watchlist (e.g. adding a vendor
 * or tuning tracked areas) is a YAML change, not a TypeScript one.
 *
 * Usage:
 *   tsx scripts/seed-impact-rules.ts --local
 *   tsx scripts/seed-impact-rules.ts --remote
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execD1File, parseD1Target, sqlString } from "./lib/d1.js";
import {
  loadSubsystemRules,
  loadVendorProfiles,
  loadVendorRules,
  type RuleSeed,
  type VendorProfileSeed,
} from "./lib/config.js";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_DIR = join(REPO_ROOT, "config");

function loadAllRules(): RuleSeed[] {
  return [
    ...loadVendorRules(join(CONFIG_DIR, "vendors")),
    ...loadSubsystemRules(join(CONFIG_DIR, "subsystems")),
  ];
}

/** Separator for the composite key used to identify rows dropped from config. */
const KEY_SEP = "|";

function naturalKey(rule: RuleSeed): string {
  const parts = [rule.type, rule.pattern, rule.layer, rule.vendor ?? ""];
  if (parts.some((part) => part.includes(KEY_SEP))) {
    throw new Error(
      `rule field contains ${KEY_SEP}, which the stale-row key relies on as a separator: ${parts.join(" ")}`,
    );
  }
  return parts.join(KEY_SEP);
}

/**
 * Upsert everything from config first, then drop only the rows config no
 * longer defines.
 *
 * listCurationChannels() reads impact_rules at request time, so a
 * DELETE-then-INSERT seed would briefly serve zero vendor channels. Ordering
 * it this way means a concurrent request sees the old rows, the new rows, or
 * their union -- never an empty table.
 */
function buildSql(rules: RuleSeed[], profiles: VendorProfileSeed[]): string {
  const lines: string[] = [];

  for (const rule of rules) {
    lines.push(
      `INSERT INTO impact_rules (rule_type, pattern, layer, vendor, stakeholders_json, enabled)
       VALUES (
         ${sqlString(rule.type)},
         ${sqlString(rule.pattern)},
         ${sqlString(rule.layer)},
         ${sqlString(rule.vendor)},
         ${sqlString(JSON.stringify(rule.stakeholders))},
         1
       )
       ON CONFLICT(rule_type, pattern, layer, COALESCE(vendor, '')) DO UPDATE SET
         stakeholders_json = excluded.stakeholders_json,
         enabled = 1;`,
    );
  }

  for (const profile of profiles) {
    lines.push(
      `INSERT INTO vendor_profiles (vendor, description)
       VALUES (${sqlString(profile.vendor)}, ${sqlString(profile.description)})
       ON CONFLICT(vendor) DO UPDATE SET description = excluded.description;`,
    );
  }

  const ruleKeys = rules.map((rule) => sqlString(naturalKey(rule))).join(", ");
  lines.push(
    `DELETE FROM impact_rules
     WHERE rule_type || ${sqlString(KEY_SEP)} || pattern || ${sqlString(KEY_SEP)} || layer
           || ${sqlString(KEY_SEP)} || COALESCE(vendor, '') NOT IN (${ruleKeys});`,
  );

  const profileVendors = profiles.map((profile) => sqlString(profile.vendor)).join(", ");
  lines.push(`DELETE FROM vendor_profiles WHERE vendor NOT IN (${profileVendors});`);

  return lines.join("\n");
}

function main() {
  const target = parseD1Target(process.argv);
  const rules = loadAllRules();
  const profiles = loadVendorProfiles(join(CONFIG_DIR, "vendors"));
  console.log(`Loaded ${rules.length} rule(s) and ${profiles.length} vendor profile(s) from ${CONFIG_DIR}`);
  execD1File(
    buildSql(rules, profiles),
    target,
    `Seeding ${rules.length} impact rules and ${profiles.length} vendor profiles`,
  );
  console.log("Done.");
}

main();
