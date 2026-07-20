import { Link } from "react-router";
import { SearchBox } from "../components/SearchBox.tsx";
import { fetchTopics } from "../lib/api.ts";
import { useAsync } from "../lib/useAsync.ts";

export default function Home() {
  const topics = useAsync(fetchTopics, []);

  return (
    <div>
      <section className="mx-auto max-w-5xl px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-24">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          A clearer view into Linux kernel development.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 sm:text-lg dark:text-slate-400">
          Search patches, discussions, authors, symbols, and subsystems.
        </p>

        <div className="mx-auto mt-8 max-w-2xl">
          <SearchBox />
        </div>
        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
          Try{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 font-mono dark:bg-slate-800">
            topic:ebpf verifier
          </code>{" "}
          or{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 font-mono dark:bg-slate-800">
            author:torvalds
          </code>
        </p>
      </section>

      <section id="topics" className="mx-auto max-w-5xl scroll-mt-20 px-4 pb-20 sm:px-6">
        <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          Topics
        </h2>

        {topics.status === "loading" && (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading topics…</p>
        )}
        {topics.status === "error" && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">
            Couldn't load topics ({topics.error.message}).
          </p>
        )}
        {topics.status === "success" && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topics.data.map((topic) => (
              <Link
                key={topic.slug}
                to={`/search?q=${encodeURIComponent(`topic:${topic.slug}`)}`}
                className="focus-ring group rounded-lg border border-slate-200 bg-white p-4 transition hover:border-teal-400 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-500"
              >
                <div className="font-medium text-slate-900 group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-400">
                  {topic.name}
                </div>
                {topic.description && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {topic.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
