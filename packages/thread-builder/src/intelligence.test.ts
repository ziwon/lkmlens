import { describe, expect, it } from "vitest";
import { extractReviewSignals, extractRevisionNotes, makeSeriesKey, summarizeFileChanges } from "./intelligence.js";

describe("patch intelligence", () => {
  it("groups revisions under one stable series key", () => {
    expect(makeSeriesKey("[PATCH v3 RESEND 0/4] bpf: improve verifier state"))
      .toBe(makeSeriesKey("Re: [RFC PATCH v1] bpf: improve verifier state"));
  });

  it("extracts explicit review trailers and ignores quoted trailers", () => {
    const signals = extractReviewSignals([
      "> Reviewed-by: Old Reviewer <old@example.com>",
      "Reviewed-by: Jane Kernel <jane@example.com>",
      "Tested-by: Device Lab <lab@example.com>",
      "Reviewed-by: Jane Kernel <jane@example.com>",
    ].join("\n"));
    expect(signals).toEqual([
      { type: "Reviewed-by", personName: "Jane Kernel", email: "jane@example.com" },
      { type: "Tested-by", personName: "Device Lab", email: "lab@example.com" },
    ]);
  });

  it("extracts bounded revision notes", () => {
    expect(extractRevisionNotes("Intro\n\nChanges since v2:\n- fix race\n- add test\n\n---\ndiff --git a/a b/a"))
      .toBe("Changes since v2:\n- fix race\n- add test");
  });

  it("summarizes changed file membership", () => {
    expect(summarizeFileChanges(["a.c", "old.c"], ["a.c", "new.c"]))
      .toBe("Added files: new.c\nRemoved files: old.c");
  });
});
