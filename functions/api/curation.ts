import { listCurationChannels } from "@lkmlens/db";

interface Env { DB: D1Database }

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const channels = await listCurationChannels(env.DB);
  return Response.json({ channels }, { headers: { "cache-control": "public, max-age=60" } });
};
