import { listDigests } from "@lkmlens/db";

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const digests = await listDigests(env.DB);
  return Response.json({ digests }, {
    headers: { "cache-control": "public, max-age=300" },
  });
};
