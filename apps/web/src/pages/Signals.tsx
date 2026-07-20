import { Link } from "react-router";
import { fetchCurationChannels } from "../lib/api.ts";
import { useAsync } from "../lib/useAsync.ts";

export default function Signals() {
  const result = useAsync(fetchCurationChannels, []);
  const channels = result.status === "success" ? result.data : [];
  const topics = channels.filter((channel) => channel.kind === "topic");
  const vendors = channels.filter((channel) => channel.kind === "vendor");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-3xl">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">CURATED KERNEL SIGNALS</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
          Follow the hardware and kernel areas your product depends on.
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
          Channels connect public patch activity to explicit review evidence and observed integration milestones. No merge prediction, no activity-score theater.
        </p>
      </header>

      {result.status === "loading" && <p className="mt-10 text-sm text-slate-500">Loading channels…</p>}
      {result.status === "error" && <p className="mt-10 text-sm text-red-600">Could not load channels ({result.error.message}).</p>}
      {result.status === "success" && (
        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <ChannelList title="Topics" description="Subsystem and cross-cutting kernel areas." channels={topics} />
          <ChannelList title="Vendors" description="Hardware platform signals derived from explainable rules." channels={vendors} />
        </div>
      )}
    </div>
  );
}

function ChannelList({ title, description, channels }: { title: string; description: string; channels: Awaited<ReturnType<typeof fetchCurationChannels>> }) {
  return (
    <section>
      <div className="border-b border-slate-300 pb-4 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <ul>
        {channels.map((channel) => (
          <li key={`${channel.kind}:${channel.slug}`} className="border-b border-slate-200 dark:border-slate-800">
            <Link to={`/${channel.kind === "topic" ? "topics" : "vendors"}/${channel.slug}`} className="focus-ring group flex items-start justify-between gap-4 rounded-sm py-5">
              <span>
                <span className="font-medium text-slate-900 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">{channel.name}</span>
                {channel.description && <span className="mt-1 block text-sm leading-6 text-slate-500 dark:text-slate-400">{channel.description}</span>}
                {channel.trackedAreas.length > 0 && <span className="mt-2 block text-xs text-slate-400">{channel.trackedAreas.slice(0, 3).join(" · ")}</span>}
              </span>
              <span className="shrink-0 font-mono text-xs text-slate-500">{channel.signalCount}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
