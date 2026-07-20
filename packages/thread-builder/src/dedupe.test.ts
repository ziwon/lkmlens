import { describe, expect, it } from "vitest";
import type { ParsedMessage } from "@lkmlens/mail-parser";
import { dedupeByMessageId } from "./dedupe.js";

function stub(messageId: string): ParsedMessage {
  return {
    messageId,
    inReplyTo: null,
    references: [],
    subject: "s",
    from: null,
    mailingList: null,
    postedAt: null,
    bodyText: "",
  };
}

describe("dedupeByMessageId", () => {
  it("keeps only the first occurrence of a Message-ID", () => {
    const result = dedupeByMessageId([stub("a"), stub("b"), stub("a")]);
    expect(result.map((m) => m.messageId)).toEqual(["a", "b"]);
  });

  it("drops messages with an empty Message-ID", () => {
    const result = dedupeByMessageId([stub(""), stub("a")]);
    expect(result.map((m) => m.messageId)).toEqual(["a"]);
  });
});
