import { Link } from "react-router";
import { Prose } from "../components/Prose.tsx";

export default function About() {
  return (
    <Prose
      title="About Kernel Lens"
      marker="About"
      lead="A discovery and interpretation layer over public Linux kernel discussion — lore.kernel.org remains the canonical archive."
      updated="2026-07-24"
    >
      <p>
        Kernel Lens is an open-source kernel ecosystem observatory for teams that build
        hardware products. It collects selected public conversations from{" "}
        <a href="https://lore.kernel.org/" target="_blank" rel="noreferrer">
          lore.kernel.org
        </a>
        , reconstructs patch series, and curates them by vendor, subsystem, product surface,
        and integration stage.
      </p>

      <p>
        Kernel Lens is not intended to replace lore.kernel.org. Lore remains the canonical
        source and archive. The primary question here is not simply “what was posted?” but
        “what does this change mean for my hardware, BSP, release plan, and integration
        work?”
      </p>

      <p>
        Kernel Lens is an independent project and is not affiliated with kernel.org, the
        Linux Foundation, or the Linux kernel project.
      </p>

      <h2>Who it's for</h2>
      <p>
        BSP and platform engineers, firmware and systems teams, robotics and automotive
        developers, product planners, kernel engineers, and anyone who needs reliable
        upstream visibility without following every mailing list. No account is required.
      </p>

      <h2>Status</h2>
      <p>
        Kernel Lens is in early development. Topic and vendor lenses, deterministic
        product-impact mapping, patch-revision navigation, explicit review evidence,
        integration-path records, search, and bounded evidence-linked summaries are
        implemented. See <Link to="/about/methodology">methodology</Link> for how indexing
        and summaries work.
      </p>
    </Prose>
  );
}
