/**
 * Loads deterministic patch-impact watchlist config from config/vendors/
 * and config/subsystems/ (YAML), converting it into the same rule-seed
 * shape scripts/seed-impact-rules.ts writes to impact_rules.
 *
 * This is what makes the watchlist editable without touching code: adding
 * or tuning a vendor's tracked kernel areas is a YAML PR, not a TypeScript
 * change. See docs/PLANNING.md section 5, which specs exactly this kind of
 * YAML-editable config for topics — this applies the same idea to
 * per-vendor impact tracking.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

export interface RuleSeed {
  type: "file_path" | "subject_prefix";
  pattern: string;
  layer: string;
  vendor: string | null;
  stakeholders: string[];
}

/** Vendor channel copy, kept alongside the rules it describes. */
export interface VendorProfileSeed {
  vendor: string;
  description: string;
}

interface VendorAreaYaml {
  name: string;
  layer?: string;
  file_patterns?: string[];
  subject_patterns?: string[];
  stakeholders: string[];
}

interface VendorYaml {
  vendor: string;
  description?: string;
  areas: VendorAreaYaml[];
}

interface SubsystemYaml {
  layer: string;
  vendor?: string | null;
  file_patterns?: string[];
  subject_patterns?: string[];
  stakeholders: string[];
}

function readYamlFiles<T>(dir: string): { file: string; data: T }[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
    .sort()
    .map((file) => ({ file, data: parseYaml(readFileSync(join(dir, file), "utf8")) as T }));
}

function rulesFromPatterns(
  filePatterns: string[] | undefined,
  subjectPatterns: string[] | undefined,
  layer: string,
  vendor: string | null,
  stakeholders: string[],
  source: string,
): RuleSeed[] {
  const rules: RuleSeed[] = [];
  for (const pattern of filePatterns ?? []) {
    rules.push({ type: "file_path", pattern, layer, vendor, stakeholders });
  }
  for (const pattern of subjectPatterns ?? []) {
    rules.push({ type: "subject_prefix", pattern, layer, vendor, stakeholders });
  }
  if (rules.length === 0) {
    throw new Error(`${source}: "${layer}" has no file_patterns or subject_patterns`);
  }
  return rules;
}

export function loadVendorRules(dir: string): RuleSeed[] {
  const rules: RuleSeed[] = [];

  for (const { file, data } of readYamlFiles<VendorYaml>(dir)) {
    if (!data.vendor || !Array.isArray(data.areas) || data.areas.length === 0) {
      throw new Error(`${file}: expected "vendor" and a non-empty "areas" list`);
    }
    for (const area of data.areas) {
      if (!area.name || !Array.isArray(area.stakeholders) || area.stakeholders.length === 0) {
        throw new Error(`${file}: area is missing "name" or "stakeholders"`);
      }
      const layer = area.layer ?? `${data.vendor} — ${area.name}`;
      rules.push(
        ...rulesFromPatterns(
          area.file_patterns,
          area.subject_patterns,
          layer,
          data.vendor,
          area.stakeholders,
          `${file} (${area.name})`,
        ),
      );
    }
  }

  return rules;
}

/**
 * Reads the per-vendor `description` from the same YAML that defines the
 * rules. Vendors without one are skipped rather than given filler copy — the
 * UI omits the line instead of repeating a generic sentence.
 */
export function loadVendorProfiles(dir: string): VendorProfileSeed[] {
  const profiles: VendorProfileSeed[] = [];

  for (const { file, data } of readYamlFiles<VendorYaml>(dir)) {
    if (!data.vendor) throw new Error(`${file}: expected "vendor"`);
    const description = data.description?.trim().replace(/\s+/g, " ");
    if (description) profiles.push({ vendor: data.vendor, description });
  }

  return profiles;
}

export function loadSubsystemRules(dir: string): RuleSeed[] {
  const rules: RuleSeed[] = [];

  for (const { file, data } of readYamlFiles<SubsystemYaml>(dir)) {
    if (!data.layer || !Array.isArray(data.stakeholders) || data.stakeholders.length === 0) {
      throw new Error(`${file}: expected "layer" and a non-empty "stakeholders" list`);
    }
    rules.push(
      ...rulesFromPatterns(
        data.file_patterns,
        data.subject_patterns,
        data.layer,
        data.vendor ?? null,
        data.stakeholders,
        file,
      ),
    );
  }

  return rules;
}
