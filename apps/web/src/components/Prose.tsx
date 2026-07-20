import type { PropsWithChildren } from "react";

export function Prose({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
        {title}
      </h1>
      <div className="prose-content mt-6 space-y-4 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </div>
  );
}
