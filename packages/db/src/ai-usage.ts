import type { D1Database } from "@cloudflare/workers-types";
import type { AiUsageStatus } from "@lkmlens/shared";

interface UsageRow {
  usage_date: string;
  provider: string;
  model: string;
  request_count: number;
  success_count: number;
  failure_count: number;
  input_tokens: number;
  output_tokens: number;
  quota_exhausted: number;
}

function utcUsageDate(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function nextUtcReset(now: Date): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString();
}

export function computeAiQuotaState(
  requestCount: number,
  dailyLimit: number,
  warningPercent: number,
  providerExhausted: boolean,
): { usagePercent: number; state: AiUsageStatus["state"] } {
  const usagePercent = dailyLimit > 0 ? Math.min(100, Math.round((requestCount / dailyLimit) * 100)) : 100;
  const exhausted = providerExhausted || requestCount >= dailyLimit;
  return {
    usagePercent,
    state: exhausted ? "exhausted" : usagePercent >= warningPercent ? "warning" : "normal",
  };
}

export async function reserveAiRequest(
  db: D1Database,
  provider: string,
  model: string,
  dailyLimit: number,
  now = new Date(),
): Promise<boolean> {
  const date = utcUsageDate(now);
  const results = await db.batch([
    db.prepare(
      `INSERT INTO ai_usage_daily (usage_date, provider, model)
       VALUES (?, ?, ?) ON CONFLICT(usage_date, provider, model) DO NOTHING`,
    ).bind(date, provider, model),
    db.prepare(
      `UPDATE ai_usage_daily SET request_count = request_count + 1, updated_at = CURRENT_TIMESTAMP
       WHERE usage_date = ? AND provider = ? AND model = ?
       AND request_count < ? AND quota_exhausted = 0`,
    ).bind(date, provider, model, dailyLimit),
  ]);
  return (results[1]?.meta.changes ?? 0) === 1;
}

export async function recordAiSuccess(
  db: D1Database,
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  now = new Date(),
): Promise<void> {
  await db.prepare(
    `UPDATE ai_usage_daily SET success_count = success_count + 1,
       input_tokens = input_tokens + ?, output_tokens = output_tokens + ?,
       last_error = NULL, updated_at = CURRENT_TIMESTAMP
     WHERE usage_date = ? AND provider = ? AND model = ?`,
  ).bind(inputTokens, outputTokens, utcUsageDate(now), provider, model).run();
}

export async function recordAiFailure(
  db: D1Database,
  provider: string,
  model: string,
  error: string,
  quotaExhausted: boolean,
  now = new Date(),
): Promise<void> {
  await db.prepare(
    `UPDATE ai_usage_daily SET failure_count = failure_count + 1,
       quota_exhausted = CASE WHEN ? THEN 1 ELSE quota_exhausted END,
       last_error = ?, updated_at = CURRENT_TIMESTAMP
     WHERE usage_date = ? AND provider = ? AND model = ?`,
  ).bind(quotaExhausted ? 1 : 0, error.slice(0, 500), utcUsageDate(now), provider, model).run();
}

export async function getAiUsageStatus(
  db: D1Database,
  provider: string,
  model: string,
  dailyLimit: number,
  warningPercent: number,
  now = new Date(),
): Promise<AiUsageStatus> {
  const date = utcUsageDate(now);
  const row = await db.prepare(
    `SELECT usage_date, provider, model, request_count, success_count, failure_count,
            input_tokens, output_tokens, quota_exhausted
     FROM ai_usage_daily WHERE usage_date = ? AND provider = ? AND model = ?`,
  ).bind(date, provider, model).first<UsageRow>();
  const requestCount = row?.request_count ?? 0;
  const { usagePercent, state } = computeAiQuotaState(
    requestCount,
    dailyLimit,
    warningPercent,
    row?.quota_exhausted === 1,
  );
  return {
    usageDate: date,
    provider,
    model,
    dailyRequestLimit: dailyLimit,
    requestCount,
    successCount: row?.success_count ?? 0,
    failureCount: row?.failure_count ?? 0,
    inputTokens: row?.input_tokens ?? 0,
    outputTokens: row?.output_tokens ?? 0,
    remainingRequests: Math.max(0, dailyLimit - requestCount),
    usagePercent,
    state,
    resetAt: nextUtcReset(now),
  };
}
