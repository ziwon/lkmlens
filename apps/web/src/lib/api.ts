import type { SearchResultRow } from "@lkmlens/db";
import type { Topic } from "@lkmlens/shared";

export async function fetchTopics(): Promise<Topic[]> {
  const res = await fetch("/api/topics");
  if (!res.ok) throw new Error(`GET /api/topics failed: ${res.status}`);
  const data = (await res.json()) as { topics: Topic[] };
  return data.topics;
}

export async function fetchSearch(query: string, offset = 0): Promise<SearchResultRow[]> {
  const url = `/api/search?q=${encodeURIComponent(query)}&offset=${offset}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET /api/search failed: ${res.status}`);
  const data = (await res.json()) as { results: SearchResultRow[] };
  return data.results;
}
