#!/usr/bin/env tsx
/**
 * Runs scripts/backfill.ts --remote across every configured mailing-list
 * source. This is the single entrypoint invoked by the systemd timer on the
 * always-free OCI VM (see tf-infra/stacks/infra/oci/compute/lab) that
 * performs continuous collection — see docs/PLANNING.md section 7.3.
 *
 * Each source is independently checkpointed (collection_checkpoints), so a
 * failure on one list doesn't block the others, and re-running only pulls
 * in new messages. Epoch numbers occasionally need bumping when a
 * high-volume list rolls over to a new public-inbox v2 epoch — check with
 * `git ls-remote https://lore.kernel.org/<list>/<epoch+1>` if a source
 * stops finding new commits despite known upstream activity.
 *
 * Usage: tsx scripts/collect-all.ts
 */

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface Source {
  inbox: string;
  epoch: number;
}

const SOURCES: Source[] = [
  { inbox: "rust-for-linux", epoch: 0 },
  { inbox: "bpf", epoch: 0 },
  { inbox: "dri-devel", epoch: 2 },
  { inbox: "io-uring", epoch: 0 },
  { inbox: "kvm", epoch: 1 },
  { inbox: "linux-cxl", epoch: 0 },
  { inbox: "linux-mm", epoch: 2 },
  { inbox: "cgroups", epoch: 0 },
];

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BACKFILL_SCRIPT = join(REPO_ROOT, "scripts", "backfill.ts");

function main() {
  const failures: string[] = [];

  for (const source of SOURCES) {
    const label = `${source.inbox}/${source.epoch}`;
    console.log(`\n=== ${label} ===`);

    const result = spawnSync(
      join(REPO_ROOT, "node_modules", ".bin", "tsx"),
      [BACKFILL_SCRIPT, "--inbox", source.inbox, "--epoch", String(source.epoch), "--remote"],
      { stdio: "inherit", cwd: REPO_ROOT },
    );

    if (result.status !== 0) {
      console.error(`FAILED: ${label} (exit ${result.status})`);
      failures.push(label);
    }
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length}/${SOURCES.length} source(s) failed: ${failures.join(", ")}`);
    process.exit(1);
  }

  console.log(`\nAll ${SOURCES.length} source(s) collected successfully.`);
}

main();
