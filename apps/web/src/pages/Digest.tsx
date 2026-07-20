import { Link, useParams } from "react-router";
import type { DigestPeriod } from "@lkmlens/shared";
import { fetchDigest } from "../lib/api.ts";
import { useAsync } from "../lib/useAsync.ts";

export default function Digest() {
  const { period = "", key = "" } = useParams();
  const validPeriod = period === "daily" || period === "weekly" ? period as DigestPeriod : "daily";
  const result = useAsync(() => fetchDigest(validPeriod, key), [validPeriod, key]);
  if (result.status === "loading") return <p className="mx-auto max-w-3xl px-4 py-10 text-sm text-slate-500">Loading…</p>;
  if (result.status === "error") return <p className="mx-auto max-w-3xl px-4 py-10 text-sm text-red-600">Digest not found.</p>;
  const digest = result.data;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{digest.title}</h1>
      <p className="mt-2 text-xs text-slate-500">Published {digest.publishedAt}</p>
      {digest.content.mostActiveTopics.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {digest.content.mostActiveTopics.map((topic) => (
            <Link key={topic.slug} to={`/search?q=${encodeURIComponent(`topic:${topic.slug}`)}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {topic.name} · {topic.threadCount}
            </Link>
          ))}
        </div>
      )}
      <ol className="mt-8 space-y-5">
        {digest.content.threads.map((thread) => (
          <li key={thread.threadId} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <Link className="font-medium text-slate-900 hover:underline dark:text-white" to={`/threads/${thread.threadId}`}>{thread.subject}</Link>
            {thread.overview && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {thread.overview}{" "}
                {thread.overviewEvidence?.map((item, index) => (
                  <a key={`${item.messageId}:${index}`} href={item.sourceUrl} target="_blank" rel="noreferrer" className="ml-1 text-xs text-teal-700 hover:underline dark:text-teal-400">[{index + 1}]</a>
                ))}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <span>{thread.messageCount} messages</span>
              {thread.topicNames.map((topic) => <span key={topic}>{topic}</span>)}
              <a href={thread.sourceUrl} target="_blank" rel="noreferrer" className="underline">lore ↗</a>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
