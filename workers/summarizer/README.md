# summarizer

Hourly, bounded Gemini job that generates evidence-linked summaries for
pending or stale threads. It processes at most five threads per invocation,
validates every claim against exact source message IDs/URLs, records the model
and prompt version, and atomically replaces the current summary.

The default provider is `gemini-3.1-flash-lite` with a conservative local
budget of 100 requests per UTC day. Configure the secret before deployment:

```bash
pnpm --filter @lkmlens/summarizer exec wrangler secret put GEMINI_API_KEY --config wrangler.jsonc
```

The free Gemini Developer API tier may use submitted public mailing-list text
to improve Google products. Use a paid tier if that policy is not acceptable.

```bash
pnpm --filter @lkmlens/summarizer typecheck
pnpm --filter @lkmlens/summarizer deploy
```
