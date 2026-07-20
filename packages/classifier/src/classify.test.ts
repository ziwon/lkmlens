import { describe, expect, it } from "vitest";
import { classifyMessage, type TopicRuleSet } from "./classify.js";
import type { TopicRule } from "@lkmlens/shared";

function rule(partial: Partial<TopicRule> & Pick<TopicRule, "ruleType" | "pattern">): TopicRule {
  return {
    id: 0,
    topicId: 0,
    weight: 1,
    isNegative: false,
    enabled: true,
    ...partial,
  };
}

const ebpf: TopicRuleSet = {
  topicSlug: "ebpf",
  rules: [
    rule({ ruleType: "mailing_list", pattern: "bpf", weight: 3 }),
    rule({ ruleType: "patch_prefix", pattern: "[PATCH bpf-next]", weight: 3 }),
    rule({ ruleType: "file_path", pattern: "kernel/bpf/**", weight: 4 }),
    rule({ ruleType: "alias", pattern: "eBPF", weight: 1.5 }),
    rule({ ruleType: "body", pattern: "verifier", weight: 0.5 }),
  ],
};

const containers: TopicRuleSet = {
  topicSlug: "containers",
  rules: [rule({ ruleType: "alias", pattern: "container", weight: 1 })],
};

describe("classifyMessage", () => {
  it("sums matched rule weights and explains the match", () => {
    const matches = classifyMessage(
      {
        subject: "[PATCH bpf-next] xdp: fix verifier edge case",
        mailingList: "bpf",
        bodyText: "The eBPF verifier now rejects this pattern.",
        filePaths: ["kernel/bpf/verifier.c"],
      },
      [ebpf, containers],
    );
    const top = matches[0];
    expect(top).toBeDefined();
    if (!top) return;

    expect(top.topic).toBe("ebpf");
    expect(top.score).toBeCloseTo(3 + 3 + 4 + 1.5 + 0.5);
    expect(top.matchedBy).toEqual(
      expect.arrayContaining([
        "mailing-list:bpf",
        "subject:[PATCH bpf-next]",
        "path:kernel/bpf/**",
        "alias:eBPF",
        "body:verifier",
      ]),
    );
  });

  it("does not false-positive on generic word substrings", () => {
    const matches = classifyMessage(
      {
        subject: "Re: proposal for containerized build cache",
        mailingList: "linux-mm",
        bodyText: "unrelated to namespaces or cgroups",
      },
      [containers],
    );

    // "container" must not match inside "containerized" (word-boundary rule).
    expect(matches).toHaveLength(0);
  });

  it("does not false-positive an all-caps acronym alias against a lowercase code identifier", () => {
    // Real false positive found ingesting rust-for-linux: a patch about
    // id_pool/bitmap quoted a diff touching `pub mod gpu;` (a Rust module),
    // which used to match the "GPU" alias for the GPU & Graphics topic.
    const gpu: TopicRuleSet = { topicSlug: "gpu", rules: [rule({ ruleType: "alias", pattern: "GPU", weight: 1.5 })] };

    const falsePositive = classifyMessage(
      {
        subject: "Re: [PATCH] rust: bitmap: encourage using xarray/maple_tree instead of id_pool",
        bodyText: "> +++ b/rust/kernel/lib.rs\n>  pub mod gpu;\n>  #[cfg(CONFIG_I2C = \"y\")]",
      },
      [gpu],
    );
    expect(falsePositive).toHaveLength(0);

    const truePositive = classifyMessage(
      { subject: "drm/amdgpu: fix GPU reset path", bodyText: "" },
      [gpu],
    );
    expect(truePositive).toHaveLength(1);
    expect(truePositive[0]?.topic).toBe("gpu");
  });

  it("subtracts negative rules and can suppress a topic entirely", () => {
    const gpuWithNegative: TopicRuleSet = {
      topicSlug: "gpu",
      rules: [
        rule({ ruleType: "alias", pattern: "GPU", weight: 1 }),
        rule({
          ruleType: "body",
          pattern: "GPU cluster autoscaler",
          weight: 5,
          isNegative: true,
        }),
      ],
    };

    const matches = classifyMessage(
      {
        subject: "drm/amdgpu: fix GPU reset path",
        bodyText: "This is not about the GPU cluster autoscaler.",
      },
      [gpuWithNegative],
    );

    expect(matches).toHaveLength(0);
  });

  it("respects disabled rules", () => {
    const matches = classifyMessage(
      { subject: "sched_ext: improve latency", mailingList: "bpf" },
      [
        {
          topicSlug: "ebpf",
          rules: [rule({ ruleType: "mailing_list", pattern: "bpf", weight: 3, enabled: false })],
        },
      ],
    );
    expect(matches).toHaveLength(0);
  });
});
