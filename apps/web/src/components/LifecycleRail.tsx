import { buildLifecycleSteps, type PatchLifecycle, type ReviewSignal } from "@lkmlens/shared";
import { SourceLink } from "./SourceLink.tsx";
import { formatDate } from "../lib/format.ts";

/**
 * The fixed lifecycle sequence (DESIGN.md 9.5). Every state carries a label and
 * a mark; unobserved stages say "Not observed" rather than implying rejection,
 * and the furthest observed stage is bracketed as the current position.
 */

function formatDetail(key: string, detail: string | null): string {
  if (!detail) return "Not observed";
  if (key === "submitted") return formatDate(detail, detail);
  return detail;
}

export function LifecycleRail({
  lifecycle,
  reviewSignals,
  submittedAt,
}: {
  lifecycle: PatchLifecycle | null;
  reviewSignals: Pick<ReviewSignal, "signalType" | "personName" | "sourceUrl">[];
  submittedAt: string | null;
}) {
  const steps = buildLifecycleSteps(lifecycle, reviewSignals, submittedAt);
  const currentIndex = steps.reduce(
    (latest, step, index) => (step.observed ? index : latest),
    -1,
  );

  return (
    <ol className="border-t border-border">
      {steps.map((step, index) => {
        const isCurrent = index === currentIndex;
        return (
          <li
            key={step.key}
            className={`flex items-baseline gap-3 border-b border-border py-3 pl-3 ${
              isCurrent ? "border-l-2 border-l-accent bg-accent-soft/40" : "border-l-2 border-l-transparent"
            }`}
          >
            <span
              aria-hidden="true"
              className={`w-3 shrink-0 text-center font-mono text-meta ${
                step.observed ? "text-accent" : "text-ink-faint"
              }`}
            >
              {step.observed ? "●" : "○"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span className={`text-small ${step.observed ? "font-medium text-ink" : "text-ink-muted"}`}>
                  {step.label}
                </span>
                {isCurrent && (
                  <span className="font-mono text-meta tracking-[0.06em] text-accent uppercase">
                    current
                  </span>
                )}
              </span>
              {step.sourceUrl ? (
                <SourceLink href={step.sourceUrl} className="mt-0.5 block font-mono text-meta break-all">
                  {formatDetail(step.key, step.detail)}
                </SourceLink>
              ) : (
                <span
                  className={`mt-0.5 block font-mono text-meta break-all ${
                    step.observed ? "text-ink-secondary" : "text-ink-faint"
                  }`}
                >
                  {formatDetail(step.key, step.detail)}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
