import { listTopics } from "@lkmlens/db";

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const topics = await listTopics(env.DB, { enabledOnly: true });
  return Response.json(
    { topics },
    { headers: { "cache-control": "public, max-age=60" } },
  );
};
