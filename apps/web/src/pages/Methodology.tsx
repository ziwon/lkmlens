import { Prose } from "../components/Prose.tsx";

export default function Methodology() {
  return (
    <Prose
      title="Methodology"
      marker="Methodology"
      lead="What Kernel Lens observes, how it reconstructs and classifies it, and what it deliberately does not claim."
      updated="2026-07-24"
    >
      <h2>
        Where the data comes from
      </h2>
      <p>
        Kernel Lens indexes selected messages from lore.kernel.org, the public
        archive of Linux kernel mailing lists. Every indexed message, thread,
        summary, and claim links back to its source message on lore. Kernel Lens
        never presents itself as the canonical archive — lore.kernel.org is.
      </p>

      <h2>
        How threads are reconstructed
      </h2>
      <p>
        Threads are built from the <code>Message-ID</code>,{" "}
        <code>In-Reply-To</code>, and <code>References</code> headers on each
        message. Missing headers, subject mutation, cross-posting, or partial
        archives can produce ambiguous or incorrect thread trees; when that
        happens, reconstruction confidence is recorded and orphaned messages
        are preserved rather than dropped. The raw canonical source is always
        available even when reconstruction is imperfect.
      </p>

      <h2>
        How topics are classified
      </h2>
      <p>
        Topic assignment is deterministic, not purely keyword-based. Each
        topic has a set of weighted rules — mailing list, changed file path,
        subject or patch-prefix pattern, alias, and body keyword — and a
        message's topic score is the sum of the rules it matches. Changed
        file paths and mailing lists carry the most weight; a lone body-only
        keyword carries the least. Every classification records which rules
        matched, so assignments are explainable rather than opaque, and
        administrators can manually override a classification when the rules
        get it wrong.
      </p>

      <h2>
        How vendor and product patches are curated
      </h2>
      <p>
        Vendor lenses use public, reviewable watchlist rules that match changed
        file paths and subsystem prefixes to hardware vendors, affected product
        surfaces, and the engineering roles likely to own the integration work.
        Every result retains the exact rule that matched. A match means the
        public patch touches a tracked area; it does not claim vendor approval,
        private BSP inclusion, or technical correctness.
      </p>

      <h2>
        How integration status is determined
      </h2>
      <p>
        Kernel Lens records a sequence of observable milestones: LKML submission,
        explicit <code>Reviewed-by</code> or <code>Acked-by</code> trailers,
        presence in a public maintainer tree, a mainline commit, the first Linux
        release containing that commit, stable backports, and Android common
        kernel branches. Each repository or release claim must have a public
        source. “Not observed” means the service has no public evidence; it does
        not mean the patch was rejected or is absent from a private vendor tree.
      </p>

      <h2>
        How summaries are generated
      </h2>
      <p>
        AI-generated summaries are generated only for selected active threads. Every
        material claim in a summary — review state, outstanding objections,
        numerical results, changes between patch revisions — must cite one or
        more source messages. Reply volume is never treated as approval, and
        merge likelihood is never predicted. Summaries are labeled with the model, prompt version, and
        generation time, and are marked uncertain when a thread is incomplete or
        still active.
      </p>
      <p>
        Summaries currently use the Gemini Developer API with a configurable
        daily request budget. The interface warns when that local budget is
        nearly exhausted and pauses generation until the next UTC day after
        the limit is reached. On the Gemini free tier, submitted public mailing-list
        text may be used by Google to improve its products; paid-tier processing
        follows different data-use terms.
      </p>

      <h2>
        What AI can get wrong
      </h2>
      <p>
        Summarization models can misattribute statements, miss sarcasm or
        informal review language, or overstate consensus in a noisy thread. A
        high reply count is not a signal of importance or approval. Treat
        summaries as an orientation aid, not a substitute for reading the
        original messages.
      </p>

      <h2>
        How to report errors
      </h2>
      <p>
        If a thread reconstruction, topic assignment, or summary looks wrong,
        please open an issue on{" "}
        <a          href="https://github.com/ziwon/lkmlens/issues"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        . Manual corrections are preserved and override automatic
        classification going forward.
      </p>
    </Prose>
  );
}
