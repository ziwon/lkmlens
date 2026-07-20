import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Page not found</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        That page doesn't exist.
      </p>
      <Link
        to="/"
        className="focus-ring mt-6 inline-block rounded-md px-3 py-2 font-medium text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-500/10"
      >
        Back to search
      </Link>
    </div>
  );
}
