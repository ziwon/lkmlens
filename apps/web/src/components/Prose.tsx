import type { PropsWithChildren } from "react";
import { SectionMarker } from "./SectionMarker.tsx";
import { frameRead } from "../lib/frame.ts";

/**
 * Editorial reading layout for About, Methodology, Privacy, Terms, and Support
 * (DESIGN.md 10.6). Typography for the body comes from `.prose-content` in
 * index.css so pages can write plain semantic markup.
 */
export function Prose({
  title,
  marker,
  updated,
  lead,
  children,
}: PropsWithChildren<{
  title: string;
  marker?: string;
  /** Visible update date, e.g. "2026-07-24". */
  updated?: string;
  lead?: string;
}>) {
  return (
    <article className={`${frameRead} py-14 sm:py-20`}>
      <header className="border-b border-border-strong pb-8">
        {marker && <SectionMarker label={marker} />}
        <h1 className="mt-3 text-h1 text-ink">{title}</h1>
        {lead && <p className="mt-4 max-w-[60ch] text-body-lg text-ink-secondary">{lead}</p>}
        {updated && (
          <p className="mt-5 font-mono text-meta tracking-[0.04em] text-ink-muted uppercase">
            Updated {updated}
          </p>
        )}
      </header>
      <div className="prose-content mt-10">{children}</div>
    </article>
  );
}
