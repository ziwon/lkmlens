/**
 * RFC 5322 header parsing: unfolding, name/value splitting, and RFC 2047
 * encoded-word decoding for headers like Subject/From/Cc.
 *
 * Deliberately conservative — this only needs to handle real lore.kernel.org
 * traffic (validated against tests/fixtures/lore-samples/*.eml), not the
 * full RFC.
 */

export type HeaderMap = Map<string, string[]>;

/** Splits a raw message into its header block and body, unfolding headers. */
export function splitMessage(raw: string): { headerBlock: string; body: string } {
  const normalized = raw.replace(/\r\n/g, "\n");
  const blankLineIndex = normalized.indexOf("\n\n");
  if (blankLineIndex === -1) {
    return { headerBlock: unfold(normalized), body: "" };
  }
  return {
    headerBlock: unfold(normalized.slice(0, blankLineIndex)),
    body: normalized.slice(blankLineIndex + 2),
  };
}

/** Joins folded header continuation lines (leading whitespace) onto the previous line. */
function unfold(headerBlock: string): string {
  return headerBlock.replace(/\n[ \t]+/g, " ");
}

export function parseHeaders(headerBlock: string): HeaderMap {
  const headers: HeaderMap = new Map();
  for (const line of headerBlock.split("\n")) {
    if (!line.trim()) continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const name = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    const existing = headers.get(name);
    if (existing) existing.push(value);
    else headers.set(name, [value]);
  }
  return headers;
}

export function getHeader(headers: HeaderMap, name: string): string | undefined {
  return headers.get(name.toLowerCase())?.[0];
}

export function getAllHeaders(headers: HeaderMap, name: string): string[] {
  return headers.get(name.toLowerCase()) ?? [];
}

const ENCODED_WORD_RE = /=\?([^?]+)\?([QqBb])\?([^?]*)\?=/g;

/** Decodes RFC 2047 encoded-words (=?charset?Q|B?...?=) found in header values. */
export function decodeHeaderValue(value: string | undefined): string {
  if (!value) return "";
  return value.replace(ENCODED_WORD_RE, (_match, charset: string, enc: string, text: string) => {
    try {
      const bytes =
        enc.toUpperCase() === "B" ? base64ToBytes(text) : quotedPrintableToBytes(text.replace(/_/g, " "));
      return new TextDecoder(normalizeCharset(charset)).decode(bytes);
    } catch {
      return text;
    }
  });
}

function normalizeCharset(charset: string): string {
  const lower = charset.toLowerCase();
  // TextDecoder doesn't recognize "unknown-8bit"; Latin-1 is the closest safe default.
  return lower === "unknown-8bit" ? "iso-8859-1" : lower;
}

function base64ToBytes(text: string): Uint8Array {
  const binary = atob(text.replace(/\s+/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function quotedPrintableToBytes(text: string): Uint8Array {
  const cleaned = text.replace(/=\r?\n/g, ""); // soft line breaks
  const bytes: number[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === "=" && /^[0-9A-Fa-f]{2}$/.test(cleaned.slice(i + 1, i + 3))) {
      bytes.push(parseInt(cleaned.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(cleaned.charCodeAt(i));
    }
  }
  return new Uint8Array(bytes);
}
