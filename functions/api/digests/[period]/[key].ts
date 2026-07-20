import { getDigest } from "@lkmlens/db";
import type { DigestPeriod } from "@lkmlens/shared";

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const period = String(params.period);
  const key = String(params.key);
  if ((period !== "daily" && period !== "weekly") || key.length > 16) {
    return Response.json({ error: "Invalid digest period" }, { status: 400 });
  }
  const digest = await getDigest(env.DB, period as DigestPeriod, key);
  if (!digest) return Response.json({ error: "Digest not found" }, { status: 404 });
  return Response.json(digest, {
    headers: { "cache-control": "public, max-age=300" },
  });
};
