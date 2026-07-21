import { Link, useSearchParams } from "react-router";
import { SearchBox } from "../components/SearchBox.tsx";
import { fetchSearch } from "../lib/api.ts";
import { useAsync } from "../lib/useAsync.ts";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const results = useAsync(() => fetchSearch(q), [q]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <SearchBox autoFocus />

      <div className="mt-8">
        {results.status === "loading" && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Searching…</p>
        )}
        {results.status === "error" && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Search failed ({results.error.message}).
          </p>
        )}
        {results.status === "success" && results.data.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No results for <span className="font-medium">"{q}"</span>. Indexing hasn't started
            yet — Kernel Lens is in early development and doesn't have any messages indexed.
          </div>
        )}
        {results.status === "success" && results.data.length > 0 && (
          <ul className="space-y-4">
            {results.data.map((r) => (
              <li
                key={r.messageId}
                className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
              >
                {r.threadId != null ? (
                  <Link
                    to={`/threads/${r.threadId}`}
                    className="font-medium text-slate-900 hover:underline dark:text-slate-100"
                  >
                    {r.subject}
                  </Link>
                ) : (
                  <span className="font-medium text-slate-900 dark:text-slate-100">{r.subject}</span>
                )}
                <p
                  className="mt-1 text-sm text-slate-600 dark:text-slate-400"
                  // Snippets come from FTS5 snippet() and only ever contain
                  // <mark>/</mark> around matched terms — no user HTML.
                  dangerouslySetInnerHTML={{ __html: r.snippet }}
                />
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-500">
                  {r.authorName && <span>{r.authorName}</span>}
                  {r.mailingList && <span>list:{r.mailingList}</span>}
                  {r.threadType && <span>{r.threadType}</span>}
                  {r.patchVersion != null && <span>v{r.patchVersion}</span>}
                  {r.postedAt && <span>{r.postedAt}</span>}
                  <a
                    href={r.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-slate-400 underline-offset-2 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    view on lore ↗
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
