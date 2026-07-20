import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

/** Keyboard-first search input: press `/` anywhere to focus, Enter to search. */
export function SearchBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const isEditable =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if (isEditable) return;
      event.preventDefault();
      inputRef.current?.focus();
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

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="focus-within:ring-2 focus-within:ring-emerald-500/70 flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 transition dark:border-slate-700 dark:bg-slate-900">
        <svg viewBox="0 0 24 24" fill="none" className="size-5 shrink-0 text-slate-400" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1.75" />
          <line x1="15" y1="15" x2="20" y2="20" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="text"
          inputMode="search"
          aria-label="Search patches and kernel discussions"
          placeholder="Search patches, discussions, authors, symbols, and subsystems..."
          className="w-full bg-transparent text-base text-slate-900 placeholder:text-slate-500 outline-none dark:text-slate-100 dark:placeholder:text-slate-400"
        />
        <kbd className="hidden shrink-0 rounded border border-slate-300 px-1.5 py-0.5 font-mono text-xs text-slate-500 sm:inline-block dark:border-slate-700 dark:text-slate-400">
          /
        </kbd>
      </div>
    </form>
  );
}
