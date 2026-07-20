import { Link } from "react-router";
import { Prose } from "../components/Prose.tsx";

export default function About() {
  return (
    <Prose title="About LKMLens">
      <p>
        LKMLens is a public search and exploration service for Linux kernel
        mailing-list discussions. It collects selected conversations from{" "}
        <a
          className="underline decoration-slate-400 underline-offset-2"
          href="https://lore.kernel.org/"
          target="_blank"
          rel="noreferrer"
        >
          lore.kernel.org
        </a>
        , organizes them by technical topic, reconstructs discussion threads
        and patch series, and makes them searchable through a clean web
        interface.
      </p>

      <p>
        LKMLens is not intended to replace lore.kernel.org. Lore remains the
        canonical source and archive. LKMLens adds a discovery and
        interpretation layer on top of it: topic-oriented browsing, fast
        full-text search, thread reconstruction, patch-series and revision
        tracking, discussion timelines, reviewer and maintainer context, and
        evidence-linked AI summaries.
      </p>

      <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
        LKMLens is an independent project and is not affiliated with
        kernel.org, the Linux Foundation, or the Linux kernel project.
      </p>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Who it's for
      </h2>
      <p>
        Kernel engineers, systems and infrastructure engineers, eBPF/
        networking/storage/virtualization engineers, GPU and accelerator
        platform engineers, kernel-adjacent open-source contributors, and
        anyone learning how kernel development and review actually work. No
        account is required.
      </p>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Status
      </h2>
      <p>
        LKMLens is in early development. Search, topic classification,
        patch-revision navigation, explicit review signals, and bounded
        evidence-linked summaries are implemented. See{" "}
        <Link className="underline decoration-slate-400 underline-offset-2" to="/about/methodology">
          methodology
        </Link>{" "}
        for how indexing and summaries will work once ingestion is live.
      </p>
    </Prose>
  );
}
