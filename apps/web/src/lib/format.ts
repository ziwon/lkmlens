/**
 * Date and number formatting for feed metadata (DESIGN.md 15). Relative time
 * is for scanning; the exact timestamp always stays available as a `title`.
 */

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
const exactFormat = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

function parse(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date;
}

export function formatDate(value: string | null | undefined, fallback = "Date unavailable"): string {
  const date = parse(value);
  return date ? dateFormat.format(date) : (value ?? fallback);
}

/** Exact UTC timestamp for tooltips beside relative time. */
export function formatExact(value: string | null | undefined): string | undefined {
  const date = parse(value);
  return date ? `${exactFormat.format(date)} UTC` : undefined;
}

const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "narrow" });

export function formatRelative(value: string | null | undefined): string | null {
  const date = parse(value);
  if (!date) return null;
  const seconds = (date.valueOf() - Date.now()) / 1000;
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relativeFormat.format(Math.round(seconds / size), unit);
  }
  return relativeFormat.format(Math.round(seconds), "second");
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/**
 * Vendor layers are seeded as "AMD — GPU driver / display pipeline". Inside
 * that vendor's own row or page the prefix is redundant, so drop it.
 */
export function stripChannelPrefix(area: string, channelName: string): string {
  const prefix = `${channelName} — `;
  return area.startsWith(prefix) ? area.slice(prefix.length) : area;
}
