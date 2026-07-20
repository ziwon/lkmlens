import { Link } from "react-router";
import { SearchBox } from "../components/SearchBox.tsx";
import { fetchCurationChannels, fetchDigests } from "../lib/api.ts";
import { useAsync } from "../lib/useAsync.ts";

const milestones = ["LKML submission", "Review evidence", "Maintainer tree", "Mainline", "Linux release", "Stable", "Android common"];

export default function Home() {
  const channels = useAsync(fetchCurationChannels, []);
  const digests = useAsync(fetchDigests, []);
  const visibleChannels = channels.status === "success" ? channels.data.filter((channel) => channel.signalCount > 0).slice(0, 8) : [];

  return (
    <div>
      <section className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400"><span className="size-2 rounded-full bg-emerald-500" /> OPEN-SOURCE KERNEL INTELLIGENCE</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              Understand what kernel changes mean for your hardware and product.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              LKMLens follows public patches from submission through observed integration, then filters the evidence by vendor, subsystem, and the teams who need to act.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signals" className="focus-ring rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 dark:bg-white dark:text-slate-950 dark:hover:bg-emerald-300">Explore product signals</Link>
              <Link to="/about/methodology" className="focus-ring rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">See the evidence model</Link>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800"><span className="text-sm font-semibold text-slate-900 dark:text-white">Integration path</span><span className="text-xs text-slate-400">Observed, not predicted</span></div>
            <ol className="mt-2">
              {milestones.map((milestone, index) => (
                <li key={milestone} className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-slate-800/80">
                  <span className={`grid size-6 place-items-center rounded-full border text-xs font-mono ${index < 2 ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "border-slate-300 text-slate-400 dark:border-slate-700"}`}>{index < 2 ? "✓" : "–"}</span>
                  <span className={`text-sm ${index < 2 ? "font-medium text-slate-800 dark:text-slate-200" : "text-slate-500"}`}>{milestone}</span>
                  <span className="ml-auto text-xs text-slate-400">{index < 2 ? "Evidence linked" : "Not observed"}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between gap-4 border-b border-slate-300 pb-5 dark:border-slate-700">
          <div><h2 className="text-xl font-semibold text-slate-950 dark:text-white">Curated lenses</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Watch product surfaces, not inbox volume.</p></div>
          <Link to="/signals" className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">All topics and vendors →</Link>
        </div>
        {channels.status === "loading" && <p className="py-8 text-sm text-slate-500">Loading lenses…</p>}
        {channels.status === "error" && <p className="py-8 text-sm text-red-600">Could not load lenses.</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4">
          {visibleChannels.map((channel) => (
            <Link key={`${channel.kind}:${channel.slug}`} to={`/${channel.kind === "topic" ? "topics" : "vendors"}/${channel.slug}`} className="focus-ring group border-b border-slate-200 py-5 sm:odd:pr-6 sm:even:pl-6 lg:border-r lg:px-5 lg:first:pl-0 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-400">{channel.kind === "vendor" ? "Vendor" : "Topic"}</span>
              <span className="mt-1 block font-semibold text-slate-900 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">{channel.name}</span>
              <span className="mt-3 block font-mono text-xs text-slate-500">{channel.signalCount} observed signals</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
          <div><h2 className="text-xl font-semibold text-slate-950 dark:text-white">Investigate the source</h2><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Search remains available for deep investigation after a signal earns your attention.</p></div>
          <SearchBox />
        </div>
      </section>

      {digests.status === "success" && digests.data.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex items-center justify-between border-b border-slate-300 pb-4 dark:border-slate-700"><h2 className="text-lg font-semibold text-slate-950 dark:text-white">Decision briefings</h2><Link to="/digests" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">View all</Link></div>
          <ul>{digests.data.slice(0, 3).map((digest) => <li key={`${digest.periodType}:${digest.periodKey}`} className="border-b border-slate-200 dark:border-slate-800"><Link to={`/digests/${digest.periodType}/${digest.periodKey}`} className="focus-ring flex items-center justify-between gap-4 rounded-sm py-5"><span className="font-medium text-slate-900 dark:text-white">{digest.title}</span><span className="font-mono text-xs text-slate-500">{digest.content.threads.length} signals →</span></Link></li>)}</ul>
        </section>
      )}
    </div>
  );
}
