/** A simple lens/focus mark — no trading-signal or alert metaphor, per docs/PLANNING.md section 22. */
export function Logo({ className = "size-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="10.5" cy="10.5" r="2.75" stroke="currentColor" strokeWidth="1.25" opacity="0.6" />
      <line
        x1="15.2"
        y1="15.2"
        x2="20.5"
        y2="20.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
