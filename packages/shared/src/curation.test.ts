import { describe, expect, it } from "vitest";
import { deriveLifecycleStage } from "./curation.js";
import type { PatchLifecycle } from "./types.js";

const emptyLifecycle: PatchLifecycle = {
  seriesId: 1,
  maintainerTree: null,
  maintainerTreeUrl: null,
  mainlineCommit: null,
  mainlineCommitUrl: null,
  mainlineMergedAt: null,
  linuxVersion: null,
  stableVersions: [],
  androidCommonBranches: [],
  sourceUrls: [],
  checkedAt: null,
  updatedAt: "2026-07-21T00:00:00Z",
};

describe("deriveLifecycleStage", () => {
  it("uses explicit review trailers as review evidence", () => {
    expect(deriveLifecycleStage(null, [{ signalType: "Reviewed-by" }])).toBe("under-review");
  });

  it("returns the furthest observed integration milestone", () => {
    expect(
      deriveLifecycleStage(
        { ...emptyLifecycle, mainlineCommit: "abc123", linuxVersion: "v6.14", stableVersions: ["6.12.9"] },
        [],
      ),
    ).toBe("stable-backport");
  });

  it("does not infer progress when no evidence is present", () => {
    expect(deriveLifecycleStage(emptyLifecycle, [])).toBe("submitted");
  });
});
