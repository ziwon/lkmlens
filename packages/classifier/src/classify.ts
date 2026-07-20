/**
 * Deterministic weighted topic classifier. See docs/PLANNING.md section 6.
 *
 * Score per topic is the sum of matched, enabled topic_rules weights
 * (negative rules subtract). Every match is recorded so the assignment is
 * explainable, e.g.:
 *
 *   { topic: "ebpf", score: 8.5,
 *     matchedBy: ["mailing-list:bpf", "subject:[PATCH bpf-next]", "path:kernel/bpf/**"] }
 *
 * This module does not read or write D1 — it is a pure function over rules
 * and a normalized message, so it can be unit tested without a database and
 * reused by both the indexing Workflow and offline batch reclassification.
 */

import { globMatch, type TopicMatch, type TopicRule } from "@lkmlens/shared";

export interface ClassifiableMessage {
  subject: string;
  mailingList?: string | null;
  bodyText?: string | null;
  /** Changed file paths, e.g. extracted from a patch's diffstat. */
  filePaths?: string[];
}

/** Rules for a single topic, keyed by the topic's slug. */
export interface TopicRuleSet {
  topicSlug: string;
  rules: TopicRule[];
}

const MIN_SCORE = 0.01;

export function classifyMessage(
  message: ClassifiableMessage,
  topicRuleSets: TopicRuleSet[],
): TopicMatch[] {
  const matches: TopicMatch[] = [];

  for (const { topicSlug, rules } of topicRuleSets) {
    let score = 0;
    const matchedBy: string[] = [];

    for (const rule of rules) {
      if (!rule.enabled) continue;
      const hit = matchRule(rule, message);
      if (!hit) continue;

      score += rule.isNegative ? -rule.weight : rule.weight;
      matchedBy.push(describeMatch(rule));
    }

    if (score >= MIN_SCORE && matchedBy.length > 0) {
      matches.push({ topic: topicSlug, score: roundScore(score), matchedBy });
    }
  }

  return matches.sort((a, b) => b.score - a.score);
}

function matchRule(rule: TopicRule, message: ClassifiableMessage): boolean {
  const pattern = rule.pattern;

  switch (rule.ruleType) {
    case "mailing_list":
      return equalsIgnoreCase(message.mailingList, pattern);

    case "subject":
      return containsIgnoreCase(message.subject, pattern);

    case "patch_prefix":
      return startsWithIgnoreCase(message.subject, pattern);

    case "file_path":
      return (message.filePaths ?? []).some((path) => globMatch(pattern, path));

    case "alias":
      return (
        wordMatch(message.subject, pattern) ||
        wordMatch(message.bodyText ?? "", pattern)
      );

    case "body":
      return wordMatch(message.bodyText ?? "", pattern);

    default:
      return false;
  }
}

function describeMatch(rule: TopicRule): string {
  const prefix: Record<TopicRule["ruleType"], string> = {
    mailing_list: "mailing-list",
    subject: "subject",
    patch_prefix: "subject",
    file_path: "path",
    alias: "alias",
    body: "body",
  };
  return `${prefix[rule.ruleType]}:${rule.pattern}`;
}

function equalsIgnoreCase(value: string | null | undefined, pattern: string): boolean {
  if (!value) return false;
  return value.toLowerCase() === pattern.toLowerCase();
}

function containsIgnoreCase(value: string | null | undefined, pattern: string): boolean {
  if (!value) return false;
  return value.toLowerCase().includes(pattern.toLowerCase());
}

function startsWithIgnoreCase(value: string | null | undefined, pattern: string): boolean {
  if (!value) return false;
  return value.toLowerCase().startsWith(pattern.toLowerCase());
}

/**
 * Whole-word/phrase match, tolerant of punctuation boundaries.
 *
 * All-uppercase patterns (GPU, CXL, RDMA, NUMA, ...) are typically acronyms
 * and are matched case-sensitively: kernel-list prose reliably capitalizes
 * them, while a lowercase occurrence is much more likely to be an unrelated
 * code identifier or module name (e.g. Rust's `pub mod gpu;`). Verified
 * against a real false positive from live lore.kernel.org ingestion — see
 * docs/PLANNING.md section 6, "generic words such as GPU... produce noisy
 * topic pages". Mixed-case patterns (eBPF, io_uring, folio) stay
 * case-insensitive.
 */
function wordMatch(value: string, pattern: string): boolean {
  if (!value || !pattern) return false;
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const isAcronym = pattern.length > 1 && /^[A-Z0-9]+$/.test(pattern);
  const re = new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, isAcronym ? "" : "i");
  return re.test(value);
}

function roundScore(score: number): number {
  return Math.round(score * 100) / 100;
}
