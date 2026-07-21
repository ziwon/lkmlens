import { Link, NavLink } from "react-router";
import { Logo } from "./Logo.tsx";
import { ThemeToggle } from "./ThemeToggle.tsx";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="focus-ring flex items-center gap-2 rounded-md text-lg font-semibold tracking-tight"
        >
          <Logo className="size-6 text-emerald-600 dark:text-emerald-400" />
          Kernel Lens
          <span className="hidden border-l border-slate-200 pl-2 text-xs font-normal text-slate-400 lg:inline dark:border-slate-800">A clearer view into Linux kernel development</span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-0.5 text-sm">
          <NavLink
            to="/digests"
            className={({ isActive }) => `focus-ring rounded-md px-3 py-2 font-medium transition ${isActive ? "bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"}`}
          >
            Digests
          </NavLink>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
