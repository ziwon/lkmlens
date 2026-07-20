import { Link } from "react-router";
import { fetchDigests } from "../lib/api.ts";
import { useAsync } from "../lib/useAsync.ts";

export default function Digests() {
  const result = useAsync(fetchDigests, []);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Digests</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Source-linked daily and weekly views of active kernel discussions.
      </p>
      {result.status === "loading" && <p className="mt-8 text-sm text-slate-500">Loading…</p>}
      {result.status === "error" && <p className="mt-8 text-sm text-red-600">Couldn&apos;t load digests.</p>}
      {result.status === "success" && result.data.length === 0 && (
        <p className="mt-8 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700">
          No digest has been published yet.
        </p>
      )}
      {result.status === "success" && (
        <ul className="mt-8 space-y-3">
          {result.data.map((digest) => (
            <li key={`${digest.periodType}:${digest.periodKey}`} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
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
