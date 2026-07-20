import { getTopicBySlug, listCurationChannels, listTopicSignals } from "@lkmlens/db";

interface Env { DB: D1Database }

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const slug = String(params.slug);
  const topic = await getTopicBySlug(env.DB, slug);
  if (!topic || !topic.enabled) return Response.json({ error: "Topic not found" }, { status: 404 });
  const [signals, channels] = await Promise.all([listTopicSignals(env.DB, slug), listCurationChannels(env.DB)]);
  const channel = channels.find((item) => item.kind === "topic" && item.slug === slug);
  return Response.json({ channel, signals }, {
    headers: { "cache-control": "public, max-age=60" },
  });
};
