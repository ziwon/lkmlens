/**
 * Splits a raw mailing-list message body into the blocks DESIGN.md 9.8 asks
 * for: proportional prose, quoted replies behind a left rule, monospaced patch
 * or code hunks, and a collapsible trailing signature.
 */

export type BodyBlock =
  | { kind: "prose"; text: string }
  | { kind: "quote"; text: string; depth: number }
  | { kind: "code"; text: string }
  | { kind: "signature"; text: string };

/** A git-format-patch hunk: everything from here down is a diff, not prose. */
const PATCH_START = /^(diff --git |Index: |--- a\/|@@ .* @@)/;
const QUOTE = /^\s*(>+)\s?/;
const SIGNATURE = /^-- ?$/;

function quoteDepth(line: string): number {
  return QUOTE.exec(line)?.[1]?.length ?? 0;
}

function stripQuote(line: string): string {
  return line.replace(/^\s*>+\s?/, "");
}

export function parseMessageBody(body: string): BodyBlock[] {
  const lines = body.replace(/\r\n/g, "\n").split("\n");

  // Trailing signature, per RFC 3676: the last `-- ` delimiter line.
  let signatureAt = -1;
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (SIGNATURE.test(lines[i]!)) {
      signatureAt = i;
      break;
    }
  }
  const signature = signatureAt >= 0 ? lines.slice(signatureAt + 1).join("\n").trim() : "";
  const head = signatureAt >= 0 ? lines.slice(0, signatureAt) : lines;

  // The diff, if present, runs from its first marker to the end of the body.
  const patchAt = head.findIndex((line) => PATCH_START.test(line));
  const prose = patchAt >= 0 ? head.slice(0, patchAt) : head;
  const patch = patchAt >= 0 ? head.slice(patchAt).join("\n").trimEnd() : "";

  const blocks: BodyBlock[] = [];
  let buffer: string[] = [];
  let bufferDepth = -1;

  function flush() {
    const text = buffer.join("\n").trim();
    buffer = [];
    if (!text) return;
    // Nesting is flattened to one rule: deeper levels stay legible without
    // stacking indentation the reader has to unpick.
    if (bufferDepth > 0) blocks.push({ kind: "quote", text, depth: bufferDepth });
    else blocks.push({ kind: "prose", text });
  }

  for (const line of prose) {
    const depth = quoteDepth(line);
    if (depth !== bufferDepth) {
      flush();
      bufferDepth = depth;
    }
    buffer.push(depth > 0 ? stripQuote(line) : line);
  }
  flush();

  if (patch) blocks.push({ kind: "code", text: patch });
  if (signature) blocks.push({ kind: "signature", text: signature });

  return blocks;
}
