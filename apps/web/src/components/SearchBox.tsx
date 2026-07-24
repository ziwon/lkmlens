import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

function shortcutHint() {
  if (typeof navigator === "undefined") return "⌘ K";
  return /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent) ? "⌘ K" : "Ctrl K";
}

/**
 * The primary product action, styled as a command surface rather than a
 * generic rounded form field (DESIGN.md 9.2). Press `/` or ⌘/Ctrl-K anywhere
 * to focus; Enter runs the search.
 */
export function SearchBox({
  autoFocus = false,
  initialValue = "",
  size = "default",
}: {
  autoFocus?: boolean;
  initialValue?: string;
  /** `compact` is for in-page reuse where the console is not the hero action. */
  size?: "default" | "compact";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isSlash = event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey;
      const isCommandK = event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
      if (!isSlash && !isCommandK) return;
      const target = event.target as HTMLElement | null;
      const isEditable =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if (isEditable && isSlash) return;
      event.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const q = value.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  const height = size === "compact" ? "h-12" : "h-[54px] sm:h-[58px]";

  return (
    <form onSubmit={onSubmit} className="w-full" role="search">
      <div
        className={`${height} flex items-center gap-3 rounded-md border border-border-strong bg-surface px-4 transition-colors focus-within:border-accent`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-[18px] shrink-0 text-ink-faint"
          aria-hidden="true"
        >
          <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1.5" />
          <line
            x1="15"
            y1="15"
            x2="20"
            y2="20"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="text"
          inputMode="search"
          aria-label="Search patches, discussions, authors, symbols, and subsystems"
          placeholder="Search symbols, patches, authors, vendors…"
          className={`w-full min-w-0 bg-transparent text-ink placeholder:text-ink-faint outline-none focus-visible:outline-none ${
            size === "compact" ? "text-body" : "text-body-lg"
          }`}
        />
        <kbd className="hidden shrink-0 rounded-sm border border-border px-1.5 py-0.5 font-mono text-meta text-ink-muted sm:inline-block">
          {shortcutHint()}
        </kbd>
      </div>
    </form>
  );
}
