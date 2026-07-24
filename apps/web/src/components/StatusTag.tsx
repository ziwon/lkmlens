import type { ReactNode } from "react";

/**
 * Compact factual tag (DESIGN.md 9.10). Every non-neutral tone carries a mark
 * as well as a color, so state never depends on color alone.
 */
export type TagTone = "neutral" | "evidence" | "caution" | "critical" | "info";

const toneClass: Record<TagTone, string> = {
  neutral: "border-border bg-surface-subtle text-ink-secondary",
  evidence: "border-accent/45 bg-accent-soft text-accent",
  caution: "border-warning/45 bg-warning-soft text-warning",
  critical: "border-danger/45 bg-danger-soft text-danger",
  info: "border-info/45 bg-info-soft text-info",
};

const toneMark: Record<TagTone, string | null> = {
  neutral: null,
  evidence: "●",
  caution: "◐",
  critical: "▲",
  info: "◇",
};

export function StatusTag({
  tone = "neutral",
  mark,
  className = "",
  children,
}: {
  tone?: TagTone;
  /** Override the tone's default glyph; pass `null` to drop it. */
  mark?: string | null;
  className?: string;
  children: ReactNode;
}) {
  const glyph = mark === undefined ? toneMark[tone] : mark;
  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 font-mono text-meta tracking-[0.04em] ${toneClass[tone]} ${className}`}
    >
      {glyph && (
        <span aria-hidden="true" className="text-[0.6em] leading-none">
          {glyph}
        </span>
      )}
      {children}
    </span>
  );
}

/** Neutral tag used for taxonomy labels — topics, vendors, mailing lists. */
export function MetaTag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex h-6 items-center rounded-sm border border-border bg-surface-subtle px-2 font-mono text-meta text-ink-secondary ${className}`}
    >
      {children}
    </span>
  );
}
