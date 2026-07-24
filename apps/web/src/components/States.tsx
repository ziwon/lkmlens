import type { ReactNode } from "react";

/**
 * Loading, error, and empty states (DESIGN.md 16.4, 16.5). Skeletons preserve
 * the final row layout instead of a centred spinner, and empty states explain
 * the system rather than showing an illustration.
 */

export function SkeletonRows({ rows = 3, label }: { rows?: number; label: string }) {
  return (
    <div role="status" aria-live="polite" className="border-t border-border">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="border-b border-border py-6" aria-hidden="true">
          <div className="h-3 w-24 rounded-xs bg-surface-strong" />
          <div className="mt-3 h-4 w-[min(28rem,80%)] rounded-xs bg-surface-strong" />
          <div className="mt-2.5 h-3 w-[min(18rem,55%)] rounded-xs bg-surface-subtle" />
        </div>
      ))}
      <p className="py-4 text-small text-ink-muted">{label}</p>
    </div>
  );
}

export function LoadingNote({ children }: { children: ReactNode }) {
  return (
    <p role="status" aria-live="polite" className="py-8 text-small text-ink-muted">
      {children}
    </p>
  );
}

export function ErrorState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div
      role="alert"
      className="border border-border border-l-2 border-l-danger bg-surface px-5 py-4"
    >
      <p className="font-mono text-meta tracking-[0.08em] text-danger uppercase">Error</p>
      <p className="mt-2 text-body text-ink">{title}</p>
      {detail && <p className="mt-1 font-mono text-meta text-ink-muted">{detail}</p>}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="border border-dashed border-border-strong px-5 py-6">
      <p className="text-body text-ink">{title}</p>
      {children && <div className="mt-2 max-w-[68ch] text-small text-ink-muted">{children}</div>}
    </div>
  );
}
