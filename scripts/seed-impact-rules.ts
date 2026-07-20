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
import { loadSubsystemRules, loadVendorRules, type RuleSeed } from "./lib/config.js";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_DIR = join(REPO_ROOT, "config");

function loadAllRules(): RuleSeed[] {
  return [
    ...loadVendorRules(join(CONFIG_DIR, "vendors")),
    ...loadSubsystemRules(join(CONFIG_DIR, "subsystems")),
  ];
}

function buildSql(rules: RuleSeed[]): string {
  const lines: string[] = ["DELETE FROM impact_rules;"];

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
       );`,
    );
  }

  return lines.join("\n");
}

function main() {
  const target = parseD1Target(process.argv);
  const rules = loadAllRules();
  console.log(`Loaded ${rules.length} rule(s) from ${CONFIG_DIR}`);
  execD1File(buildSql(rules), target, `Seeding ${rules.length} impact rules`);
  console.log("Done.");
}

main();
