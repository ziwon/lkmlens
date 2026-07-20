import { listDigests } from "@lkmlens/db";

interface Env {
  DB: D1Database;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rssDate(value: string | null): string {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.valueOf()) ? new Date().toUTCString() : date.toUTCString();
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const origin = new URL(request.url).origin;
  const selfUrl = `${origin}/rss/weekly.xml`;
  const digests = (await listDigests(env.DB, 30)).filter((digest) => digest.periodType === "weekly");
  const latestDate = digests[0]?.publishedAt ?? null;

  const items = digests.map((digest) => {
    const url = `${origin}/digests/weekly/${encodeURIComponent(digest.periodKey)}`;
    const subjects = digest.content.threads.slice(0, 3).map((thread) => thread.subject).join("; ");
    const description = `${digest.content.threads.length} selected threads${subjects ? `: ${subjects}` : "."}`;
    return `
    <item>
      <title>${escapeXml(digest.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${escapeXml(rssDate(digest.publishedAt))}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>LKMLens Weekly Digests</title>
    <link>${escapeXml(`${origin}/digests`)}</link>
    <description>Weekly reports of selected Linux kernel product signals with links to public evidence.</description>
    <language>en</language>
    <lastBuildDate>${escapeXml(rssDate(latestDate))}</lastBuildDate>
    <atom:link href="${escapeXml(selfUrl)}" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
};
