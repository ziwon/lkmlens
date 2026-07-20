import { buildLifecycleSteps, type PatchLifecycle, type ReviewSignal } from "@lkmlens/shared";

function formatDetail(key: string, detail: string | null): string {
  if (!detail) return "Not observed";
  if (key === "submitted") {
    const date = new Date(detail);
    if (!Number.isNaN(date.valueOf())) return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
  }
  return detail;
}

export function LifecycleRail({
  lifecycle,
  reviewSignals,
  submittedAt,
  compact = false,
}: {
  lifecycle: PatchLifecycle | null;
  reviewSignals: Pick<ReviewSignal, "signalType" | "personName" | "sourceUrl">[];
  submittedAt: string | null;
  compact?: boolean;
}) {
  const steps = buildLifecycleSteps(lifecycle, reviewSignals, submittedAt);

  return (
    <ol className={compact ? "grid grid-cols-4 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-800 sm:grid-cols-7" : "grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-800 sm:grid-cols-7"}>
      {steps.map((step) => (
        <li key={step.key} className={`min-w-0 bg-white ${compact ? "px-2 py-2" : "px-3 py-3"} dark:bg-slate-950`}>
          <div className="flex items-center gap-1.5">
            <span className={`size-2 shrink-0 rounded-full ${step.observed ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`} />
            <span className={`${compact ? "text-[10px]" : "text-xs"} truncate font-medium text-slate-700 dark:text-slate-300`}>
              {step.label}
            </span>
          </div>
          {!compact && (step.sourceUrl ? (
            <a href={step.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 block truncate text-xs text-emerald-700 hover:underline dark:text-emerald-400">
              {formatDetail(step.key, step.detail)} ↗
            </a>
          ) : (
            <p className={`mt-2 truncate text-xs ${step.observed ? "text-slate-600 dark:text-slate-400" : "text-slate-400 dark:text-slate-600"}`}>
              {formatDetail(step.key, step.detail)}
            </p>
          ))}
        </li>
      ))}
    </ol>
  );
}
