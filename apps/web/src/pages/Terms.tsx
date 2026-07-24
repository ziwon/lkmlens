import { Prose } from "../components/Prose.tsx";

export default function Terms() {
  return (
    <Prose
      title="Terms"
      marker="Legal"
      lead="An early, minimal terms notice for an early-stage project. It will be expanded as the service grows."
      updated="2026-07-24"
    >
      <h2>
        What Kernel Lens is
      </h2>
      <p>
        Kernel Lens is a free, best-effort search and discovery layer over public
        Linux kernel mailing-list discussions archived at lore.kernel.org.
        Kernel Lens is an independent project and is not affiliated with
        kernel.org, the Linux Foundation, or the Linux kernel project.
      </p>

      <h2>
        No warranty
      </h2>
      <p>
        Kernel Lens is provided "as is," without warranty of any kind. Thread
        reconstruction, topic classification, and (when enabled) AI-generated
        summaries can be incomplete or incorrect. Nothing on Kernel Lens is a
        statement about whether a patch will be merged, is technically
        correct, or has maintainer approval unless explicit evidence is
        cited. Always verify against the canonical lore.kernel.org source.
      </p>

      <h2>
        Acceptable use
      </h2>
      <p>
        The public API and search interface are provided for interactive use
        and reasonable automated access. Please don't attempt to scrape bulk
        email addresses, circumvent rate limits, or use Kernel Lens in a way that
        degrades service for other users or for lore.kernel.org itself.
      </p>

      <h2>
        Changes
      </h2>
      <p>
        These terms may change as Kernel Lens adds features such as accounts,
        saved searches, or a public API. Material changes will be reflected
        on this page.
      </p>
    </Prose>
  );
}
