import { Prose } from "../components/Prose.tsx";

export default function Privacy() {
  return (
    <Prose title="Privacy">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        This is an early, minimal privacy notice for an early-stage project.
        It will be expanded as LKMLens adds accounts, subscriptions, or other
        features that touch personal data.
      </p>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        What LKMLens indexes
      </h2>
      <p>
        LKMLens indexes public mailing-list messages from lore.kernel.org,
        including the sender name and mailing-list address associated with
        each message. That information is already public on lore.kernel.org;
        LKMLens does not collect it independently. Email addresses are not
        exposed as a bulk-searchable field — names link to the original lore
        message rather than to a raw address directory.
      </p>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        What LKMLens does not require
      </h2>
      <p>
        No account or registration is required to search or read indexed
        content. LKMLens does not sell data or share it with third parties
        beyond what is necessary to operate the service (for example, its
        hosting provider, Cloudflare).
      </p>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Server logs and analytics
      </h2>
      <p>
        Cloudflare, as the hosting provider, processes standard request
        metadata (IP address, user agent, timestamps) to serve traffic and
        protect against abuse. LKMLens does not currently run third-party
        analytics or advertising trackers.
      </p>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Corrections and removal requests
      </h2>
      <p>
        If you are named in an indexed message and want a correction or
        removal request reviewed, please open an issue on{" "}
        <a
          className="underline decoration-slate-400 underline-offset-2"
          href="https://github.com/ziwon/lkmlens/issues"
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
