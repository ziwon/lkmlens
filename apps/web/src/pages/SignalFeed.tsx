import { Link, useParams } from "react-router";
import { SignalRow } from "../components/SignalRow.tsx";
import { fetchCurationFeed } from "../lib/api.ts";
import { useAsync } from "../lib/useAsync.ts";

export default function SignalFeed({ kind }: { kind: "topic" | "vendor" }) {
  const { slug = "" } = useParams();
  const result = useAsync(() => fetchCurationFeed(kind, slug), [kind, slug]);

  if (result.status === "loading") return <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500">Loading signals…</p>;
  if (result.status === "error") return <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-red-600">{result.error.message === "not-found" ? "Channel not found." : `Could not load channel (${result.error.message}).`}</p>;

  const { channel, signals } = result.data;
  const indexPath = kind === "vendor" ? "/vendors" : "/topics";
  const indexLabel = kind === "vendor" ? "All vendors" : "All topics";
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Link to={indexPath} className="text-sm text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400">← {indexLabel}</Link>
      <header className="mt-8 grid gap-6 border-b border-slate-300 pb-8 dark:border-slate-700 lg:grid-cols-[1fr_20rem]">
        <div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{kind === "vendor" ? "VENDOR LENS" : "TOPIC LENS"}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{channel.name}</h1>
          {channel.description && <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">{channel.description}</p>}
        </div>
        <dl className="grid grid-cols-2 gap-4 border-l-0 border-slate-200 lg:border-l lg:pl-8 dark:border-slate-800">
          <div><dt className="text-xs text-slate-500">Observed signals</dt><dd className="mt-1 font-mono text-2xl text-slate-950 dark:text-white">{channel.signalCount}</dd></div>
          <div><dt className="text-xs text-slate-500">Feed order</dt><dd className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">Evidence first</dd></div>
        </dl>
      </header>

      {channel.trackedAreas.length > 0 && (
        <div className="border-b border-slate-200 py-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300">Tracked surfaces:</span> {channel.trackedAreas.join(" · ")}
        </div>
      )}

      <section aria-label={`${channel.name} signals`}>
        {signals.length === 0 ? (
          <div className="py-16 text-center"><p className="text-slate-700 dark:text-slate-300">No matched public signals yet.</p><p className="mt-2 text-sm text-slate-500">The channel is configured; evidence will appear after impact indexing runs.</p></div>
        ) : signals.map((signal) => <SignalRow key={signal.threadId} signal={signal} />)}
      </section>
    </div>
  );
}
