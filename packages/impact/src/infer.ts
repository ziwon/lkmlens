/**
 * Deterministic patch-impact inference: maps changed file paths and subject
 * vendor prefixes to an affected layer + likely stakeholders, so a
 * non-kernel-developer practitioner (a BSP/platform integration engineer,
 * say) can tell at a glance whether a patch touches something they own —
 * without an LLM in the loop. No AI, no free-text generation: every output
 * traces back to a specific rule (matchedBy), same explainability
 * contract as @lkmlens/classifier's topic scoring.
 *
 * "Likely stakeholders" is deliberately phrased as roles/areas
 * ("Qualcomm platform integrators"), never invented org-chart specifics
 * ("the Qualcomm BSP team") we have no way of actually knowing.
 */

import { globMatch } from "@lkmlens/shared";
import { canonicalizeSubject } from "@lkmlens/thread-builder";

export type ImpactRuleType = "file_path" | "subject_prefix";

export interface ImpactRule {
  ruleType: ImpactRuleType;
  pattern: string;
  layer: string;
  vendor: string | null;
  stakeholders: string[];
  enabled: boolean;
}

export interface ImpactSubject {
  subject: string;
  filePaths: string[];
}

export interface InferredImpact {
  vendors: string[];
  affectedLayers: string[];
  likelyStakeholders: string[];
  matchedBy: string[];
  suggestedAction: string | null;
}

function matchRule(rule: ImpactRule, input: ImpactSubject): boolean {
  if (rule.ruleType === "file_path") {
    return input.filePaths.some((path) => globMatch(rule.pattern, path));
  }
  const stripped = canonicalizeSubject(input.subject).toLowerCase();
  return stripped.startsWith(rule.pattern.toLowerCase());
}

function describeMatch(rule: ImpactRule): string {
  const prefix = rule.ruleType === "file_path" ? "path" : "subject";
  return `${prefix}:${rule.pattern}`;
}

export function inferImpact(input: ImpactSubject, rules: ImpactRule[]): InferredImpact {
  const layers = new Set<string>();
  const vendors = new Set<string>();
  const stakeholders = new Set<string>();
  const matchedBy: string[] = [];

  for (const rule of rules) {
    if (!rule.enabled) continue;
    if (!matchRule(rule, input)) continue;

    layers.add(rule.layer);
    if (rule.vendor) vendors.add(rule.vendor);
    for (const s of rule.stakeholders) stakeholders.add(s);
    matchedBy.push(describeMatch(rule));
  }

  return {
    vendors: Array.from(vendors),
    affectedLayers: Array.from(layers),
    likelyStakeholders: Array.from(stakeholders),
    matchedBy,
    suggestedAction: suggestAction(matchedBy.length > 0),
  };
}

function suggestAction(hasMatch: boolean): string {
  return hasMatch
    ? "Check whether this needs to be backported to your vendor kernel or BSP tree."
    : "No known vendor/subsystem mapping for this patch — review the diff directly.";
}
