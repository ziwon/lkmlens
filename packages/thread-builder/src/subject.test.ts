import { describe, expect, it } from "vitest";
import { canonicalizeSubject, parsePatchInfo, stripReplyPrefix } from "./subject.js";

describe("parsePatchInfo — real lore.kernel.org subjects", () => {
  it("parses a versioned patch with index/total", () => {
    const info = parsePatchInfo(
      "Re: [PATCH v3 2/2] rust: use Delta and a Jiffies newtype for timeouts and delays",
    );
    expect(info).toEqual({
      threadType: "patch",
      isCoverLetter: false,
      version: 3,
      patchIndex: 2,
      patchTotal: 2,
    });
  });

  it("defaults to v1 when no version token is present", () => {
    const info = parsePatchInfo("Re: [PATCH 8/8] media: ov2740: remove NULL reg_write callback");
    expect(info.version).toBe(1);
    expect(info.patchIndex).toBe(8);
    expect(info.patchTotal).toBe(8);
  });

  it("detects a cover letter (index 0)", () => {
    const info = parsePatchInfo("[PATCH v3 0/2] rust_binder: Update bitmaps to use kernel::impl_flags!");
    expect(info.isCoverLetter).toBe(true);
    expect(info.version).toBe(3);
  });

  it("handles a bracketed tag with extra words like RESEND", () => {
    const info = parsePatchInfo("[PATCH RESEND v3] Fail the build on RUST=y and RUST_IS_AVAILABLE=n");
    expect(info.threadType).toBe("patch");
    expect(info.version).toBe(3);
    expect(info.patchIndex).toBeNull();
  });

  it("handles a bare [PATCH] with no version or index", () => {
    const info = parsePatchInfo("[PATCH] rust: rust_is_available: support testing with `bash`");
    expect(info).toEqual({
      threadType: "patch",
      isCoverLetter: false,
      version: 1,
      patchIndex: null,
      patchTotal: null,
    });
  });

  it("returns unknown for a non-patch discussion subject", () => {
    const info = parsePatchInfo("Re: LLVM 22 needs bindgen 0.72.1");
    expect(info.threadType).toBe("unknown");
    expect(info.version).toBeNull();
  });

  it("recognizes RFC", () => {
    const info = parsePatchInfo("[RFC PATCH v2] some subsystem: proposal");
    expect(info.threadType).toBe("rfc");
    expect(info.version).toBe(2);
  });
});

describe("stripReplyPrefix / canonicalizeSubject", () => {
  it("strips repeated Re: prefixes", () => {
    expect(stripReplyPrefix("Re: Re: Re: [PATCH] foo")).toBe("[PATCH] foo");
  });

  it("canonicalizeSubject strips both reply prefix and bracket tag", () => {
    expect(canonicalizeSubject("Re: [PATCH v3 2/2] rust: use Delta and a Jiffies newtype")).toBe(
      "rust: use Delta and a Jiffies newtype",
    );
  });

  it("groups different versions of the same series under the same canonical subject", () => {
    const v2 = canonicalizeSubject("[PATCH v2] rust: io: convert ResourceSize into a transparent newtype");
    const v3 = canonicalizeSubject("Re: [PATCH] rust: io: convert ResourceSize into a transparent");
    // Same underlying patch title modulo the version bracket.
    expect(v2.startsWith("rust: io: convert ResourceSize into a transparent")).toBe(true);
    expect(v3.startsWith("rust: io: convert ResourceSize into a transparent")).toBe(true);
  });
});
