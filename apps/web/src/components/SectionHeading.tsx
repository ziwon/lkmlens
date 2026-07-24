import { Link } from "react-router";
import { SectionMarker } from "./SectionMarker.tsx";

/**
 * Standard section frame (DESIGN.md 6.4): a top rule, a mono marker, a strong
 * title, one explanatory sentence, and an optional action on the same baseline.
 */
export function SectionHeading({
  id,
  index,
  marker,
  title,
  description,
  action,
}: {
  id?: string;
  index?: string;
  marker: string;
  title: string;
  description?: string;
  action?: { to: string; label: string };
}) {
  return (
    <div className="flex flex-col items-start gap-3 border-b border-border-strong pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
      <div className="min-w-0">
        <SectionMarker index={index} label={marker} />
        <h2 id={id} className="mt-2 text-h3 text-ink">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 max-w-[64ch] text-small text-ink-muted">{description}</p>
        )}
      </div>
      {action && (
        <Link
          to={action.to}
          className="focus-ring inline-flex min-h-11 shrink-0 items-center gap-1.5 font-mono text-meta tracking-[0.06em] text-accent uppercase hover:text-accent-hover"
        >
          {action.label}
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}
