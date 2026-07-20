import { Link } from "react-router";
import { fetchDigests } from "../lib/api.ts";
import { useAsync } from "../lib/useAsync.ts";

export default function Digests() {
  const result = useAsync(fetchDigests, []);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Digests</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Daily and weekly reports of selected tracked threads. Each digest is a starting point for investigation, not a merge, approval, or importance ranking.
          </p>
        </div>
        <a href="/rss/weekly.xml" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:text-emerald-400">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 11a8 8 0 0 1 8 8" />
            <path d="M5 5a14 14 0 0 1 14 14" />
            <circle cx="6" cy="18" r="1" fill="currentColor" stroke="none" />
          </svg>
          Weekly RSS
        </a>
      </div>
      {result.status === "loading" && <p className="mt-8 text-sm text-slate-500">Loading…</p>}
      {result.status === "error" && <p className="mt-8 text-sm text-red-600">Couldn&apos;t load digests.</p>}
      {result.status === "success" && result.data.length === 0 && (
        <p className="mt-8 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">
          No digest has been published yet. Scheduled daily and weekly editions will appear here after tracked threads are selected.
        </p>
      )}
      {result.status === "success" && (
        <ul className="mt-8 border-t border-slate-200 dark:border-slate-800">
          {result.data.map((digest) => (
            <li key={`${digest.periodType}:${digest.periodKey}`} className="border-b border-slate-200 py-5 dark:border-slate-800">
              <Link className="font-medium text-slate-900 hover:underline dark:text-white" to={`/digests/${digest.periodType}/${digest.periodKey}`}>
                {digest.title}
              </Link>
              <p className="mt-1 text-xs text-slate-500">{digest.content.threads.length} selected threads · published {digest.publishedAt}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
