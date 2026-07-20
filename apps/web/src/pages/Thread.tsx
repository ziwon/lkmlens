import { useParams } from "react-router";
import { Link } from "react-router";
import type { Summary } from "@lkmlens/shared";
import { fetchThread } from "../lib/api.ts";
import { useAsync } from "../lib/useAsync.ts";
import { LifecycleRail } from "../components/LifecycleRail.tsx";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
      {children}
    </span>
  );
}

function SummaryClaim({ text, summary }: { text: string; summary: Summary }) {
  const claimIds = new Set(Array.from(text.matchAll(/\[(c\d+)\]/gi), (match) => match[1]?.toLowerCase()).filter(Boolean));
  const evidence = summary.content.evidence.filter((item) => claimIds.has(item.claimId.toLowerCase()));
  return (
    <div>
      <span>{text.replace(/\[c\d+\]\s*/gi, "")}</span>{" "}
      {evidence.map((item, index) => (
        <a
          key={`${item.claimId}:${item.messageId}:${index}`}
          href={item.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="ml-1 text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          title={`Evidence: ${item.messageId}`}
        >
          [{index + 1}]
        </a>
      ))}
    </div>
  );
}

export default function Thread() {
  const { id = "" } = useParams();
  const result = useAsync(() => fetchThread(id), [id]);

  if (result.status === "loading") {
    return <p className="mx-auto max-w-3xl px-4 py-10 text-sm text-slate-500 dark:text-slate-400">Loading…</p>;
  }

  if (result.status === "error") {
    const notFound = result.error.message === "not-found";
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-red-600 dark:text-red-400">
          {notFound ? "Thread not found." : `Couldn't load thread (${result.error.message}).`}
        </p>
      </div>
    );
  }

  const { thread, messages, topics, impact, lifecycle, revisions, reviewSignals, summary } = result.data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        {thread.threadType && <Badge>{thread.threadType}</Badge>}
        {thread.patchVersion != null && <Badge>v{thread.patchVersion}</Badge>}
        {thread.mailingList && <Badge>list:{thread.mailingList}</Badge>}
        {topics.map((t) => (
          <Link key={t.slug} to={`/topics/${t.slug}`}><Badge>{t.name}</Badge></Link>
        ))}
        {impact?.vendors.map((vendor) => (
          <Link key={vendor} to={`/vendors/${vendor.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}><Badge>{vendor}</Badge></Link>
        ))}
      </div>

      <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
        {thread.displaySubject}
      </h1>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
        {thread.authorName && <span>{thread.authorName}</span>}
        {thread.firstPostedAt && <span>{thread.firstPostedAt}</span>}
        <span>
          {thread.messageCount} message{thread.messageCount === 1 ? "" : "s"}
        </span>
        <a
          href={thread.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-slate-400 underline-offset-2 hover:text-slate-700 dark:hover:text-slate-300"
        >
          view on lore.kernel.org ↗
        </a>
      </div>

      {thread.rootConfidence === "partial" && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          This is a partial thread: an earlier parent message was not available when it was reconstructed.
        </p>
      )}

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">PRODUCT READINESS</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">Observed integration path</h2>
          </div>
          <Link to="/about/methodology" className="text-xs text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400">How evidence is verified →</Link>
        </div>
        <LifecycleRail lifecycle={lifecycle} reviewSignals={reviewSignals} submittedAt={thread.firstPostedAt} />
        <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-500">
          Missing milestones mean LKMLens has not observed public evidence. They do not imply rejection or absence from a private BSP.
          {lifecycle?.checkedAt && ` Last checked ${lifecycle.checkedAt}.`}
        </p>
      </section>

      {revisions.length > 1 && (
        <section className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Revision timeline</h2>
          <ol className="mt-3 space-y-3">
            {revisions.map((revision) => (
              <li key={revision.threadId} className="text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/threads/${revision.threadId}`} className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">v{revision.version}</Link>
                  {revision.isCurrent && <Badge>latest</Badge>}
                  {revision.firstPostedAt && <span className="text-xs text-slate-500">{revision.firstPostedAt}</span>}
                </div>
                {revision.changeNotes && <pre className="mt-1 whitespace-pre-wrap text-xs text-slate-600 dark:text-slate-400">{revision.changeNotes}</pre>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {reviewSignals.length > 0 && (
        <section className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Explicit review signals</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {reviewSignals.map((signal) => (
              <li key={signal.id}>
                <a href={signal.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-800 hover:underline dark:bg-emerald-950/40 dark:text-emerald-300">
                  {signal.signalType}: {signal.personName} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {impact && impact.affectedLayers.length > 0 && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900 dark:bg-emerald-950/20">
          <h2 className="text-xs font-semibold tracking-wide text-emerald-800 uppercase dark:text-emerald-400">
            Product consequence
            <span className="ml-2 font-normal normal-case text-emerald-700/70 dark:text-emerald-500/70">
              deterministic mapping
            </span>
          </h2>

          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="font-medium text-slate-700 dark:text-slate-300">Vendor lens</dt>
              <dd className="mt-0.5 text-slate-600 dark:text-slate-400">{impact.vendors.join(", ") || "No vendor match"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700 dark:text-slate-300">Affected layer</dt>
              <dd className="mt-0.5 text-slate-600 dark:text-slate-400">{impact.affectedLayers.join(", ")}</dd>
            </div>
            {impact.likelyStakeholders.length > 0 && (
              <div>
                <dt className="font-medium text-slate-700 dark:text-slate-300">Likely stakeholders</dt>
                <dd className="mt-0.5 text-slate-600 dark:text-slate-400">
                  {impact.likelyStakeholders.join(", ")}
                </dd>
              </div>
            )}
            {impact.suggestedAction && (
              <div>
                <dt className="font-medium text-slate-700 dark:text-slate-300">Suggested action</dt>
                <dd className="mt-0.5 text-slate-600 dark:text-slate-400">{impact.suggestedAction}</dd>
              </div>
            )}
          </dl>

          <p className="mt-3 text-xs text-emerald-700/70 dark:text-emerald-500/70">
            Matched by: {impact.matchedBy.join(", ")}
          </p>
        </div>
      )}

      {summary ? (
        <section className="mt-6 rounded-lg border border-violet-200 bg-violet-50/40 p-5 dark:border-violet-900 dark:bg-violet-950/20">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xs font-semibold tracking-wide text-violet-800 uppercase dark:text-violet-300">Evidence-linked summary</h2>
            <span className="text-xs text-violet-700/70 dark:text-violet-400/70">AI-generated · verify against sources</span>
          </div>
          <div className="mt-4 space-y-4 text-sm text-slate-700 dark:text-slate-300">
            <SummaryClaim text={summary.content.overview} summary={summary} />
            {summary.content.whyItMatters && (
              <div><h3 className="font-medium text-slate-900 dark:text-white">Why it matters</h3><SummaryClaim text={summary.content.whyItMatters} summary={summary} /></div>
            )}
            {[
              ["Major changes", summary.content.majorChanges],
              ["Review discussion", summary.content.reviewDiscussion],
              ["Outstanding questions", summary.content.outstandingQuestions],
            ].map(([title, items]) => Array.isArray(items) && items.length > 0 && (
              <div key={String(title)}>
                <h3 className="font-medium text-slate-900 dark:text-white">{title}</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5">{items.map((item) => <li key={item}><SummaryClaim text={item} summary={summary} /></li>)}</ul>
              </div>
            ))}
            {summary.content.uncertainties.length > 0 && (
              <div><h3 className="font-medium text-slate-900 dark:text-white">Uncertainties</h3><ul className="mt-1 list-disc pl-5">{summary.content.uncertainties.map((item) => <li key={item}>{item}</li>)}</ul></div>
            )}
          </div>
          <p className="mt-4 text-xs text-violet-700/70 dark:text-violet-400/70">Model: {summary.model} · prompt: {summary.promptVersion} · generated {summary.generatedAt}</p>
        </section>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {thread.summaryState === "stale" ? "The summary is being refreshed after new activity." : "An evidence-linked summary has not been generated for this thread yet."}
        </div>
      )}

      <h2 className="mt-10 text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
        Messages
      </h2>
      <ol className="mt-4 space-y-6 border-l border-slate-200 pl-6 dark:border-slate-800">
        {messages.map((m) => (
          <li key={m.messageId} className="relative">
            <div className="absolute top-1.5 -left-[29px] size-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {m.authorName ?? "Unknown"}
              </span>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-500">
                {m.postedAt && <span>{m.postedAt}</span>}
                {m.patchIndex != null && m.patchTotal != null && <span>patch {m.patchIndex}/{m.patchTotal}</span>}
                <a
                  href={m.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-slate-400 underline-offset-2 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  lore ↗
                </a>
              </div>
            </div>
            {m.bodyText && (
              <pre className="mt-2 max-h-96 overflow-auto rounded-md bg-slate-50 p-3 text-xs whitespace-pre-wrap text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {m.bodyText}
              </pre>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
