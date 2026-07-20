import { getAiUsageStatus } from "@lkmlens/db";

interface Env {
  DB: D1Database;
  AI_PROVIDER: string;
  AI_MODEL: string;
  AI_DAILY_REQUEST_LIMIT: string;
  AI_WARNING_PERCENT: string;
}

function boundedInteger(value: string, fallback: number, max: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const status = await getAiUsageStatus(
    env.DB,
    env.AI_PROVIDER,
    env.AI_MODEL,
    boundedInteger(env.AI_DAILY_REQUEST_LIMIT, 100, 10_000),
    boundedInteger(env.AI_WARNING_PERCENT, 80, 100),
  );
  return Response.json(status, {
    headers: { "cache-control": "no-store" },
  });
};
