import { Prose } from "../components/Prose.tsx";

const costs = [
  { item: "Indexing and D1 storage", detail: "Collection runs, thread reconstruction, search index" },
  { item: "AI inference", detail: "Bounded daily budget for evidence-linked summaries" },
  { item: "Hosting and delivery", detail: "Cloudflare Pages, Workers, feed delivery" },
];

export default function Support() {
  return (
    <Prose
      title="Support Kernel Lens"
      marker="Support"
      lead="Kernel Lens is free and open source. Sponsorship covers running costs — it never influences indexing, ranking, or editorial treatment."
      updated="2026-07-24"
    >
      <p>
        Core search, thread reading, evidence links, and source access are not gated and will
        not become gated. Sponsorship exists so the public index can keep running, not to
        unlock features.
      </p>

      <h2>What support pays for</h2>
      <dl className="grid border-t border-l border-border sm:grid-cols-3">
        {costs.map((cost) => (
          <div key={cost.item} className="border-r border-b border-border p-4">
            <dt className="font-mono text-meta tracking-[0.06em] text-ink-secondary uppercase">
              {cost.item}
            </dt>
            <dd className="mt-2 text-small text-ink-muted">{cost.detail}</dd>
          </div>
        ))}
      </dl>
      <p>
        Kernel Lens currently runs on free and low-tier infrastructure. A monthly cost
        snapshot will be published here once the figures are stable enough to be worth
        quoting.
      </p>

      <p>
        <a
          href="https://github.com/sponsors/ziwon"
          target="_blank"
          rel="noreferrer"
          className="focus-ring inline-flex min-h-11 items-center rounded-md bg-accent px-4 font-medium text-canvas no-underline transition-colors hover:bg-accent-hover"
        >
          Sponsor on GitHub ↗
        </a>
      </p>

      <h2>Funding priorities</h2>
      <ol>
        <li>Keep the public search service online</li>
        <li>Cover AI inference within a bounded budget</li>
        <li>Increase indexing depth and retention</li>
        <li>Add email and feed delivery</li>
        <li>Purchase a dedicated domain</li>
        <li>Fund contributor work</li>
      </ol>

      <h2>Independence</h2>
      <p>
        Sponsors receive no influence over which patches, topics, or vendors are indexed, how
        they are ranked, or how evidence is presented. Vendor lenses are driven by public,
        reviewable rules, and every sponsorship arrangement stays outside that pipeline.
      </p>
    </Prose>
  );
}
