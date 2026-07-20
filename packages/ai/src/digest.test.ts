import { describe, expect, it } from "vitest";
import { composeDigest } from "./digest.js";

describe("composeDigest", () => {
  it("ranks active threads and aggregates topics", () => {
    const digest = composeDigest([
      { threadId: 1, subject: "A", sourceUrl: "a", topicSlugs: ["bpf"], topicNames: ["eBPF"], messageCount: 2, lastActivityAt: "2026-07-19", overview: null, overviewEvidence: [] },
      { threadId: 2, subject: "B", sourceUrl: "b", topicSlugs: ["bpf"], topicNames: ["eBPF"], messageCount: 5, lastActivityAt: "2026-07-20", overview: "Summary", overviewEvidence: [{ messageId: "m", sourceUrl: "source" }] },
    ]);
    expect(digest.threads[0]?.threadId).toBe(2);
    expect(digest.mostActiveTopics[0]).toMatchObject({ slug: "bpf", threadCount: 2 });
  });
});
