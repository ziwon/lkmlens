# summarizer

Hourly, bounded Workers AI job that generates evidence-linked summaries for
pending or stale threads. It processes at most five threads per invocation,
validates every claim against exact source message IDs/URLs, records the model
and prompt version, and atomically replaces the current summary.

```bash
pnpm --filter @lkmlens/summarizer typecheck
pnpm --filter @lkmlens/summarizer deploy
```

