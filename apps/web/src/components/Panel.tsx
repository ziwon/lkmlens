import type { ReactNode } from "react";

/**
 * Evidence and interpretation surfaces (DESIGN.md 9.6, 9.7). Both are plain
 * bordered regions with a mono label; the distinction is carried by the rule
 * color and the label, never by making interpretation louder than evidence.
 */

function PanelShell({
  label,
  note,
  rule,
  surface,
  labelClass,
  children,
}: {
  label: string;
  note?: ReactNode;
  rule: string;
  surface: string;
  labelClass: string;
  children: ReactNode;
}) {
  return (
    <section className={`border border-border border-l-2 ${rule} ${surface} px-5 py-4`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className={`font-mono text-meta tracking-[0.08em] uppercase ${labelClass}`}>{label}</h2>
        {note && <p className="font-mono text-meta text-ink-muted">{note}</p>}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Canonical source material or explicitly extracted facts. */
export function EvidencePanel({
  label = "Evidence",
  note,
  children,
}: {
  label?: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <PanelShell
      label={label}
      note={note}
      rule="border-l-accent"
      surface="bg-surface"
      labelClass="text-accent"
    >
      {children}
    </PanelShell>
  );
}

/** AI-generated reading of the evidence — labelled, and never emphasised above it. */
export function InterpretationPanel({
  label = "AI summary",
  note,
  children,
}: {
  label?: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <PanelShell
      label={label}
      note={note}
      rule="border-l-warning"
      surface="bg-surface-subtle"
      labelClass="text-ink-secondary"
    >
      {children}
    </PanelShell>
  );
}
