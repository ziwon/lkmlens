import { Link } from "react-router";
import type { CurationChannel } from "@lkmlens/shared";
import { plural } from "../lib/format.ts";

/**
 * Shared-border grid for topics and vendors (DESIGN.md 9.3). Cells share one
 * border rather than floating as individual cards, and carry no shadow.
 */
export function ChannelGrid({ channels }: { channels: CurationChannel[] }) {
  return (
    <div className="grid border-t border-l border-border sm:grid-cols-2 lg:grid-cols-4">
      {channels.map((channel) => (
        <Link
          key={`${channel.kind}:${channel.slug}`}
          to={`/${channel.kind === "vendor" ? "vendors" : "topics"}/${channel.slug}`}
          className="focus-ring group flex min-h-32 flex-col justify-between border-r border-b border-border p-5 transition-colors hover:bg-surface-subtle"
        >
          <div className="min-w-0">
            <span className="block font-medium text-ink transition-colors group-hover:text-accent">
              {channel.name}
            </span>
            {/* No `block` here — it would override line-clamp's -webkit-box
                display and let long vendor copy run unbounded. */}
            {channel.description && (
              <span className="mt-1.5 line-clamp-3 text-small text-ink-muted">
                {channel.description}
              </span>
            )}
          </div>
          <span className="mt-4 flex items-center justify-between gap-3">
            <span className="font-mono text-meta text-ink-muted">
              {plural(channel.patchCount, "observed patch", "observed patches")}
            </span>
            <span
              aria-hidden="true"
              className="text-ink-faint transition-colors group-hover:text-accent"
            >
              →
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
