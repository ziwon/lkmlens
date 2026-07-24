import { Link } from "react-router";
import { SectionMarker } from "../components/SectionMarker.tsx";
import { EmptyState, ErrorState, SkeletonRows } from "../components/States.tsx";
import { fetchDigests } from "../lib/api.ts";
import { useAsync } from "../lib/useAsync.ts";
import { formatDate, plural } from "../lib/format.ts";
import { frame } from "../lib/frame.ts";

export default function Digests() {
  const result = useAsync(fetchDigests, []);

  return (
    <div className={`${frame} py-12 sm:py-16`}>
      <header className="flex flex-col items-start gap-5 border-b border-border-strong pb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
        <div className="min-w-0">
          <SectionMarker index="01" label="Digests" />
          <h1 className="mt-3 max-w-[18ch] text-h1 text-ink">Periodic reading of tracked threads</h1>
          <p className="mt-4 max-w-[62ch] text-body-lg text-ink-secondary">
            Daily and weekly reports of selected tracked threads. Each digest is a starting
            point for investigation — not a merge, approval, or importance ranking.
          </p>
        </div>
        <a
          href="/rss/weekly.xml"
          className="focus-ring inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border border-border-strong px-3.5 font-mono text-meta tracking-[0.06em] text-ink-secondary uppercase transition-colors hover:border-accent hover:text-accent"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M5 11a8 8 0 0 1 8 8" />
            <path d="M5 5a14 14 0 0 1 14 14" />
            <circle cx="6" cy="18" r="1" fill="currentColor" stroke="none" />
          </svg>
          Weekly RSS
        </a>
      </header>

      <div className="mt-8">
        {result.status === "loading" && <SkeletonRows rows={4} label="Loading published digests…" />}
        {result.status === "error" && (
          <ErrorState title="Could not load digests." detail={result.error.message} />
        )}
        {result.status === "success" && result.data.length === 0 && (
          <EmptyState title="No digest has been published yet.">
            Scheduled daily and weekly editions appear here once tracked threads have been
            selected for a period.
          </EmptyState>
        )}
        {result.status === "success" && result.data.length > 0 && (
          <ul className="border-t border-border">
            {result.data.map((digest) => (
              <li key={`${digest.periodType}:${digest.periodKey}`} className="border-b border-border">
                <Link
                  to={`/digests/${digest.periodType}/${digest.periodKey}`}
                  className="focus-ring group flex flex-col gap-2 py-5 transition-colors hover:bg-surface-subtle sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                >
                  <span className="min-w-0">
                    <span className="block font-mono text-meta tracking-[0.06em] text-ink-muted uppercase">
                      {digest.periodType} · {digest.periodKey}
                    </span>
                    <span className="mt-1.5 block text-body-lg font-medium text-ink transition-colors group-hover:text-accent">
                      {digest.title}
                    </span>
                    <span className="tabular mt-1 block font-mono text-meta text-ink-muted">
                      {plural(digest.content.threads.length, "selected thread")} · published{" "}
                      {formatDate(digest.publishedAt)}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-meta tracking-[0.06em] text-ink-muted uppercase group-hover:text-accent">
                    Read digest <span aria-hidden="true">→</span>
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
