import {
  decodeHeaderValue,
  getAllHeaders,
  getHeader,
  parseHeaders,
  splitMessage,
} from "./headers.js";
import { extractTextBody } from "./mime.js";

export interface ParsedAddress {
  name: string | null;
  email: string;
}

export interface ParsedMessage {
  messageId: string;
  inReplyTo: string | null;
  references: string[];
  subject: string;
  from: ParsedAddress | null;
  /** Short mailing-list name derived from List-Id, e.g. "rust-for-linux" from "<rust-for-linux.vger.kernel.org>". */
  mailingList: string | null;
  /** ISO 8601 if the Date header parsed cleanly, otherwise the raw header value. */
  postedAt: string | null;
  bodyText: string;
}

/** Strips RFC 5322 angle brackets from a Message-ID-shaped token. */
function stripAngleBrackets(value: string): string {
  return value.trim().replace(/^</, "").replace(/>$/, "");
}

/** Splits a whitespace-separated list of `<id>` tokens, as found in References. */
function parseIdList(value: string | undefined): string[] {
  if (!value) return [];
  const matches = value.match(/<[^<>]+>/g);
  return matches ? matches.map(stripAngleBrackets) : [];
}

function parseAddress(value: string | undefined): ParsedAddress | null {
  if (!value) return null;
  const decoded = decodeHeaderValue(value);
  const match = /^(.*?)<([^<>]+)>\s*$/.exec(decoded);
  if (match) {
    const name = (match[1] ?? "").trim().replace(/^"|"$/g, "");
    return { name: name || null, email: (match[2] ?? "").trim() };
  }
  const bareEmail = decoded.trim();
  return bareEmail ? { name: null, email: bareEmail } : null;
}

function parseMailingList(listId: string | undefined): string | null {
  if (!listId) return null;
  // RFC 2919: `List-Id: Human-readable description <list-id-string>` — the
  // bracketed id can be preceded by an arbitrary description (verified
  // against a real folded dri-devel header: "Direct Rendering
  // Infrastructure - Development <dri-devel.lists.freedesktop.org>"), so
  // extract the bracketed part specifically rather than trimming the ends
  // of the whole header value.
  const bracketed = /<([^<>]+)>/.exec(listId);
  const inner = (bracketed?.[1] ?? listId).trim();
  const dot = inner.indexOf(".");
  return dot === -1 ? inner || null : inner.slice(0, dot);
}

function parseDate(value: string | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

export function parseMessage(raw: string): ParsedMessage {
  const { headerBlock, body } = splitMessage(raw);
  const headers = parseHeaders(headerBlock);

  const messageId = stripAngleBrackets(getHeader(headers, "message-id") ?? "");
  const inReplyTo = getHeader(headers, "in-reply-to");
  const references = parseIdList(getAllHeaders(headers, "references").join(" "));
  const inReplyToId = inReplyTo ? stripAngleBrackets(inReplyTo) : null;

  return {
    messageId,
    inReplyTo: inReplyToId,
    // A References list should already include the immediate parent, but
    // some clients omit it — make sure thread-builder always sees it.
    references:
      inReplyToId && !references.includes(inReplyToId) ? [...references, inReplyToId] : references,
    subject: decodeHeaderValue(getHeader(headers, "subject")).trim(),
    from: parseAddress(getHeader(headers, "from")),
    mailingList: parseMailingList(getHeader(headers, "list-id")),
    postedAt: parseDate(getHeader(headers, "date")),
    bodyText: extractTextBody(headers, body),
  };
}
