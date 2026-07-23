import { Link } from "react-router";
import type { CurationChannel } from "@lkmlens/shared";
import { fetchCurationChannels } from "../lib/api.ts";
import { useAsync } from "../lib/useAsync.ts";

const pageCopy = {
  topic: {
    title: "Topics",
    description: "Kernel subsystems and cross-cutting technical areas, curated around product impact.",
    countLabel: "topics",
    empty: "No topic channels are configured yet.",
  },
  vendor: {
    title: "Vendors",
    description: "Hardware platforms mapped to public kernel changes through explainable rules.",
    countLabel: "vendors",
    empty: "No vendor channels are configured yet.",
  },
} as const;

export default function ChannelIndex({ kind }: { kind: CurationChannel["kind"] }) {
  const result = useAsync(fetchCurationChannels, []);
  const channels = result.status === "success"
    ? result.data.filter((channel) => channel.kind === kind)
    : [];
  const copy = pageCopy[kind];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="flex flex-col items-start gap-4 border-b border-slate-300 pb-8 sm:flex-row sm:items-end sm:justify-between dark:border-slate-700">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{copy.title}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">{copy.description}</p>
        </div>
        {result.status === "success" && (
          <span className="shrink-0 font-mono text-xs text-slate-500 dark:text-slate-400">
            {channels.length} {copy.countLabel}
          </span>
        )}
      </header>

      {result.status === "loading" && <p className="py-10 text-sm text-slate-500 dark:text-slate-400">Loading {copy.countLabel}…</p>}
      {result.status === "error" && <p className="py-10 text-sm text-red-600 dark:text-red-400">Could not load {copy.countLabel} ({result.error.message}).</p>}
      {result.status === "success" && channels.length === 0 && <p className="py-10 text-sm text-slate-500 dark:text-slate-400">{copy.empty}</p>}
      {result.status === "success" && channels.length > 0 && (
        <ul>
          {channels.map((channel) => (
            <li key={channel.slug} className="border-b border-slate-200 dark:border-slate-800">
              <Link to={`/${kind === "topic" ? "topics" : "vendors"}/${channel.slug}`} className="focus-ring group block rounded-sm py-5">
                <span className="flex items-baseline justify-between gap-4">
                  <span className="text-base font-semibold text-slate-900 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">{channel.name}</span>
                  <span className="shrink-0 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {channel.patchCount} {channel.patchCount === 1 ? "patch" : "patches"}
                  </span>
                </span>
                {channel.description && <span className="mt-1 block text-sm leading-6 text-slate-500 dark:text-slate-400">{channel.description}</span>}
                {channel.trackedAreas.length > 0 && <span className="mt-2 block truncate text-xs text-slate-400 dark:text-slate-500">{channel.trackedAreas.slice(0, 3).join(" · ")}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
