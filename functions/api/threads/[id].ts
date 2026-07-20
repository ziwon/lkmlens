import { getThreadById } from "@lkmlens/db";

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: "Invalid thread id" }, { status: 400 });
  }

  const detail = await getThreadById(env.DB, id);
  if (!detail) {
    return Response.json({ error: "Thread not found" }, { status: 404 });
  }

  return Response.json(detail, {
    headers: { "cache-control": "public, max-age=60" },
  });
};
