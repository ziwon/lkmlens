import { searchMessages } from "@lkmlens/db";
import { parseQuery } from "@lkmlens/search";

interface Env {
  DB: D1Database;
}

const MAX_QUERY_LENGTH = 200;

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").slice(0, MAX_QUERY_LENGTH);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? "0") || 0, 0);

  if (!q.trim()) {
    return Response.json({ results: [], query: q }, { status: 200 });
  }

  const parsed = parseQuery(q);
  const results = await searchMessages(env.DB, parsed, { offset });

  return Response.json(
    { results, query: q, parsed },
    { headers: { "cache-control": "no-store" } },
  );
};
