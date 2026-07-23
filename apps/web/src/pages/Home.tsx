import { Link } from "react-router";
import { SearchBox } from "../components/SearchBox.tsx";
import { fetchCurationChannels, fetchDigests } from "../lib/api.ts";
import { useAsync } from "../lib/useAsync.ts";

export default function Home() {
  const channels = useAsync(fetchCurationChannels, []);
  const digests = useAsync(fetchDigests, []);
  const visibleTopics = channels.status === "success"
    ? channels.data.filter((channel) => channel.kind === "topic" && channel.patchCount > 0).slice(0, 8)
    : [];
  const visibleVendors = channels.status === "success"
    ? channels.data.filter((channel) => channel.kind === "vendor").slice(0, 8)
    : [];

  return (
    <div>
      <h1 className="sr-only">Kernel Lens — A clearer view into Linux kernel development</h1>
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[0.65fr_1.35fr] lg:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Search</h2>
            <p className="mt-1 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Find patches, symbols, authors, or subsystems across indexed public discussions.
            </p>
          </div>
          <SearchBox />
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950" aria-labelledby="topics-heading">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <SectionHeader
            id="topics-heading"
            title="Topics"
            description="Start with a kernel area, then follow its product impact."
            to="/topics"
            linkLabel="All topics"
          />
          {channels.status === "loading" && <p className="py-8 text-sm text-slate-500 dark:text-slate-400">Loading topics…</p>}
          {channels.status === "error" && <p className="py-8 text-sm text-red-600 dark:text-red-400">Could not load topics.</p>}
          {channels.status === "success" && visibleTopics.length === 0 && <p className="py-8 text-sm text-slate-500 dark:text-slate-400">No observed topic patches yet.</p>}
          {channels.status === "success" && visibleTopics.length > 0 && (
            <div className="mt-5 grid overflow-hidden border-t border-l border-slate-200 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
              {visibleTopics.map((channel) => (
                <Link key={`${channel.kind}:${channel.slug}`} to={`/topics/${channel.slug}`} className="focus-ring group border-r border-b border-slate-200 p-5 transition-colors hover:bg-slate-50 sm:min-h-28 dark:border-slate-800 dark:hover:bg-slate-900/50">
                  <span className="block font-semibold text-slate-900 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">{channel.name}</span>
                  <span className="mt-3 block font-mono text-xs text-slate-500 dark:text-slate-400">{channel.patchCount} observed patches</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" aria-labelledby="vendors-heading">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <SectionHeader
            id="vendors-heading"
            title="Vendors"
            description="Follow public kernel changes mapped to hardware platforms."
            to="/vendors"
            linkLabel="All vendors"
          />
          {channels.status === "loading" && <p className="py-8 text-sm text-slate-500 dark:text-slate-400">Loading vendors…</p>}
          {channels.status === "error" && <p className="py-8 text-sm text-red-600 dark:text-red-400">Could not load vendors.</p>}
          {channels.status === "success" && visibleVendors.length === 0 && <p className="py-8 text-sm text-slate-500 dark:text-slate-400">No vendor channels are configured yet.</p>}
          {channels.status === "success" && visibleVendors.length > 0 && (
            <div className="mt-5 grid overflow-hidden border-t border-l border-slate-200 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
              {visibleVendors.map((channel) => (
                <Link key={channel.slug} to={`/vendors/${channel.slug}`} className="focus-ring group border-r border-b border-slate-200 p-5 transition-colors hover:bg-slate-50 sm:min-h-28 dark:border-slate-800 dark:hover:bg-slate-900/50">
                  <span className="block font-semibold text-slate-900 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-400">{channel.name}</span>
                  <span className="mt-3 block font-mono text-xs text-slate-500 dark:text-slate-400">{channel.patchCount} observed patches</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {digests.status === "success" && digests.data.length > 0 && (
        <section className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40" aria-labelledby="digests-heading">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <SectionHeader
              id="digests-heading"
              title="Digests"
              description="Daily and weekly reports of selected threads, with links to public evidence."
              to="/digests"
              linkLabel="All digests"
            />
            <ul>{digests.data.slice(0, 3).map((digest) => <li key={`${digest.periodType}:${digest.periodKey}`} className="border-b border-slate-200 dark:border-slate-800"><Link to={`/digests/${digest.periodType}/${digest.periodKey}`} className="focus-ring flex items-center justify-between gap-4 rounded-sm py-5"><span className="font-medium text-slate-900 dark:text-white">{digest.title}</span><span className="font-mono text-xs text-slate-500">{digest.content.threads.length} patches →</span></Link></li>)}</ul>
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({
  id,
  title,
  description,
  to,
  linkLabel,
}: {
  id: string;
  title: string;
  description: string;
  to: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-col items-start gap-3 border-b border-slate-300 pb-4 sm:flex-row sm:items-end sm:justify-between dark:border-slate-700">
      <div>
        <h2 id={id} className="text-xl font-semibold text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <Link to={to} className="focus-ring inline-flex min-h-11 shrink-0 items-center rounded-sm text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
        {linkLabel} →
      </Link>
    </div>
  );
}
