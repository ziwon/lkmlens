#!/usr/bin/env tsx
/**
 * Exports canonical D1 tables (excluding the message_search FTS5 virtual
 * table, which is not exportable and must be rebuilt via
 * scripts/rebuild-fts.ts after restore). See docs/PLANNING.md section 16
 * (Backup strategy).
 *
 * For the MVP, `wrangler d1 export lkmlens --remote --output=backup.sql`
 * already does this correctly — D1 export does not include virtual tables.
 * This script is a placeholder for future needs (selective table export,
 * scheduled backups to R2, etc.) beyond what the wrangler CLI covers.
 */

console.error(
  "scripts/export-canonical-data.ts is not implemented yet. For now, use:\n" +
    "  wrangler d1 export lkmlens --remote --output=backup.sql\n" +
    "then scripts/rebuild-fts.ts after any restore.",
);
process.exit(1);
