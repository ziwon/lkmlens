#!/usr/bin/env tsx
/**
 * Seeds impact_rules: file-path/subject-prefix -> affected layer + likely
 * stakeholders, for deterministic patch-impact tagging (see
 * packages/impact). Idempotent: rules are fully replaced on every run, so
 * this script is the source of truth for the *default* rule set.
 *
 * Grounded in vendor/subsystem paths actually present in our ingested
 * corpus as of 2026-07-20 (dri-devel, bpf, kvm, linux-mm, cgroups,
 * rust-for-linux, linux-cxl, io-uring — see the path-frequency survey run
 * against production D1 during development), plus a few well-known paths
 * not yet represented in ingested data (e.g. Qualcomm remoteproc, the
 * running example from the product discussion) for forward coverage.
 *
 * Usage:
 *   tsx scripts/seed-impact-rules.ts --local
 *   tsx scripts/seed-impact-rules.ts --remote
 */

import { execD1File, parseD1Target, sqlString } from "./lib/d1.js";

interface RuleSeed {
  type: "file_path" | "subject_prefix";
  pattern: string;
  layer: string;
  vendor: string | null;
  stakeholders: string[];
}

function filePath(
  pattern: string,
  layer: string,
  vendor: string | null,
  stakeholders: string[],
): RuleSeed {
  return { type: "file_path", pattern, layer, vendor, stakeholders };
}

function subjectPrefix(
  pattern: string,
  layer: string,
  vendor: string | null,
  stakeholders: string[],
): RuleSeed {
  return { type: "subject_prefix", pattern, layer, vendor, stakeholders };
}

const RULES: RuleSeed[] = [
  // --- GPU vendors (drivers/gpu/drm/**, seen in dri-devel ingestion) ---
  filePath("drivers/gpu/drm/amd/**", "GPU driver / display pipeline (AMD)", "AMD", [
    "AMD GPU driver maintainers",
    "Linux distro graphics-stack integrators",
  ]),
  subjectPrefix("drm/amdgpu:", "GPU driver / display pipeline (AMD)", "AMD", [
    "AMD GPU driver maintainers",
  ]),
  filePath("drivers/gpu/drm/xe/**", "GPU driver / display pipeline (Intel Xe)", "Intel", [
    "Intel GPU driver maintainers",
  ]),
  filePath("drivers/gpu/drm/msm/**", "GPU driver / display pipeline (Qualcomm Adreno)", "Qualcomm", [
    "Qualcomm platform integrators",
    "Android graphics-stack team",
  ]),
  filePath("drivers/gpu/nova-core/**", "GPU driver (NVIDIA, Rust)", "NVIDIA", [
    "NVIDIA open-driver maintainers",
  ]),
  filePath("drivers/gpu/drm/vc4/**", "GPU driver / display pipeline (Broadcom VideoCore)", "Broadcom", [
    "Raspberry Pi / Broadcom SoC platform engineers",
  ]),
  filePath("drivers/gpu/drm/panel/**", "Display panel driver", null, [
    "Device/laptop panel bring-up engineers",
  ]),

  // --- Remote processor / DSP (not yet in our ingested corpus, but a
  // well-known real path -- the qcom remoteproc example from the product
  // discussion) ---
  filePath(
    "drivers/remoteproc/qcom_*",
    "Kernel driver / DSP firmware interface",
    "Qualcomm",
    ["Qualcomm platform integrators", "Device bring-up engineers"],
  ),
  subjectPrefix("qcom: remoteproc:", "Kernel driver / DSP firmware interface", "Qualcomm", [
    "Qualcomm platform integrators",
    "Device bring-up engineers",
  ]),

  // --- CXL (drivers/cxl/**, seen in linux-cxl ingestion) ---
  filePath("drivers/cxl/**", "CXL memory / interconnect subsystem", null, [
    "Datacenter memory-expansion platform teams",
    "CXL device vendors",
  ]),

  // --- eBPF core (kernel/bpf/**, seen in bpf ingestion) ---
  filePath("kernel/bpf/**", "Kernel BPF core / verifier", null, [
    "eBPF tooling maintainers (libbpf, bpftool)",
    "Container/observability platform teams (Cilium, Falco, ...)",
  ]),
  filePath("tools/lib/bpf/**", "eBPF userspace tooling (libbpf)", null, [
    "eBPF application developers",
  ]),

  // --- Scheduler / sched_ext (kernel/sched/**, tools/sched_ext/**) ---
  filePath("kernel/sched/**", "CPU scheduler core", null, [
    "sched_ext BPF-scheduler authors",
    "Cloud/hypervisor CPU-scheduling teams",
  ]),
  filePath("tools/sched_ext/**", "sched_ext scheduler tooling", null, [
    "sched_ext BPF-scheduler authors",
  ]),

  // --- Rust for Linux core (rust/kernel/**, seen in rust-for-linux ingestion) ---
  filePath("rust/kernel/**", "Rust-for-Linux core abstractions", null, [
    "Rust-based driver authors",
    "Rust for Linux maintainers",
  ]),
  filePath("rust/helpers/**", "Rust-for-Linux core abstractions", null, ["Rust for Linux maintainers"]),
  filePath("rust/bindings/**", "Rust-for-Linux core abstractions", null, ["Rust for Linux maintainers"]),

  // --- Memory management core (mm/**, seen in linux-mm ingestion) ---
  filePath("mm/**", "Core memory management (mm)", null, [
    "Memory allocator/reclaim subsystem maintainers",
    "Large-memory workload platform teams",
  ]),

  // --- Android binder IPC (drivers/android/**, seen in rust-for-linux ingestion) ---
  filePath("drivers/android/**", "Android IPC (binder) driver", null, [
    "Android platform team",
    "AOSP kernel integrators",
  ]),

  // --- FUSE filesystem (fs/fuse/**, seen in ingested corpus) ---
  filePath("fs/fuse/**", "FUSE filesystem", null, ["Userspace filesystem (FUSE-based) developers"]),

  // --- PCI / IOMMU / vhost (device/virtualization plumbing) ---
  filePath("drivers/pci/**", "PCI subsystem core", null, ["Platform/firmware bring-up engineers"]),
  filePath("drivers/iommu/**", "IOMMU subsystem", null, [
    "Virtualization platform teams",
    "Device passthrough (VFIO) users",
  ]),
  filePath("drivers/vhost/**", "Virtio/vhost backend", null, ["VM host/hypervisor integration teams"]),

  // --- Architectures ---
  filePath("arch/arm64/**", "ARM64 architecture core", null, ["ARM64 platform/BSP engineers"]),
  filePath("arch/x86/**", "x86 architecture core", null, ["x86 platform engineers"]),
  filePath("arch/s390/**", "s390 (IBM Z) architecture core", "IBM", ["IBM Z platform engineers"]),
  filePath("arch/riscv/**", "RISC-V architecture core", null, ["RISC-V platform/SoC vendors"]),
];

function buildSql(): string {
  const lines: string[] = ["DELETE FROM impact_rules;"];

  for (const rule of RULES) {
    lines.push(
      `INSERT INTO impact_rules (rule_type, pattern, layer, vendor, stakeholders_json, enabled)
       VALUES (
         ${sqlString(rule.type)},
         ${sqlString(rule.pattern)},
         ${sqlString(rule.layer)},
         ${sqlString(rule.vendor)},
         ${sqlString(JSON.stringify(rule.stakeholders))},
         1
       );`,
    );
  }

  return lines.join("\n");
}

function main() {
  const target = parseD1Target(process.argv);
  execD1File(buildSql(), target, `Seeding ${RULES.length} impact rules`);
  console.log("Done.");
}

main();
