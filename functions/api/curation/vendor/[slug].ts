import { listCurationChannels, listVendorSignals } from "@lkmlens/db";

interface Env { DB: D1Database }

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const slug = String(params.slug);
  const result = await listVendorSignals(env.DB, slug);
  if (!result) return Response.json({ error: "Vendor not found" }, { status: 404 });
  const channel = (await listCurationChannels(env.DB)).find((item) => item.kind === "vendor" && item.slug === slug);
  return Response.json({ channel, signals: result.signals }, {
    headers: { "cache-control": "public, max-age=60" },
  });
};
