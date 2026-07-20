import { Link, NavLink } from "react-router";
import { Logo } from "./Logo.tsx";
import { ThemeToggle } from "./ThemeToggle.tsx";

const links = [
  { to: "/#topics", label: "Topics" },
  { to: "/about", label: "About" },
  { to: "/support", label: "Support" },
];

export function Nav() {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          to="/"
          className="focus-ring flex items-center gap-2 rounded-md text-lg font-semibold tracking-tight"
        >
          <Logo className="size-6 text-teal-600 dark:text-teal-400" />
          LKMLens
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="focus-ring rounded-md px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {link.label}
            </NavLink>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
