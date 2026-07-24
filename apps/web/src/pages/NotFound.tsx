import { Link } from "react-router";
import { SectionMarker } from "../components/SectionMarker.tsx";
import { frameRead } from "../lib/frame.ts";

export default function NotFound() {
  return (
    <div className={`${frameRead} py-20 sm:py-28`}>
      <SectionMarker label="404" />
      <h1 className="mt-3 text-h1 text-ink">Page not found</h1>
      <p className="mt-4 max-w-[56ch] text-body-lg text-ink-secondary">
        That route does not exist. Threads, topics, and vendors are reachable from search or
        from the channel indexes.
      </p>
      <ul className="mt-8 border-t border-border">
        {[
          { to: "/search", label: "Search indexed discussions" },
          { to: "/topics", label: "Topics" },
          { to: "/vendors", label: "Vendors" },
          { to: "/digests", label: "Digests" },
        ].map((item) => (
          <li key={item.to} className="border-b border-border">
            <Link
              to={item.to}
              className="focus-ring group flex min-h-14 items-center justify-between gap-4 transition-colors hover:bg-surface-subtle"
            >
              <span className="text-body text-ink group-hover:text-accent">{item.label}</span>
              <span aria-hidden="true" className="text-ink-faint group-hover:text-accent">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
