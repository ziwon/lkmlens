import { Link, useParams } from "react-router";
import type { CurationPatch, PatchLifecycleStage } from "@lkmlens/shared";
import { PatchRow } from "../components/PatchRow.tsx";
import { SectionMarker } from "../components/SectionMarker.tsx";
import { EmptyState, ErrorState, SkeletonRows } from "../components/States.tsx";
import { fetchCurationFeed } from "../lib/api.ts";
import { useAsync } from "../lib/useAsync.ts";
import { formatDate, plural, stripChannelPrefix } from "../lib/format.ts";
import { frame } from "../lib/frame.ts";

/** Ordered so the strip always reads proposal → integration (DESIGN.md 10.3). */
const stageOrder: [PatchLifecycleStage, string][] = [
  ["submitted", "Submitted"],
  ["under-review", "Review evidence"],
  ["maintainer-tree", "Maintainer tree"],
  ["mainline", "Mainline"],
  ["released", "Released"],
  ["stable-backport", "Stable backport"],
  ["android-common", "Android common"],
];

function latestActivity(patches: CurationPatch[]): string | null {
  return patches.reduce<string | null>((latest, patch) => {
    const value = patch.lastActivityAt ?? patch.firstPostedAt;
    if (!value) return latest;
    return latest === null || value > latest ? value : latest;
  }, null);
}

export default function PatchFeed({ kind }: { kind: "topic" | "vendor" }) {
  const { slug = "" } = useParams();
  const result = useAsync(() => fetchCurationFeed(kind, slug), [kind, slug]);
  const indexPath = kind === "vendor" ? "/vendors" : "/topics";
  const indexLabel = kind === "vendor" ? "All vendors" : "All topics";

  if (result.status === "loading") {
    return (
      <div className={`${frame} py-12 sm:py-16`}>
        <SkeletonRows rows={4} label="Loading observed patches…" />
      </div>
    );
  }

  if (result.status === "error") {
    return (
      <div className={`${frame} py-12 sm:py-16`}>
        <ErrorState
          title={result.error.message === "not-found" ? "Channel not found." : "Could not load this channel."}
          detail={result.error.message === "not-found" ? undefined : result.error.message}
        />
        <Link to={indexPath} className="focus-ring mt-6 inline-block text-small text-accent hover:underline">
          ← {indexLabel}
        </Link>
      </div>
    );
  }

  const { channel, patches } = result.data;
  const observedStages = stageOrder.filter(([stage]) =>
    patches.some((patch) => patch.lifecycleStage === stage),
  );
  const lastActivity = latestActivity(patches);

  return (
    <div className={`${frame} py-10 sm:py-14`}>
      <Link to={indexPath} className="focus-ring text-small text-ink-muted hover:text-accent">
        ← {indexLabel}
      </Link>

      <header className="mt-6 grid gap-8 border-b border-border-strong pb-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <SectionMarker index="01" label={kind === "vendor" ? "Vendor lens" : "Topic lens"} />
          <h1 className="mt-3 text-h1 text-ink">{channel.name}</h1>
          {channel.description && (
            <p className="mt-4 max-w-[62ch] text-body-lg text-ink-secondary">
              {channel.description}
            </p>
          )}
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 self-end lg:col-span-5 lg:border-l lg:border-border lg:pl-10">
          <div>
            <dt className="font-mono text-meta tracking-[0.06em] text-ink-muted uppercase">
              Observed patches
            </dt>
            <dd className="tabular mt-1.5 font-mono text-h3 text-ink">{channel.patchCount}</dd>
          </div>
          <div>
            <dt className="font-mono text-meta tracking-[0.06em] text-ink-muted uppercase">
              Last observed activity
            </dt>
            <dd className="mt-1.5 font-mono text-small text-ink">
              {lastActivity ? formatDate(lastActivity) : "Not observed"}
            </dd>
          </div>
        </dl>
      </header>

      {channel.trackedAreas.length > 0 && (
        <section className="border-b border-border py-4" aria-label="Tracked surfaces">
          <SectionMarker label="Tracked surfaces" />
          <p className="mt-2 max-w-[80ch] font-mono text-meta text-ink-secondary">
            {channel.trackedAreas
              .map((area) => stripChannelPrefix(area, channel.name))
              .join(" · ")}
          </p>
        </section>
      )}

      {observedStages.length > 0 && (
        <section className="py-6" aria-label="Integration stages observed">
          <div className="pb-3">
            <SectionMarker label="Furthest stage observed, in this view" />
          </div>
          {/* auto-fit keeps the shared border complete however many stages
              are observed, instead of leaving a ragged half-row. */}
          <dl className="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] border-t border-l border-border">
            {observedStages.map(([stage, label]) => (
              <div key={stage} className="border-r border-b border-border px-4 py-3">
                <dt className="font-mono text-meta tracking-[0.06em] text-ink-muted uppercase">
                  {label}
                </dt>
                <dd className="tabular mt-1 font-mono text-body text-ink">
                  {patches.filter((patch) => patch.lifecycleStage === stage).length}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section aria-label={`${channel.name} patches`}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border-strong pb-3">
          <SectionMarker index="02" label="Observed patches" />
          {/* The feed is capped server-side, so say so rather than letting it
              contradict the total in the header. */}
          <p className="tabular font-mono text-meta text-ink-muted">
            {patches.length < channel.patchCount
              ? `Showing ${patches.length} of ${channel.patchCount}`
              : plural(patches.length, "patch", "patches")}{" "}
            · most recent first
          </p>
        </div>
        {patches.length === 0 ? (
          <div className="pt-6">
            <EmptyState title="No matched public patch yet.">
              The channel is configured and its rules are active; results appear once impact
              indexing matches a public patch to a tracked surface. See{" "}
              <Link to="/about/methodology" className="focus-ring text-accent hover:underline">
                methodology
              </Link>{" "}
              for how matching works.
            </EmptyState>
          </div>
        ) : (
          patches.map((patch) => <PatchRow key={patch.threadId} patch={patch} />)
        )}
      </section>
    </div>
  );
}
