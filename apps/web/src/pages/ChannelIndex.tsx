import { Link } from "react-router";
import type { CurationChannel } from "@lkmlens/shared";
import { SectionMarker } from "../components/SectionMarker.tsx";
import { EmptyState, ErrorState, SkeletonRows } from "../components/States.tsx";
import { fetchCurationChannels } from "../lib/api.ts";
import { useAsync } from "../lib/useAsync.ts";
import { plural, stripChannelPrefix } from "../lib/format.ts";
import { frame } from "../lib/frame.ts";

const pageCopy = {
  topic: {
    title: "Kernel areas under observation",
    marker: "Topics",
    description:
      "Kernel subsystems and cross-cutting technical areas, curated around product impact.",
    countLabel: "topics",
    empty: "No topic channels are configured yet.",
  },
  vendor: {
    title: "Public changes mapped to hardware",
    marker: "Vendors",
    description:
      "Hardware platforms mapped to public kernel changes through explainable rules.",
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
  const basePath = kind === "topic" ? "/topics" : "/vendors";

  return (
    <div className={`${frame} py-12 sm:py-16`}>
      <header className="flex flex-col items-start gap-4 border-b border-border-strong pb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
        <div className="min-w-0">
          <SectionMarker index="01" label={copy.marker} />
          <h1 className="mt-3 max-w-[20ch] text-h1 text-ink">{copy.title}</h1>
          <p className="mt-4 max-w-[62ch] text-body-lg text-ink-secondary">{copy.description}</p>
        </div>
        {result.status === "success" && (
          <p className="tabular shrink-0 font-mono text-meta text-ink-muted">
            {channels.length} {copy.countLabel}
          </p>
        )}
      </header>

      <div className="mt-8">
        {result.status === "loading" && (
          <SkeletonRows rows={5} label={`Loading ${copy.countLabel}…`} />
        )}
        {result.status === "error" && (
          <ErrorState title={`Could not load ${copy.countLabel}.`} detail={result.error.message} />
        )}
        {result.status === "success" && channels.length === 0 && (
          <EmptyState title={copy.empty} />
        )}
        {result.status === "success" && channels.length > 0 && (
          <ul className="border-t border-border">
            {channels.map((channel) => (
              <li key={channel.slug} className="border-b border-border">
                <Link
                  to={`${basePath}/${channel.slug}`}
                  className="focus-ring group flex flex-col gap-2 py-5 transition-colors hover:bg-surface-subtle sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                >
                  <span className="min-w-0">
                    <span className="block text-body-lg font-medium text-ink transition-colors group-hover:text-accent">
                      {channel.name}
                    </span>
                    {channel.description && (
                      <span className="mt-1 block max-w-[72ch] text-small text-ink-muted">
                        {channel.description}
                      </span>
                    )}
                    {channel.trackedAreas.length > 0 && (
                      <span className="mt-2 block truncate font-mono text-meta text-ink-faint">
                        {channel.trackedAreas
                          .slice(0, 4)
                          .map((area) => stripChannelPrefix(area, channel.name))
                          .join(" · ")}
                      </span>
                    )}
                  </span>
                  <span className="tabular shrink-0 font-mono text-meta text-ink-muted">
                    {plural(channel.patchCount, "patch", "patches")}{" "}
                    <span aria-hidden="true" className="group-hover:text-accent">
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
