import { Prose } from "../components/Prose.tsx";

export default function Privacy() {
  return (
    <Prose
      title="Privacy"
      marker="Legal"
      lead="An early, minimal privacy notice. It will be expanded as Kernel Lens adds accounts, subscriptions, or other features that touch personal data."
      updated="2026-07-24"
    >
      <h2>
        What Kernel Lens indexes
      </h2>
      <p>
        Kernel Lens indexes public mailing-list messages from lore.kernel.org,
        including the sender name and mailing-list address associated with
        each message. That information is already public on lore.kernel.org;
        Kernel Lens does not collect it independently. Email addresses are not
        exposed as a bulk-searchable field — names link to the original lore
        message rather than to a raw address directory.
      </p>

      <h2>
        What Kernel Lens does not require
      </h2>
      <p>
        No account or registration is required to search or read indexed
        content. Kernel Lens does not sell data or share it with third parties
        beyond what is necessary to operate the service (for example, its
        hosting provider, Cloudflare).
      </p>

      <h2>
        Server logs and analytics
      </h2>
      <p>
        Cloudflare, as the hosting provider, processes standard request
        metadata (IP address, user agent, timestamps) to serve traffic and
        protect against abuse. Kernel Lens does not currently run third-party
        analytics or advertising trackers.
      </p>

      <h2>
        Corrections and removal requests
      </h2>
      <p>
        If you are named in an indexed message and want a correction or
        removal request reviewed, please open an issue on{" "}
        <a          href="https://github.com/ziwon/lkmlens/issues"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        .
      </p>
    </Prose>
  );
}
