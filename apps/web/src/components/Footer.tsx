import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500 sm:px-6 dark:text-slate-400">
        <p className="max-w-2xl">
          Kernel Lens is an independent project and is not affiliated with
          kernel.org, the Linux Foundation, or the Linux kernel project.
          Every indexed message links back to its canonical{" "}
          <a
            href="https://lore.kernel.org/"
            className="underline decoration-slate-400 underline-offset-2 hover:text-slate-700 dark:hover:text-slate-200"
            target="_blank"
            rel="noreferrer"
          >
            lore.kernel.org
          </a>{" "}
          source.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link className="hover:text-slate-700 dark:hover:text-slate-200" to="/topics">
            Topics
          </Link>
          <Link className="hover:text-slate-700 dark:hover:text-slate-200" to="/vendors">
            Vendors
          </Link>
          <Link className="hover:text-slate-700 dark:hover:text-slate-200" to="/digests">
            Digests
          </Link>
          <Link className="hover:text-slate-700 dark:hover:text-slate-200" to="/about">
            About
          </Link>
          <Link className="hover:text-slate-700 dark:hover:text-slate-200" to="/about/methodology">
            Methodology
          </Link>
          <Link className="hover:text-slate-700 dark:hover:text-slate-200" to="/support">
            Support
          </Link>
          <Link className="hover:text-slate-700 dark:hover:text-slate-200" to="/privacy">
            Privacy
          </Link>
          <Link className="hover:text-slate-700 dark:hover:text-slate-200" to="/terms">
            Terms
          </Link>
          <a
            className="hover:text-slate-700 dark:hover:text-slate-200"
            href="https://github.com/ziwon/lkmlens"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
