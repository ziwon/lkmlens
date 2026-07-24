import { Link, useParams } from "react-router";
import type { Message, Summary } from "@lkmlens/shared";
import { fetchThread } from "../lib/api.ts";
import { useAsync } from "../lib/useAsync.ts";
import { LifecycleRail } from "../components/LifecycleRail.tsx";
import { ThreadMessage } from "../components/ThreadMessage.tsx";
import { SectionMarker } from "../components/SectionMarker.tsx";
import { SourceLink } from "../components/SourceLink.tsx";
import { EvidencePanel, InterpretationPanel } from "../components/Panel.tsx";
import { MetaTag, StatusTag } from "../components/StatusTag.tsx";
import { EmptyState, ErrorState, SkeletonRows } from "../components/States.tsx";
import { formatDate, formatExact, plural } from "../lib/format.ts";
import { frameWide } from "../lib/frame.ts";

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Renders one summary claim with its `[cN]` citations resolved to source links. */
function SummaryClaim({ text, summary }: { text: string; summary: Summary }) {
  const claimIds = new Set(
    Array.from(text.matchAll(/\[(c\d+)\]/gi), (match) => match[1]?.toLowerCase()).filter(Boolean),
  );
  const evidence = summary.content.evidence.filter((item) =>
    claimIds.has(item.claimId.toLowerCase()),
  );
  return (
    <p className="max-w-[76ch] text-body text-ink-secondary">
      {text.replace(/\[c\d+\]\s*/gi, "")}
      {evidence.map((item, index) => (
        <SourceLink
          key={`${item.claimId}:${item.messageId}:${index}`}
          href={item.sourceUrl}
          className="ml-1 align-super font-mono text-meta no-underline"
        >
          [{index + 1}]
        </SourceLink>
      ))}
    </p>
  );
}

