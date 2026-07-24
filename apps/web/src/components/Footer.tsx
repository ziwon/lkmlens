import { Link } from "react-router";
import { SectionMarker } from "./SectionMarker.tsx";
import { SourceLink } from "./SourceLink.tsx";
import { frame } from "../lib/frame.ts";

const columns = [
  {
    marker: "Browse",
    links: [
      { to: "/topics", label: "Topics" },
      { to: "/vendors", label: "Vendors" },
      { to: "/digests", label: "Digests" },
      { to: "/search", label: "Search" },
    ],
  },
  {
    marker: "Project",
    links: [
      { to: "/about", label: "About" },
      { to: "/about/methodology", label: "Methodology" },
      { to: "/support", label: "Support" },
    ],
  },
  {
    marker: "Legal",
    links: [
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className={`${frame} grid gap-10 py-12 lg:grid-cols-[5fr_7fr] lg:gap-16`}>
        <div>
          <SectionMarker label="Kernel Lens" />
          <p className="mt-3 max-w-[56ch] text-small text-ink-muted">
            An independent project, not affiliated with kernel.org, the Linux Foundation, or
            the Linux kernel project. Every indexed message links back to its canonical{" "}
            <SourceLink href="https://lore.kernel.org/">lore.kernel.org</SourceLink> source.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.marker}>
              <SectionMarker label={column.marker} />
              <ul className="mt-3 space-y-1.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="focus-ring text-small text-ink-secondary transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {column.marker === "Project" && (
                  <li>
                    <SourceLink
                      href="https://github.com/ziwon/lkmlens"
                      className="text-small text-ink-secondary no-underline hover:text-accent"
                    >
                      GitHub
                    </SourceLink>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
