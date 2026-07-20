import type { PatchLifecycle, PatchLifecycleStage, ReviewSignal } from "./types.js";

export interface LifecycleStep {
  key: PatchLifecycleStage;
  label: string;
  observed: boolean;
  detail: string | null;
  sourceUrl: string | null;
}

export interface CurationChannel {
  kind: "topic" | "vendor";
  slug: string;
  name: string;
  description: string | null;
  signalCount: number;
  trackedAreas: string[];
}

export interface CurationSignal {
  threadId: number;
  subject: string;
  authorName: string | null;
  sourceUrl: string;
  firstPostedAt: string | null;
  lastActivityAt: string | null;
  patchVersion: number | null;
  topics: string[];
  vendors: string[];
  affectedLayers: string[];
  likelyStakeholders: string[];
  reviewedCount: number;
  ackedCount: number;
  lifecycle: PatchLifecycle | null;
  lifecycleStage: PatchLifecycleStage;
}

export function deriveLifecycleStage(
  lifecycle: PatchLifecycle | null,
  reviewSignals: Pick<ReviewSignal, "signalType">[],
): PatchLifecycleStage {
  if (lifecycle?.androidCommonBranches.length) return "android-common";
  if (lifecycle?.stableVersions.length) return "stable-backport";
  if (lifecycle?.linuxVersion) return "released";
  if (lifecycle?.mainlineCommit) return "mainline";
  if (lifecycle?.maintainerTree) return "maintainer-tree";
  if (reviewSignals.some((signal) => signal.signalType === "Reviewed-by" || signal.signalType === "Acked-by")) {
    return "under-review";
  }
  return "submitted";
}

export function buildLifecycleSteps(
  lifecycle: PatchLifecycle | null,
  reviewSignals: Pick<ReviewSignal, "signalType" | "personName" | "sourceUrl">[],
  submittedAt: string | null,
): LifecycleStep[] {
  const review = reviewSignals.find(
    (signal) => signal.signalType === "Reviewed-by" || signal.signalType === "Acked-by",
  );

  return [
    { key: "submitted", label: "LKML submission", observed: true, detail: submittedAt, sourceUrl: null },
    {
      key: "under-review",
      label: "Review evidence",
      observed: Boolean(review),
      detail: review ? `${review.signalType} ${review.personName}` : null,
      sourceUrl: review?.sourceUrl ?? null,
    },
    {
      key: "maintainer-tree",
      label: "Maintainer tree",
      observed: Boolean(lifecycle?.maintainerTree),
      detail: lifecycle?.maintainerTree ?? null,
      sourceUrl: lifecycle?.maintainerTreeUrl ?? null,
    },
    {
      key: "mainline",
      label: "Mainline",
      observed: Boolean(lifecycle?.mainlineCommit),
      detail: lifecycle?.mainlineCommit ?? null,
      sourceUrl: lifecycle?.mainlineCommitUrl ?? null,
    },
    {
      key: "released",
      label: "Linux release",
      observed: Boolean(lifecycle?.linuxVersion),
      detail: lifecycle?.linuxVersion ?? null,
      sourceUrl: lifecycle?.sourceUrls[0] ?? null,
    },
    {
      key: "stable-backport",
      label: "Stable backport",
      observed: Boolean(lifecycle?.stableVersions.length),
      detail: lifecycle?.stableVersions.join(", ") ?? null,
      sourceUrl: lifecycle?.sourceUrls[0] ?? null,
    },
    {
      key: "android-common",
      label: "Android common",
      observed: Boolean(lifecycle?.androidCommonBranches.length),
      detail: lifecycle?.androidCommonBranches.join(", ") ?? null,
      sourceUrl: lifecycle?.sourceUrls[0] ?? null,
    },
  ];
}
