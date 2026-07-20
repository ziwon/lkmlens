#!/usr/bin/env tsx
/**
 * Seeds the nine initial topics and their classification rules
 * (docs/PLANNING.md section 5) into D1.
 *
 * Idempotent: safe to re-run. Topics are upserted by slug; rules are
 * replaced wholesale for each topic on every run, so this script is the
 * source of truth for the *default* rule set — manual admin corrections
 * (docs/PLANNING.md section 6, "Manual corrections should be preserved")
 * are expected to live in a separate override path once the admin UI
 * exists, not in this script.
 *
 * Usage:
 *   tsx scripts/seed-topics.ts --local
 *   tsx scripts/seed-topics.ts --remote
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const DB_NAME = "lkmlens";

// Relative rule weights follow the priority guidance in
// docs/PLANNING.md section 6: changed-file path > mailing list ≈
// subject/patch-prefix > alias > body-only keyword.
const WEIGHT = {
  filePath: 4,
  mailingList: 3,
  subject: 3,
  patchPrefix: 3,
  alias: 1.5,
  body: 0.5,
} as const;

interface RuleSeed {
  type: "alias" | "subject" | "mailing_list" | "file_path" | "patch_prefix" | "body";
  pattern: string;
  weight: number;
}

interface TopicSeed {
  slug: string;
  name: string;
  description: string;
  displayOrder: number;
  rules: RuleSeed[];
}

function alias(...patterns: string[]): RuleSeed[] {
  return patterns.map((pattern) => ({ type: "alias", pattern, weight: WEIGHT.alias }));
}
function mailingList(...patterns: string[]): RuleSeed[] {
  return patterns.map((pattern) => ({ type: "mailing_list", pattern, weight: WEIGHT.mailingList }));
}
function filePath(...patterns: string[]): RuleSeed[] {
  return patterns.map((pattern) => ({ type: "file_path", pattern, weight: WEIGHT.filePath }));
}
function patchPrefix(...patterns: string[]): RuleSeed[] {
  return patterns.map((pattern) => ({ type: "patch_prefix", pattern, weight: WEIGHT.patchPrefix }));
}

const TOPICS: TopicSeed[] = [
  {
    slug: "ebpf",
    name: "eBPF & Networking",
    description: "Kernel BPF infrastructure, XDP, libbpf, and related networking work.",
    displayOrder: 1,
    rules: [
      ...alias("BPF", "eBPF", "XDP", "Cilium", "libbpf", "bpf-next"),
      ...mailingList("bpf", "netdev"),
      ...filePath("kernel/bpf/**", "net/core/filter.c", "tools/lib/bpf/**"),
      ...patchPrefix("[PATCH bpf", "[PATCH net-next"),
    ],
  },
  {
    slug: "gpu",
    name: "GPU & Graphics",
    description: "GPU and graphics driver development: DRM, AMDGPU, Nouveau.",
    displayOrder: 2,
    rules: [
      ...alias("GPU", "DRM", "Nouveau", "AMDGPU"),
      ...mailingList("dri-devel", "amd-gfx"),
      ...filePath("drivers/gpu/drm/**"),
      ...patchPrefix("[PATCH drm"),
    ],
  },
  {
    slug: "scheduling",
    name: "Scheduling",
    description: "CPU scheduler development, including sched_ext.",
    displayOrder: 3,
    rules: [
      ...alias("scheduler", "scheduling", "sched_ext"),
      { type: "body", pattern: "sched", weight: WEIGHT.body },
      ...filePath("kernel/sched/**"),
      ...patchPrefix("[PATCH sched"),
    ],
  },
  {
    slug: "async-io",
    name: "Async I/O",
    description: "Asynchronous I/O with io_uring.",
    displayOrder: 4,
    rules: [
      ...alias("io_uring"),
      ...mailingList("io-uring"),
      ...filePath("io_uring/**", "fs/io_uring.c"),
      ...patchPrefix("[PATCH io_uring"),
    ],
  },
  {
    slug: "virtualization",
    name: "Virtualization",
    description: "Virtualization infrastructure: KVM, VFIO, IOMMU.",
    displayOrder: 5,
    rules: [
      ...alias("KVM", "VFIO", "IOMMU"),
      ...mailingList("kvm"),
      ...filePath("virt/kvm/**", "drivers/vfio/**", "drivers/iommu/**"),
      ...patchPrefix("[PATCH kvm"),
    ],
  },
  {
    slug: "interconnects",
    name: "Interconnects & Fabrics",
    description: "PCIe, CXL, and RDMA interconnect and fabric development.",
    displayOrder: 6,
    rules: [
      ...alias("PCIe", "CXL", "RDMA"),
      ...mailingList("linux-cxl", "linux-rdma", "linux-pci"),
      ...filePath("drivers/cxl/**", "drivers/pci/**", "drivers/infiniband/**"),
    ],
  },
  {
    slug: "rust-for-linux",
    name: "Rust for Linux",
    description: "Rust language support and Rust-based drivers in the kernel.",
    displayOrder: 7,
    rules: [
      ...alias("Rust for Linux"),
      { type: "subject", pattern: "rust", weight: WEIGHT.subject },
      ...mailingList("rust-for-linux"),
      ...filePath("rust/**"),
      ...patchPrefix("[PATCH rust"),
    ],
  },
  {
    slug: "memory-management",
    name: "Memory Management",
    description: "Core memory management: folios, NUMA, reclaim, and linux-mm.",
    displayOrder: 8,
    rules: [
      ...alias("memory management", "folio", "NUMA"),
      ...mailingList("linux-mm"),
      ...filePath("mm/**"),
      ...patchPrefix("[PATCH mm"),
    ],
  },
  {
    slug: "containers",
    name: "Containers & Isolation",
    description: "Containers, namespaces, and cgroups.",
    displayOrder: 9,
    rules: [
      ...alias("container", "namespace", "cgroup"),
      ...mailingList("cgroups"),
      ...filePath("kernel/cgroup/**", "kernel/nsproxy.c"),
      ...patchPrefix("[PATCH cgroup"),
    ],
  },
];

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function buildSql(): string {
  // No explicit BEGIN/COMMIT: D1's Durable Object-backed SQLite rejects raw
  // transaction control statements ("please use state.storage.transaction()
  // instead") — wrangler d1 execute already applies the whole file as one
  // unit.
  const lines: string[] = [];

  for (const topic of TOPICS) {
    lines.push(
      `INSERT INTO topics (slug, name, description, display_order, enabled)
       VALUES (${sqlString(topic.slug)}, ${sqlString(topic.name)}, ${sqlString(topic.description)}, ${topic.displayOrder}, 1)
       ON CONFLICT(slug) DO UPDATE SET
         name = excluded.name,
         description = excluded.description,
         display_order = excluded.display_order;`,
    );

    // Rules are fully replaced on every run so this script stays the
    // single source of truth for the *default* rule set.
    lines.push(
      `DELETE FROM topic_rules WHERE topic_id = (SELECT id FROM topics WHERE slug = ${sqlString(topic.slug)});`,
    );

    for (const rule of topic.rules) {
      lines.push(
        `INSERT INTO topic_rules (topic_id, rule_type, pattern, weight, is_negative, enabled)
         VALUES (
           (SELECT id FROM topics WHERE slug = ${sqlString(topic.slug)}),
           ${sqlString(rule.type)},
           ${sqlString(rule.pattern)},
           ${rule.weight},
           0,
           1
         );`,
      );
    }
  }

  return lines.join("\n");
}

function main() {
  const target = process.argv.includes("--remote")
    ? "--remote"
    : process.argv.includes("--local")
      ? "--local"
      : null;

  if (!target) {
    console.error("Usage: tsx scripts/seed-topics.ts --local | --remote");
    process.exit(1);
  }

  const sql = buildSql();
  const dir = mkdtempSync(join(tmpdir(), "lkmlens-seed-topics-"));
  const file = join(dir, "seed-topics.sql");
  writeFileSync(file, sql, "utf8");

  console.log(`Seeding ${TOPICS.length} topics (${target.slice(2)}) via ${file} ...`);

  const result = spawnSync(
    "wrangler",
    ["d1", "execute", DB_NAME, target, "--file", file],
    { stdio: "inherit" },
  );

  if (result.status !== 0) {
    console.error("wrangler d1 execute failed");
    process.exit(result.status ?? 1);
  }

  console.log("Done.");
}

main();
