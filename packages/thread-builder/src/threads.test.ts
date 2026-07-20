import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseMessage, type ParsedMessage } from "@lkmlens/mail-parser";
import { describe, expect, it } from "vitest";
import { buildThreads } from "./threads.js";
import { dedupeByMessageId } from "./dedupe.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, "../../../tests/fixtures/lore-samples");

function load(name: string): ParsedMessage {
  return parseMessage(readFileSync(join(FIXTURES, name), "utf8"));
}

function stub(partial: Partial<ParsedMessage> & Pick<ParsedMessage, "messageId">): ParsedMessage {
  return {
    inReplyTo: null,
    references: [],
    subject: "test",
    from: { name: "Someone", email: "someone@example.com" },
    mailingList: "test-list",
    postedAt: "2026-01-01T00:00:00.000Z",
    bodyText: "",
    ...partial,
  };
}

describe("buildThreads", () => {
  it("groups a root and its replies into one thread", () => {
    const root = stub({ messageId: "root@x", subject: "[PATCH] fix thing" });
    const reply1 = stub({
      messageId: "reply1@x",
      subject: "Re: [PATCH] fix thing",
      inReplyTo: "root@x",
      references: ["root@x"],
      postedAt: "2026-01-02T00:00:00.000Z",
    });
    const reply2 = stub({
      messageId: "reply2@x",
      subject: "Re: [PATCH] fix thing",
      inReplyTo: "reply1@x",
      references: ["root@x", "reply1@x"],
      postedAt: "2026-01-03T00:00:00.000Z",
    });

    const { threads, assignments } = buildThreads([reply2, root, reply1]);

    expect(threads).toHaveLength(1);
    const thread = threads[0];
    expect(thread).toBeDefined();
    if (!thread) return;
    expect(thread.rootMessageId).toBe("root@x");
    expect(thread.messageIds.sort()).toEqual(["reply1@x", "reply2@x", "root@x"]);
    expect(thread.rootConfidence).toBe("complete");
    expect(thread.threadType).toBe("patch");
    expect(thread.firstPostedAt).toBe("2026-01-01T00:00:00.000Z");
    expect(thread.lastActivityAt).toBe("2026-01-03T00:00:00.000Z");
    expect(assignments).toHaveLength(3);
    expect(assignments.every((a) => a.rootMessageId === "root@x")).toBe(true);
  });

  it("marks a thread partial when the true parent lies outside the batch", () => {
    const orphanReply = stub({
      messageId: "reply@x",
      subject: "Re: [PATCH] fix thing",
      inReplyTo: "unknown-parent@elsewhere",
      references: ["unknown-parent@elsewhere"],
    });

    const { threads } = buildThreads([orphanReply]);

    expect(threads).toHaveLength(1);
    const thread = threads[0];
    expect(thread).toBeDefined();
    if (!thread) return;
    expect(thread.rootMessageId).toBe("reply@x");
    expect(thread.rootConfidence).toBe("partial");
  });

  it("keeps two independent threads separate", () => {
    const a = stub({ messageId: "a@x", subject: "[PATCH] a" });
    const b = stub({ messageId: "b@x", subject: "[PATCH] b" });

    const { threads } = buildThreads([a, b]);
    expect(threads).toHaveLength(2);
  });

  it("does not infinite-loop on a circular reference", () => {
    const a = stub({ messageId: "a@x", inReplyTo: "b@x" });
    const b = stub({ messageId: "b@x", inReplyTo: "a@x" });

    const { threads } = buildThreads([a, b]);
    expect(threads.length).toBeGreaterThan(0); // just must terminate
  });

  it("groups a real cover letter with its patch replies from lore.kernel.org fixtures", () => {
    const cover = load("cover-letter-v3-0-2.eml");
    const patch1 = load("patch-v3-1-2.eml");

    const { threads } = buildThreads(dedupeByMessageId([cover, patch1]));

    expect(threads).toHaveLength(1);
    const thread = threads[0];
    expect(thread).toBeDefined();
    if (!thread) return;
    expect(thread.rootMessageId).toBe(cover.messageId);
    expect(thread.messageIds).toContain(patch1.messageId);
    expect(thread.threadType).toBe("patch");
    expect(thread.patchVersion).toBe(3);
    expect(thread.rootConfidence).toBe("complete");
  });
});
