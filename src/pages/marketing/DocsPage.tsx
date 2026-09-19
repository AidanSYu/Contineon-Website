import { Seo } from '@/components/Seo';

/* =============================================================================
   DocsPage, a single integration guide (not a full docs system). Answers the
   "how would this actually plug into my lab?" question for an evaluator. Expand
   into a proper docs site later; for now it gives prospects concrete footing.
   ============================================================================= */

const STEPS = [
  {
    n: '01',
    h: 'Connect your workcell',
    p: 'Point Asilia at the instruments, ELN, and data stores you already run. Integration is over open interfaces, scriptable steps and exportable data are starting points for an integration review. No rip-and-replace and no new instruments.',
    items: ['Liquid handlers & automation', 'Plate readers & analytical instruments (e.g. LC/MS)', 'Electronic lab notebooks', 'Existing execution traces & CSV/data exports'],
  },
  {
    n: '02',
    h: 'Define a campaign',
    p: 'Describe an objective, a yield to optimize, a screen to run. Asilia plans the campaign, seeding it from prior runs in your lab so it doesn’t start cold, and proposes the steps it will execute autonomously.',
    items: ['Set an objective & constraints', 'Review the seeded plan', 'Approve autonomous execution'],
  },
  {
    n: '03',
    h: 'Resolve handoffs',
    p: 'A pilot should define when a campaign pauses for a scientist and which notification channels are supported. You return a result and the run resumes from exactly where it stopped. Corrections become training signal.',
    items: ['Get notified on the channel you use', 'Return a reading, file, or note', 'Run resumes with full state preserved'],
  },
  {
    n: '04',
    h: 'Watch memory compound',
    p: 'Every campaign feeds a knowledge graph that is yours alone, recipes, failure modes, supplier quirks, lab lore. The next campaign starts smarter, with export formats and offboarding procedures agreed for your pilot.',
    items: ['Cross-campaign carry-over', 'Recipe & failure-mode library', 'Agree lineage & export requirements'],
  },
];

export function DocsPage() {
  return (
    <div className="px-[5vw] pb-28 pt-32 lg:px-8 lg:pt-40">
      <Seo
        title="Integration guide, Contineon"
        description="How Asilia connects to the instruments, ELN, and data you already run, and how a campaign goes from objective to compounding memory."
        path="/docs"
      />

      <div className="mx-auto max-w-3xl">
        <div className="border-b border-line pb-8">
          <p className="lab-label text-safety">DOCS · INTEGRATION GUIDE</p>
          <h1 className="mt-4 font-display text-[clamp(34px,5vw,56px)] font-bold tracking-tight text-ink">
            From your workcell to a learning lab.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-muted">
            An evaluation guide for scoping an Asilia pilot. Capabilities and integrations must be confirmed for your lab. Need specifics for
            your stack? <a href="/contact?topic=demo" className="text-safety hover:underline">Ask us.</a>
          </p>
        </div>

        <div className="mt-10 space-y-10">
          {STEPS.map((s) => (
            <section key={s.n} className="border-l-2 border-line pl-6">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-2xl font-extrabold tracking-tight text-safety">{s.n}</span>
                <h2 className="font-display text-xl font-semibold tracking-tight text-ink">{s.h}</h2>
              </div>
              <p className="mt-3 leading-relaxed text-ink-muted">{s.p}</p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {s.items.map((it) => (
                  <li key={it} className="flex items-center gap-2 border border-line bg-surface px-3 py-2 text-sm text-ink-muted">
                    <span className="h-1.5 w-1.5 flex-none rounded-full bg-safety" />
                    {it}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-xl border border-line bg-panel p-7">
          <h2 className="font-display text-xl font-bold tracking-tight text-ink">Want the technical detail?</h2>
          <p className="mt-2 text-ink-muted">
            We’ll walk through integration for your specific instruments and data, and share security
            and deployment specifics for your evaluation.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="/contact?topic=demo" className="inline-flex items-center justify-center rounded bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:opacity-90">
              Book a technical walkthrough
            </a>
            <a href="/security" className="inline-flex items-center justify-center rounded border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-line-hair">
              Read about security
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
