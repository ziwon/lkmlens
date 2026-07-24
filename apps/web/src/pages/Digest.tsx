import { Link, useParams } from "react-router";
import type { DigestPeriod } from "@lkmlens/shared";
import { SectionMarker } from "../components/SectionMarker.tsx";
import { SourceLink } from "../components/SourceLink.tsx";
import { ErrorState, SkeletonRows } from "../components/States.tsx";
import { fetchDigest } from "../lib/api.ts";
import { useAsync } from "../lib/useAsync.ts";
import { formatDate, plural } from "../lib/format.ts";
import { frameRead } from "../lib/frame.ts";

export default function Digest() {
  const { period = "", key = "" } = useParams();
  const validPeriod = period === "daily" || period === "weekly" ? (period as DigestPeriod) : "daily";
  const result = useAsync(() => fetchDigest(validPeriod, key), [validPeriod, key]);

  if (result.status === "loading") {
    return (
      <div className={`${frameRead} py-12`}>
        <SkeletonRows rows={3} label="Loading digest…" />
      </div>
    );
  }

  if (result.status === "error") {
    return (
      <div className={`${frameRead} py-12`}>
        <ErrorState title="Digest not found." />
        <Link to="/digests" className="focus-ring mt-6 inline-block text-small text-accent hover:underline">
          ← All digests
        </Link>
      </div>
    );
  }

  const digest = result.data;

  return (
    <article className={`${frameRead} py-12 sm:py-16`}>
      <Link to="/digests" className="focus-ring text-small text-ink-muted hover:text-accent">
        ← All digests
      </Link>

      <header className="mt-6 border-b border-border-strong pb-8">
        <SectionMarker label={`${digest.periodType} · ${digest.periodKey}`} />
        <h1 className="mt-3 text-h1 text-ink">{digest.title}</h1>
        <p className="tabular mt-5 font-mono text-meta tracking-[0.04em] text-ink-muted uppercase">
          Published {formatDate(digest.publishedAt)} ·{" "}
          {plural(digest.content.threads.length, "selected thread")}
        </p>
      </header>

      {digest.content.mostActiveTopics.length > 0 && (
        <section className="border-b border-border py-5" aria-label="Most active topics">
          <SectionMarker label="Most active topics" />
          <ul className="mt-3 flex flex-wrap gap-2">
            {digest.content.mostActiveTopics.map((topic) => (
              <li key={topic.slug}>
                <Link
                  to={`/topics/${topic.slug}`}
                  className="focus-ring inline-flex h-7 items-center gap-2 rounded-sm border border-border bg-surface-subtle px-2.5 font-mono text-meta text-ink-secondary transition-colors hover:border-accent hover:text-accent"
                >
                  {topic.name}
                  <span className="tabular text-ink-faint">{topic.threadCount}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ol className="mt-2">
        {digest.content.threads.map((thread, index) => (
          <li key={thread.threadId} className="border-b border-border py-6">
            <p className="font-mono text-meta tracking-[0.08em] text-ink-faint">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-1.5 text-h3 text-ink">
              <Link
                to={`/threads/${thread.threadId}`}
                className="focus-ring transition-colors hover:text-accent"
              >
                {thread.subject}
              </Link>
            </h2>
            {thread.overview && (
              <p className="mt-2.5 text-body text-ink-secondary">
                {thread.overview}
                {thread.overviewEvidence?.map((item, evidenceIndex) => (
                  <SourceLink
                    key={`${item.messageId}:${evidenceIndex}`}
                    href={item.sourceUrl}
                    className="ml-1 align-super font-mono text-meta no-underline"
                  >
                    [{evidenceIndex + 1}]
                  </SourceLink>
                ))}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-meta text-ink-muted">
              <span className="tabular">{plural(thread.messageCount, "message")}</span>
              {thread.topicNames.length > 0 && <span>{thread.topicNames.join(" · ")}</span>}
              <SourceLink href={thread.sourceUrl}>Open on lore</SourceLink>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-8 max-w-[68ch] text-small text-ink-muted">
        Selection reflects observed activity in the period, not technical acceptance. Overviews
        are AI-generated from public messages and cite the sources they draw on — see{" "}
        <Link to="/about/methodology" className="focus-ring text-accent hover:underline">
          methodology
        </Link>
        .
      </p>
    </article>
  );
}
