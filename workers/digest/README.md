# digest

Publishes a completed UTC daily digest every day and a completed ISO-week
digest every Monday. Digests are deterministic, source-linked, and include
current evidence-linked thread overviews when available.

```bash
pnpm --filter @lkmlens/digest typecheck
pnpm --filter @lkmlens/digest deploy
```

