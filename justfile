# LKMLens operational tasks. Install `just`: https://github.com/casey/just

# Run the full lore.kernel.org ingestion pipeline (backfill --remote for every
# configured source, then compute-impact --remote). Writes to production D1.
sync:
    ./node_modules/.bin/tsx scripts/collect-all.ts

alias collect := sync
