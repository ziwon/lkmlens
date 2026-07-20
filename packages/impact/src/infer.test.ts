import { describe, expect, it } from "vitest";
import { inferImpact, type ImpactRule } from "./infer.js";

function rule(partial: Partial<ImpactRule> & Pick<ImpactRule, "ruleType" | "pattern">): ImpactRule {
  return { layer: "test layer", vendor: null, stakeholders: [], enabled: true, ...partial };
}

const qcomRemoteproc = rule({
  ruleType: "file_path",
  pattern: "drivers/remoteproc/qcom_*",
  layer: "Kernel driver / DSP firmware interface",
  vendor: "Qualcomm",
  stakeholders: ["Qualcomm platform integrators", "Device bring-up engineers"],
});

const amdgpu = rule({
  ruleType: "file_path",
  pattern: "drivers/gpu/drm/amd/**",
  layer: "GPU driver / display pipeline",
  vendor: "AMD",
  stakeholders: ["AMD GPU driver maintainers"],
});

describe("inferImpact", () => {
  it("matches the qcom remoteproc example from the product discussion", () => {
    const result = inferImpact(
      { subject: "qcom: remoteproc: improve DSP crash recovery", filePaths: ["drivers/remoteproc/qcom_q6v5_pas.c"] },
      [qcomRemoteproc, amdgpu],
    );

    expect(result.affectedLayers).toEqual(["Kernel driver / DSP firmware interface"]);
    expect(result.vendors).toEqual(["Qualcomm"]);
    expect(result.likelyStakeholders.sort()).toEqual(
      ["Device bring-up engineers", "Qualcomm platform integrators"].sort(),
    );
    expect(result.matchedBy).toEqual(["path:drivers/remoteproc/qcom_*"]);
    expect(result.suggestedAction).toMatch(/backport/i);
  });

  it("combines layers/stakeholders when a patch touches multiple subsystems", () => {
    const result = inferImpact(
      {
        subject: "[PATCH] gpu+dsp: shared buffer path",
        filePaths: ["drivers/remoteproc/qcom_common.c", "drivers/gpu/drm/amd/amdgpu_bo.c"],
      },
      [qcomRemoteproc, amdgpu],
    );

    expect(result.affectedLayers.sort()).toEqual(
      ["GPU driver / display pipeline", "Kernel driver / DSP firmware interface"].sort(),
    );
    expect(result.matchedBy).toHaveLength(2);
  });

  it("falls back to subject-prefix rules when there are no file paths (e.g. a reply)", () => {
    const subjectRule = rule({
      ruleType: "subject_prefix",
      pattern: "drm/amdgpu:",
      layer: "GPU driver / display pipeline",
      vendor: "AMD",
      stakeholders: ["AMD GPU driver maintainers"],
    });

    const result = inferImpact(
      { subject: "Re: [PATCH] drm/amdgpu: fix reset path", filePaths: [] },
      [subjectRule],
    );

    expect(result.affectedLayers).toEqual(["GPU driver / display pipeline"]);
    expect(result.matchedBy).toEqual(["subject:drm/amdgpu:"]);
  });

  it("returns no matches and a generic action for an unmapped patch", () => {
    const result = inferImpact({ subject: "[PATCH] fix typo in comment", filePaths: ["mm/memory.c"] }, [
      qcomRemoteproc,
      amdgpu,
    ]);

    expect(result.affectedLayers).toEqual([]);
    expect(result.vendors).toEqual([]);
    expect(result.likelyStakeholders).toEqual([]);
    expect(result.suggestedAction).toMatch(/no known vendor/i);
  });

  it("ignores disabled rules", () => {
    const result = inferImpact(
      { subject: "x", filePaths: ["drivers/remoteproc/qcom_x.c"] },
      [{ ...qcomRemoteproc, enabled: false }],
    );
    expect(result.affectedLayers).toEqual([]);
  });
});
