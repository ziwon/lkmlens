# LKMLens

> **A clearer view into Linux kernel development.**

LKMLens is a public search and exploration service for Linux kernel
mailing-list discussions. It collects selected conversations from
[lore.kernel.org](https://lore.kernel.org/), organizes them by technical
topic, reconstructs discussion threads and patch series, and makes them
searchable through a clean web interface.

**Live:** https://lkmlens.pages.dev *(not yet deployed)*

LKMLens is not affiliated with kernel.org, the Linux Foundation, or the
Linux kernel project. lore.kernel.org remains the canonical source and
archive; LKMLens is a discovery and interpretation layer on top of it.

## Status

Early development (Phase 0 / Phase 1 of the MVP scope).

## Repository layout

```text
apps/web/        Cloudflare Pages frontend (Vite + React + TypeScript + Tailwind)
functions/       Pages Functions API (/api/topics, /api/search) — must live at the
                  project root alongside wrangler.jsonc for Cloudflare Pages to find it
packages/        Shared libraries (db, lore-client, mail-parser, thread-builder,
                  classifier, search, ai, ui, shared)
workers/         Scheduled/queue Workers (collector, indexer, summarizer, digest)
migrations/      D1 SQL migrations
scripts/         Operational scripts (seed-topics, rebuild-fts, backfill, ...)
```

## Development

Requires Node.js 20+, [pnpm](https://pnpm.io/), and the
[Cloudflare Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/).

```bash
pnpm install

# Web app
pnpm --filter @lkmlens/web dev

# D1 (local)
wrangler d1 migrations apply lkmlens --local
pnpm --filter @lkmlens/web exec tsx ../../scripts/seed-topics.ts --local
```

## License

Apache License 2.0 — see [`LICENSE`](./LICENSE).

## Support

LKMLens is free and open source. See `/support` (once deployed) or
[GitHub Sponsors](https://github.com/sponsors/ziwon) to help cover indexing,
AI inference, and storage costs.
