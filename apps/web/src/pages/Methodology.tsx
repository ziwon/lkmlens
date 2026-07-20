import { Prose } from "../components/Prose.tsx";

export default function Methodology() {
  return (
    <Prose title="Methodology">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Where the data comes from
      </h2>
      <p>
        LKMLens indexes selected messages from lore.kernel.org, the public
        archive of Linux kernel mailing lists. Every indexed message, thread,
        summary, and claim links back to its source message on lore. LKMLens
        never presents itself as the canonical archive — lore.kernel.org is.
      </p>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
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

      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
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

      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        How summaries will be generated
      </h2>
      <p>
        AI-generated summaries are generated only for selected active threads. Every
        material claim in a summary — review state, outstanding objections,
        numerical results, changes between patch revisions — must cite one or
        more source messages. Reply volume is never treated as approval, and
        merge likelihood is never predicted without explicit evidence in the
        thread. Summaries will be labeled with the model, prompt version, and
        generation time, and are marked uncertain when a thread is incomplete or
        still active.
      </p>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        What AI can get wrong
      </h2>
      <p>
        Summarization models can misattribute statements, miss sarcasm or
        informal review language, or overstate consensus in a noisy thread. A
        high reply count is not a signal of importance or approval. Treat
        summaries as an orientation aid, not a substitute for reading the
        original messages.
      </p>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        How to report errors
      </h2>
      <p>
        If a thread reconstruction, topic assignment, or summary looks wrong,
        please open an issue on{" "}
        <a
          className="underline decoration-slate-400 underline-offset-2"
          href="https://github.com/ziwon/lkmlens/issues"
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
