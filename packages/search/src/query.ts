/**
 * Query parser for the LKMLens search syntax. See docs/PLANNING.md section 9.2.
 *
 * Supported filters:
 *   topic:<slug>       list:<mailing-list>   author:<name>
 *   type:<thread_type> version:<vN>          after:<yyyy-mm-dd>
 *   before:<yyyy-mm-dd>
 *
 * Anything else is either a quoted phrase ("memory folio") or a free-text
 * term, both of which feed the FTS5 MATCH expression.
 */

import type { ThreadType } from "@lkmlens/shared";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const KNOWN_THREAD_TYPES: ReadonlySet<string> = new Set([
  "patch",
  "rfc",
  "pull_request",
  "discussion",
  "question",
  "announcement",
  "unknown",
]);

export interface ParsedQuery {
  raw: string;
  terms: string[];
  phrases: string[];
  topic?: string;
  mailingList?: string;
  author?: string;
  type?: ThreadType;
  version?: number;
  after?: string;
  before?: string;
}

const TOKEN_RE = /"[^"]*"|\S+/g;

export function parseQuery(input: string): ParsedQuery {
  const parsed: ParsedQuery = { raw: input, terms: [], phrases: [] };
  const tokens = input.trim().match(TOKEN_RE) ?? [];

  for (const token of tokens) {
    if (token.startsWith('"') && token.endsWith('"') && token.length >= 2) {
      const phrase = token.slice(1, -1).trim();
      if (phrase) parsed.phrases.push(phrase);
      continue;
    }

    const colonIndex = token.indexOf(":");
    if (colonIndex > 0) {
      const key = token.slice(0, colonIndex).toLowerCase();
      const value = token.slice(colonIndex + 1);
      if (value && applyFilter(parsed, key, value)) continue;
    }

    parsed.terms.push(token);
  }

  return parsed;
}

function applyFilter(parsed: ParsedQuery, key: string, value: string): boolean {
  switch (key) {
    case "topic":
      parsed.topic = value.toLowerCase();
      return true;
    case "list":
      parsed.mailingList = value.toLowerCase();
      return true;
    case "author":
      parsed.author = value;
      return true;
    case "type": {
      const type = value.toLowerCase();
      if (!KNOWN_THREAD_TYPES.has(type)) return false;
      parsed.type = type as ThreadType;
      return true;
    }
    case "version": {
      const match = /^v?(\d+)$/i.exec(value);
      if (!match) return false;
      parsed.version = Number(match[1]);
      return true;
    }
    case "after":
      if (!DATE_RE.test(value)) return false;
      parsed.after = value;
      return true;
    case "before":
      if (!DATE_RE.test(value)) return false;
      parsed.before = value;
      return true;
    default:
      return false;
  }
}

/**
 * Builds a FTS5 MATCH expression from the free-text terms and phrases.
 * Filter fields (topic/list/author/type/version/after/before) are applied
 * as separate SQL WHERE clauses by the caller, not folded into MATCH.
 */
export function toFtsMatchQuery(parsed: ParsedQuery): string | null {
  const clauses: string[] = [];

  for (const phrase of parsed.phrases) {
    clauses.push(`"${escapeFtsString(phrase)}"`);
  }
  for (const term of parsed.terms) {
    clauses.push(`"${escapeFtsString(term)}"`);
  }

  if (clauses.length === 0) return null;
  return clauses.join(" AND ");
}

/** FTS5 string literals escape embedded double quotes by doubling them. */
function escapeFtsString(value: string): string {
  return value.replace(/"/g, '""');
}
