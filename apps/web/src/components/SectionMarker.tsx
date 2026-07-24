/**
 * A monospaced region marker such as `01 / TOPICS` (DESIGN.md 9.1). Numbering
 * is decorative orientation — the surrounding heading still carries semantics.
 */
export function SectionMarker({ index, label }: { index?: string; label: string }) {
  return (
    <p className="font-mono text-meta tracking-[0.08em] text-ink-muted uppercase">
      {index && <span aria-hidden="true">{index} / </span>}
      {label}
    </p>
  );
}
