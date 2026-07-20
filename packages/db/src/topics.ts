import type { D1Database } from "@cloudflare/workers-types";
import type { Topic, TopicRule } from "@lkmlens/shared";

interface TopicRow {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  enabled: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface TopicRuleRow {
  id: number;
  topic_id: number;
  rule_type: TopicRule["ruleType"];
  pattern: string;
  weight: number;
  is_negative: number;
  enabled: number;
}

function rowToTopic(row: TopicRow): Topic {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    enabled: row.enabled === 1,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToTopicRule(row: TopicRuleRow): TopicRule {
  return {
    id: row.id,
    topicId: row.topic_id,
    ruleType: row.rule_type,
    pattern: row.pattern,
    weight: row.weight,
    isNegative: row.is_negative === 1,
    enabled: row.enabled === 1,
  };
}

export async function listTopics(
  db: D1Database,
  options: { enabledOnly?: boolean } = {},
): Promise<Topic[]> {
  const where = options.enabledOnly === false ? "" : "WHERE enabled = 1";
  const { results } = await db
    .prepare(
      `SELECT id, slug, name, description, enabled, display_order, created_at, updated_at
       FROM topics ${where}
       ORDER BY display_order ASC, name ASC`,
    )
    .all<TopicRow>();
  return results.map(rowToTopic);
}

export async function getTopicBySlug(db: D1Database, slug: string): Promise<Topic | null> {
  const row = await db
    .prepare(
      `SELECT id, slug, name, description, enabled, display_order, created_at, updated_at
       FROM topics WHERE slug = ?`,
    )
    .bind(slug)
    .first<TopicRow>();
  return row ? rowToTopic(row) : null;
}

export async function listTopicRules(
  db: D1Database,
  topicId: number,
): Promise<TopicRule[]> {
  const { results } = await db
    .prepare(
      `SELECT id, topic_id, rule_type, pattern, weight, is_negative, enabled
       FROM topic_rules WHERE topic_id = ? ORDER BY id ASC`,
    )
    .bind(topicId)
    .all<TopicRuleRow>();
  return results.map(rowToTopicRule);
}

/** All enabled rules for all enabled topics, grouped by topic slug — the shape @lkmlens/classifier expects. */
export async function listAllTopicRuleSets(
  db: D1Database,
): Promise<Array<{ topicSlug: string; rules: TopicRule[] }>> {
  const { results } = await db
    .prepare(
      `SELECT t.slug AS topic_slug, r.id, r.topic_id, r.rule_type, r.pattern, r.weight, r.is_negative, r.enabled
       FROM topic_rules r
       JOIN topics t ON t.id = r.topic_id
       WHERE t.enabled = 1 AND r.enabled = 1
       ORDER BY t.slug ASC, r.id ASC`,
    )
    .all<TopicRuleRow & { topic_slug: string }>();

  const bySlug = new Map<string, TopicRule[]>();
  for (const row of results) {
    const rule = rowToTopicRule(row);
    const bucket = bySlug.get(row.topic_slug);
    if (bucket) bucket.push(rule);
    else bySlug.set(row.topic_slug, [rule]);
  }
  return Array.from(bySlug, ([topicSlug, rules]) => ({ topicSlug, rules }));
}
