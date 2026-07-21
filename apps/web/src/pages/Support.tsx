import { Prose } from "../components/Prose.tsx";

const tiers = [
  { amount: "$3/month", label: "Keep the index running" },
  { amount: "$10/month", label: "Support AI summaries" },
  { amount: "$25/month", label: "Infrastructure sponsor" },
];

export default function Support() {
  return (
    <Prose title="Support Kernel Lens">
      <p>
        Kernel Lens is a free and open-source service. Sponsorships help cover
        indexing, AI inference, storage, email delivery, and future domain
        costs. Sponsorship never influences indexing, ranking, or editorial
        treatment, and tier benefits never gate core search, thread reading,
        or source links.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.amount}
            className="rounded-lg border border-slate-200 p-4 text-center dark:border-slate-800"
          >
            <div className="font-semibold text-slate-900 dark:text-white">{tier.amount}</div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tier.label}</div>
          </div>
        ))}
      </div>

      <a
        href="https://github.com/sponsors/ziwon"
        target="_blank"
        rel="noreferrer"
        className="focus-ring inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-500"
      >
        Sponsor on GitHub
      </a>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Funding priorities
      </h2>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Keep the public search service online</li>
        <li>Cover AI inference</li>
        <li>Increase indexing depth and retention</li>
        <li>Add email and feed delivery</li>
        <li>Purchase a dedicated domain</li>
        <li>Fund contributor work</li>
      </ol>
    </Prose>
  );
}