function participants(messages: Message[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const message of messages) {
    const name = message.authorName ?? "Unknown author";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export default function Thread() {
  const { id = "" } = useParams();
  const result = useAsync(() => fetchThread(id), [id]);

  if (result.status === "loading") {
    return (
      <div className={`${frameWide} py-12`}>
        <SkeletonRows rows={3} label="Rebuilding thread evidence…" />
      </div>
    );
  }

  if (result.status === "error") {
    const notFound = result.error.message === "not-found";
    return (
      <div className={`${frameWide} py-12`}>
        <ErrorState
          title={notFound ? "Thread not found." : "Could not load this thread."}
          detail={notFound ? undefined : result.error.message}
        />
      </div>
    );
  }

  const { thread, messages, topics, impact, lifecycle, revisions, reviewSignals, summary } =
    result.data;
  const people = participants(messages);

  return (
    <div className={`${frameWide} py-10 sm:py-14`}>
      {/* Title block spans the full frame; patch prefix stays visually distinct. */}
      <header className="border-b border-border-strong pb-6">
        <div className="flex flex-wrap items-center gap-2">
          {thread.threadType && <MetaTag>{thread.threadType}</MetaTag>}
          {thread.patchVersion != null && <MetaTag>v{thread.patchVersion}</MetaTag>}
          {thread.mailingList && <MetaTag>list:{thread.mailingList}</MetaTag>}
          {topics.map((topic) => (
            <Link key={topic.slug} to={`/topics/${topic.slug}`} className="focus-ring">
              <MetaTag className="transition-colors hover:border-accent hover:text-accent">
                {topic.name}
              </MetaTag>
            </Link>
          ))}
          {impact?.vendors.map((vendor) => (
            <Link key={vendor} to={`/vendors/${slugify(vendor)}`} className="focus-ring">
              <MetaTag className="transition-colors hover:border-accent hover:text-accent">
                {vendor}
              </MetaTag>
            </Link>
          ))}
        </div>

        <h1 className="mt-4 max-w-[38ch] text-h2 text-ink">{thread.displaySubject}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-meta text-ink-muted">
          {thread.authorName && <span>{thread.authorName}</span>}
          {thread.firstPostedAt && (
            <span className="tabular" title={formatExact(thread.firstPostedAt)}>
              {formatDate(thread.firstPostedAt)}
            </span>
          )}
          <span className="tabular">{plural(thread.messageCount, "message")}</span>
          <SourceLink href={thread.sourceUrl}>Open on lore</SourceLink>
        </div>

        {thread.rootConfidence === "partial" && (
          <p className="mt-4 max-w-[76ch] border border-border border-l-2 border-l-warning bg-surface px-4 py-3 text-small text-ink-secondary">
            <span className="font-mono text-meta tracking-[0.08em] text-warning uppercase">
              Partial thread
            </span>{" "}
            — an earlier parent message was not available when this thread was reconstructed.
          </p>
        )}
      </header>

      <div className="grid gap-10 pt-8 lg:grid-cols-12 lg:gap-12">
        {/* Left 4 columns: orientation — lifecycle, mapping, participants. */}
        <aside className="space-y-10 lg:col-span-4">
          <section aria-labelledby="lifecycle-heading">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border-strong pb-3">
              <h2 id="lifecycle-heading" className="text-h3 text-ink">
                Integration status
              </h2>
              <Link
                to="/about/methodology"
                className="focus-ring font-mono text-meta text-ink-muted hover:text-accent"
              >
                How this is verified →
              </Link>
            </div>
            <div className="mt-4">
              <LifecycleRail
                lifecycle={lifecycle}
                reviewSignals={reviewSignals}
                submittedAt={thread.firstPostedAt}
              />
            </div>
            <p className="mt-3 max-w-[60ch] text-small text-ink-muted">
              “Not observed” means no public mainline or stable evidence was found. It does not
              imply rejection or absence from a private BSP.
              {lifecycle?.checkedAt && ` Last checked ${formatDate(lifecycle.checkedAt)}.`}
            </p>
          </section>

          {impact && impact.affectedLayers.length > 0 && (
            <section aria-labelledby="impact-heading">
              <h2 id="impact-heading" className="sr-only">
                Product consequence
              </h2>
              <EvidencePanel label="Product consequence" note="deterministic mapping">
                <dl className="space-y-3 text-small">
                  {[
                    ["Vendor lens", impact.vendors.join(", ") || "No vendor match"],
                    ["Affected layer", impact.affectedLayers.join(", ")],
                    ["Likely stakeholders", impact.likelyStakeholders.join(", ")],
                    ["Suggested action", impact.suggestedAction ?? ""],
                  ]
                    .filter(([, value]) => value)
                    .map(([term, value]) => (
                      <div key={term}>
                        <dt className="font-mono text-meta tracking-[0.06em] text-ink-muted uppercase">
                          {term}
                        </dt>
                        <dd className="mt-0.5 text-ink-secondary">{value}</dd>
                      </div>
                    ))}
                </dl>
                <p className="mt-4 font-mono text-meta text-ink-muted">
                  Matched by: {impact.matchedBy.join(", ")}
                </p>
              </EvidencePanel>
            </section>
          )}

          <section aria-labelledby="participants-heading">
            <div className="border-b border-border-strong pb-3">
              <h2 id="participants-heading" className="text-h3 text-ink">
                Participants
              </h2>
            </div>
            <ul className="mt-2">
              {people.map((person) => (
                <li
                  key={person.name}
                  className="flex items-baseline justify-between gap-4 border-b border-border py-2.5"
                >
                  <span className="min-w-0 truncate text-small text-ink-secondary">
                    {person.name}
                  </span>
                  <span className="tabular shrink-0 font-mono text-meta text-ink-muted">
                    {person.count}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        {/* Right 8 columns: evidence first, then interpretation, then discussion. */}
        <div className="space-y-10 lg:col-span-8">
          {reviewSignals.length > 0 && (
            <section aria-labelledby="review-heading">
              <h2 id="review-heading" className="sr-only">
                Explicit review evidence
              </h2>
              <EvidencePanel
                label="Explicit review evidence"
                note={plural(reviewSignals.length, "trailer")}
              >
                <ul className="flex flex-wrap gap-x-5 gap-y-2.5">
                  {reviewSignals.map((signal) => (
                    <li key={signal.id} className="flex flex-wrap items-baseline gap-2">
                      <StatusTag tone="evidence">{signal.signalType}</StatusTag>
                      <SourceLink href={signal.sourceUrl} className="text-small">
                        {signal.personName}
                      </SourceLink>
                    </li>
                  ))}
                </ul>
              </EvidencePanel>
            </section>
          )}

          {revisions.length > 1 && (
            <section aria-labelledby="revisions-heading">
              <div className="border-b border-border-strong pb-3">
                <h2 id="revisions-heading" className="text-h3 text-ink">
                  Revision timeline
                </h2>
              </div>
              <ol className="mt-2">
                {revisions.map((revision) => (
                  <li key={revision.threadId} className="border-b border-border py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/threads/${revision.threadId}`}
                        className="focus-ring font-mono text-meta font-medium text-accent hover:underline"
                      >
                        v{revision.version}
                      </Link>
                      {revision.isCurrent && <StatusTag tone="evidence">Latest</StatusTag>}
                      {revision.firstPostedAt && (
                        <span className="tabular font-mono text-meta text-ink-muted">
                          {formatDate(revision.firstPostedAt)}
                        </span>
                      )}
                    </div>
                    {revision.changeNotes && (
                      <p className="mt-1.5 max-w-[76ch] text-small whitespace-pre-wrap text-ink-muted">
                        {revision.changeNotes}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section aria-labelledby="summary-heading">
            <h2 id="summary-heading" className="sr-only">
              Evidence-linked summary
            </h2>
            {summary ? (
              <InterpretationPanel
                label="AI summary"
                note={`Generated from ${plural(thread.messageCount, "public message")}`}
              >
                <div className="space-y-5">
                  <SummaryClaim text={summary.content.overview} summary={summary} />

                  {summary.content.whyItMatters && (
                    <div>
                      <h3 className="text-body font-semibold text-ink">Why it matters</h3>
                      <div className="mt-1">
                        <SummaryClaim text={summary.content.whyItMatters} summary={summary} />
                      </div>
                    </div>
                  )}

                  {(
                    [
                      ["Major changes", summary.content.majorChanges],
                      ["Review discussion", summary.content.reviewDiscussion],
                      ["Outstanding questions", summary.content.outstandingQuestions],
                    ] as const
                  ).map(([title, items]) =>
                    Array.isArray(items) && items.length > 0 ? (
                      <div key={title}>
                        <h3 className="text-body font-semibold text-ink">{title}</h3>
                        <ul className="mt-1 space-y-1.5">
                          {items.map((item) => (
                            <li key={item} className="flex gap-2.5">
                              <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-ink-faint" />
                              <SummaryClaim text={item} summary={summary} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null,
                  )}

                  {summary.content.uncertainties.length > 0 && (
                    <div>
                      <h3 className="text-body font-semibold text-ink">Uncertainties</h3>
                      <ul className="mt-1 space-y-1.5">
                        {summary.content.uncertainties.map((item) => (
                          <li key={item} className="flex gap-2.5">
                            <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-warning" />
                            <span className="max-w-[76ch] text-body text-ink-secondary">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <p className="mt-5 border-t border-border pt-3 font-mono text-meta text-ink-muted">
                  Model {summary.model} · prompt {summary.promptVersion} · generated{" "}
                  {formatDate(summary.generatedAt)} · verify against the cited sources
                </p>
              </InterpretationPanel>
            ) : (
              <EmptyState
                title={
                  thread.summaryState === "stale"
                    ? "The summary is being refreshed after new activity."
                    : "No evidence-linked summary has been generated for this thread yet."
                }
              >
                Summaries are generated only for selected active threads. The messages below
                remain the primary record.
              </EmptyState>
            )}
          </section>

          <section aria-labelledby="messages-heading">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border-strong pb-3">
              <h2 id="messages-heading" className="text-h3 text-ink">
                Discussion
              </h2>
              <SectionMarker label={plural(messages.length, "message")} />
            </div>
            <div>
              {messages.map((message, index) => (
                <ThreadMessage
                  key={message.messageId}
                  message={message}
                  index={index + 1}
                  total={messages.length}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
