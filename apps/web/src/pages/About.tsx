import { Link } from "react-router";
import { Prose } from "../components/Prose.tsx";

export default function About() {
  return (
    <Prose title="About LKMLens">
      <p>
        LKMLens is an open-source kernel ecosystem observatory for teams that
        build hardware products. It collects selected public conversations from{" "}
        <a
          className="underline decoration-slate-400 underline-offset-2"
          href="https://lore.kernel.org/"
          target="_blank"
          rel="noreferrer"
        >
          lore.kernel.org
        </a>
        , reconstructs patch series, and curates the resulting signals by
        vendor, subsystem, product surface, and integration stage.
      </p>

      <p>
        LKMLens is not intended to replace lore.kernel.org. Lore remains the
        canonical source and archive. LKMLens adds a discovery and
        interpretation layer on top of it. The primary question is not simply
        “what was posted?” but “what does this change mean for my hardware,
        BSP, release plan, and integration work?”
      </p>

      <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
        LKMLens is an independent project and is not affiliated with
        kernel.org, the Linux Foundation, or the Linux kernel project.
      </p>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Who it's for
      </h2>
      <p>
        BSP and platform engineers, firmware and systems teams, robotics and
        automotive developers, product planners, kernel engineers, and anyone
        who needs reliable upstream signals without following every mailing
        list. No account is required.
      </p>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Status
      </h2>
      <p>
        LKMLens is in early development. Topic and vendor lenses, deterministic
        product-impact mapping, patch-revision navigation, explicit review
        evidence, integration-path records, search, and bounded evidence-linked
        summaries are implemented. See{" "}
        <Link className="underline decoration-slate-400 underline-offset-2" to="/about/methodology">
          methodology
        </Link>{" "}
        for how indexing and summaries will work once ingestion is live.
      </p>
    </Prose>
  );
}
