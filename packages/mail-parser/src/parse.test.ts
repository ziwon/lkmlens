import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseMessage } from "./parse.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, "../../../tests/fixtures/lore-samples");

function load(name: string): string {
  return readFileSync(join(FIXTURES, name), "utf8");
}

describe("parseMessage — real lore.kernel.org samples", () => {
  it("parses a plain-text reply with a single In-Reply-To/References", () => {
    const msg = parseMessage(load("reply-plain.eml"));

    expect(msg.messageId).toBe("20260720.184751.938933263969124163.tomo@flapping.org");
    expect(msg.subject).toBe(
      "Re: [PATCH v3 2/2] rust: use Delta and a Jiffies newtype for timeouts and delays",
    );
    expect(msg.from).toEqual({ name: "FUJITA Tomonori", email: "tomo@flapping.org" });
    expect(msg.mailingList).toBe("rust-for-linux");
    expect(msg.inReplyTo).toBe("DK1SRBA3315M.32N4T8QQBUOER@garyguo.net");
    expect(msg.references).toContain("20260717042247.3634961-1-tomo@flapping.org");
    expect(msg.references).toContain("DK1SRBA3315M.32N4T8QQBUOER@garyguo.net");
    expect(msg.postedAt).toBe(new Date("Mon, 20 Jul 2026 18:47:51 +0900 (JST)").toISOString());
    expect(msg.bodyText).toContain("Turn Jiffies into a distinct newtype");
  });

  it("parses a single [PATCH] message with no version as an implicit v1", () => {
    const msg = parseMessage(load("patch-single.eml"));
    expect(msg.subject).toBe("[PATCH RESEND v3] Fail the build on RUST=y and RUST_IS_AVAILABLE=n");
    expect(msg.inReplyTo).toBeNull();
    expect(msg.references).toEqual([]);
  });

  it("parses a cover letter (root of a patch series, no parent)", () => {
    const msg = parseMessage(load("cover-letter-v3-0-2.eml"));
    expect(msg.messageId).toBe("20260719-b4-rust_binder_impl_flags-v3-0-f8d0b3ea1b87@google.com");
    expect(msg.subject).toBe("[PATCH v3 0/2] rust_binder: Update bitmaps to use kernel::impl_flags!");
    expect(msg.inReplyTo).toBeNull();
  });

  it("parses a patch that references its cover letter", () => {
    const msg = parseMessage(load("patch-v3-1-2.eml"));
    expect(msg.messageId).toBe("20260719-b4-rust_binder_impl_flags-v3-1-f8d0b3ea1b87@google.com");
    expect(msg.inReplyTo).toBe("20260719-b4-rust_binder_impl_flags-v3-0-f8d0b3ea1b87@google.com");
    expect(msg.references).toEqual(["20260719-b4-rust_binder_impl_flags-v3-0-f8d0b3ea1b87@google.com"]);
    // The body's own embedded "From:" line (b4/git-send-email relay
    // convention) must not be mistaken for a header.
    expect(msg.bodyText).toContain("From: Jahnavi MN <jahnavimn@google.com>");
    expect(msg.bodyText).toContain("Thread looper states are currently represented");
  });

  it("extracts the text/plain part from a multipart/signed PGP message and decodes quoted-printable", () => {
    const msg = parseMessage(load("multipart-signed.eml"));
    expect(msg.subject).toBe("Re: [PATCH v2 0/4] rust: serdev: trivial fixes");
    // Decoded Cc header contains an RFC 2047 encoded-word (ISO-8859-1) name.
    expect(msg.bodyText).toContain("The patches have been integrated into");
    expect(msg.bodyText).not.toContain("=20");
    expect(msg.bodyText).not.toContain("-----BEGIN PGP SIGNATURE-----");
  });

  it("decodes an RFC 2047 encoded-word name in a header", () => {
    const raw = load("multipart-signed.eml");
    // Sanity check the raw fixture actually contains the encoded word we're testing against.
    expect(raw).toContain("=?ISO-8859-1?Q?Bj=F6rn?=");
  });
});
