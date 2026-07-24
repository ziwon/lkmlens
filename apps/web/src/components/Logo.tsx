/**
 * Text-first wordmark mark (DESIGN.md 8.2): a quiet mono `K/L` bracket. The
 * design system rules out a magnifying-glass icon beside the name, so this is
 * deliberately typographic rather than an illustration.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-6 shrink-0 items-center rounded-sm border border-border-strong px-1.5 font-mono text-meta tracking-[0.06em] text-ink-secondary ${className}`}
    >
      K/L
    </span>
  );
}
