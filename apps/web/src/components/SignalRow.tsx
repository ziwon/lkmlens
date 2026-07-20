import { Link } from "react-router";
import type { CurationSignal, PatchLifecycleStage } from "@lkmlens/shared";

const stageLabels: Record<PatchLifecycleStage, string> = {
  submitted: "Submitted",
  "under-review": "Review evidence",
  "maintainer-tree": "Maintainer tree",
  mainline: "Mainline",
  released: "Released",
  "stable-backport": "Stable backport",
  "android-common": "Android common",
};

function formatDate(value: string | null) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

export function SignalRow({ signal }: { signal: CurationSignal }) {
  return (
    <article className="border-b border-slate-200 py-6 last:border-0 dark:border-slate-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {stageLabels[signal.lifecycleStage]}
            </span>
            {signal.patchVersion != null && <span>v{signal.patchVersion}</span>}
            <span>{formatDate(signal.firstPostedAt)}</span>
          </div>
          <h2 className="mt-2 text-base font-semibold leading-6 text-slate-950 dark:text-white">
            <Link className="focus-ring rounded-sm hover:text-emerald-700 dark:hover:text-emerald-400" to={`/threads/${signal.threadId}`}>
              {signal.subject}
            </Link>
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {signal.authorName ?? "Unknown author"}
          </p>
        </div>
        <div className="flex shrink-0 gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span><strong className="font-semibold text-slate-800 dark:text-slate-200">{signal.reviewedCount}</strong> reviewed</span>
          <span><strong className="font-semibold text-slate-800 dark:text-slate-200">{signal.ackedCount}</strong> acked</span>
        </div>
      </div>

      {(signal.affectedLayers.length > 0 || signal.likelyStakeholders.length > 0) && (
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-500">Product surface</dt>
            <dd className="mt-1 text-slate-700 dark:text-slate-300">{signal.affectedLayers.join(", ") || "Unclassified"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-500">Who should look</dt>
            <dd className="mt-1 text-slate-700 dark:text-slate-300">{signal.likelyStakeholders.join(", ") || "Not mapped"}</dd>
          </div>
        </dl>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {[...signal.vendors, ...signal.topics].map((label) => (
          <span key={label} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-400">{label}</span>
        ))}
      </div>
    </article>
  );
}
