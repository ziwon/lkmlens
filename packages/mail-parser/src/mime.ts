/**
 * Minimal MIME body extraction: finds the first text/plain leaf part
 * (recursing into multipart/*) and decodes it per Content-Transfer-Encoding.
 *
 * Not a general MIME parser — scoped to what real lore.kernel.org kernel
 * mailing-list traffic actually looks like (validated against
 * tests/fixtures/lore-samples/*.eml, including multipart/signed PGP mail
 * and quoted-printable bodies). Falls back to returning the raw body
 * unchanged for anything it doesn't recognize, per "tolerant of malformed
 * MIME" in docs/PLANNING.md section 7.5.
 */

import { getHeader, parseHeaders, quotedPrintableToBytes, type HeaderMap } from "./headers.js";

export interface ContentTypeInfo {
  type: string;
  params: Record<string, string>;
}

export function parseContentType(value: string | undefined): ContentTypeInfo {
  if (!value) return { type: "text/plain", params: {} };
  const [typePart, ...paramParts] = value.split(";");
  const type = (typePart ?? "").trim().toLowerCase() || "text/plain";
  const params: Record<string, string> = {};
  for (const part of paramParts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim().toLowerCase();
    let val = part.slice(eq + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    params[key] = val;
  }
  return { type, params };
}

export function extractTextBody(headers: HeaderMap, rawBody: string): string {
  const contentType = parseContentType(getHeader(headers, "content-type"));

  if (contentType.type.startsWith("multipart/")) {
    const boundary = contentType.params.boundary;
    if (!boundary) return rawBody;
    return extractFromMultipart(rawBody, boundary);
  }

  if (contentType.type !== "text/plain" && contentType.type.startsWith("text/") === false) {
    // Non-text top-level part (e.g. a bare application/* attachment) — no
    // readable body to extract.
    return "";
  }

  return decodeBody(rawBody, getHeader(headers, "content-transfer-encoding"));
}

function extractFromMultipart(rawBody: string, boundary: string): string {
  const delimiter = `--${boundary}`;
  const parts = rawBody.split(delimiter).slice(1, -1); // drop preamble and epilogue/closing

  for (const part of parts) {
    const trimmed = part.replace(/^\r?\n/, "");
    const blankLineIndex = trimmed.search(/\n\r?\n/);
    if (blankLineIndex === -1) continue;

    const partHeaderBlock = trimmed.slice(0, blankLineIndex);
    const partBody = trimmed.slice(blankLineIndex).replace(/^\n\r?\n/, "");
    const partHeaders = parseHeaders(partHeaderBlock.replace(/\n[ \t]/g, " "));
    const partContentType = parseContentType(getHeader(partHeaders, "content-type"));

    if (partContentType.type.startsWith("multipart/")) {
      const nestedBoundary = partContentType.params.boundary;
      if (nestedBoundary) {
        const nested = extractFromMultipart(partBody, nestedBoundary);
        if (nested) return nested;
      }
      continue;
    }

    if (partContentType.type === "text/plain") {
      return decodeBody(partBody, getHeader(partHeaders, "content-transfer-encoding"));
    }
  }

  return "";
}

function decodeBody(body: string, encoding: string | undefined): string {
  const normalized = (encoding ?? "7bit").toLowerCase();
  if (normalized === "quoted-printable") {
    return new TextDecoder("utf-8").decode(quotedPrintableToBytes(body));
  }
  if (normalized === "base64") {
    try {
      const binary = atob(body.replace(/\s+/g, ""));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new TextDecoder("utf-8").decode(bytes);
    } catch {
      return body;
    }
  }
  return body;
}
