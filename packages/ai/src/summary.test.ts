import { describe, expect, it } from "vitest";
import { generateEvidenceLinkedSummary, stripClaimMarkers, validateSummaryContent } from "./summary.js";

const urls = new Map([["m1", "https://lore.kernel.org/list/m1/"]]);
const valid = {
  overview: "[c1] The patch changes the scheduler API.",
  whyItMatters: "[c2] Callers must update.",
  majorChanges: [],
  reviewDiscussion: [],
  outstandingQuestions: [],
  explicitSignals: [],
  uncertainties: ["The thread is still active."],
  evidence: [
    { claimId: "c1", messageId: "m1", sourceUrl: urls.get("m1") },
    { claimId: "c2", messageId: "m1", sourceUrl: urls.get("m1") },
  ],
};

describe("evidence-linked summaries", () => {
  it("accepts claims only when exact source evidence exists", () => {
    expect(validateSummaryContent(valid, urls).overview).toContain("[c1]");
  });

  it("rejects an unsupported material claim", () => {
    expect(() => validateSummaryContent({ ...valid, whyItMatters: "[c3] Unsupported." }, urls))
      .toThrow("Claim c3 has no source evidence");
  });

  it("rejects evidence URLs not matching the canonical message", () => {
    const bad = { ...valid, evidence: [{ claimId: "c1", messageId: "m1", sourceUrl: "https://evil.invalid" }] };
    expect(() => validateSummaryContent(bad, urls)).toThrow("unknown source");
  });

  it("runs a provider and records provenance", async () => {
    const result = await generateEvidenceLinkedSummary(
      { model: "test-model", generateJson: async () => valid },
      { threadId: 1, subject: "Patch", messages: [{ messageId: "m1", authorName: "A", postedAt: null, sourceUrl: urls.get("m1")!, bodyText: "body" }] },
    );
    expect(result.model).toBe("test-model");
    expect(result.sourceSetChecksum).toHaveLength(64);
  });

  it("removes display-only claim markers", () => {
    expect(stripClaimMarkers("[c1] A fact.")).toBe("A fact.");
  });
});
