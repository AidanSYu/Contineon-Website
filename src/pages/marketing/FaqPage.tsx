import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Seo, JsonLd } from '@/components/Seo';

/* =============================================================================
   FaqPage, objection handling for evaluating labs. Grouped by the questions a
   lab director actually asks before a trial: what it is, how it connects, what
   happens to their data, and how the trial/billing works.
   ============================================================================= */

type QA = { q: string; a: string };
type Group = { group: string; items: QA[] };

const GROUPS: Group[] = [
  {
    group: 'Product',
    items: [
      {
        q: 'What exactly is Asilia?',
        a: 'Asilia is an autonomous agent for the lab. It plans a campaign toward an objective you set, executes the steps it can, and pauses to hand off the steps that still need a human. Every campaign it touches feeds a memory that makes the next one start smarter.',
      },
      {
        q: 'Do I need to buy new instruments or rebuild my lab?',
        a: 'No. Contineon retrofits the lab you have. Asilia runs on the instruments, ELN, and data you already operate. The whole premise is that you keep your workcell and add a memory and an autonomy layer on top of it.',
      },
      {
        q: 'What happens when a step needs a human?',
        a: 'Asilia pauses the campaign and notifies a scientist, like a job awaiting approval. You return a result (a TLC photo, a CSV, a note) and the run resumes from exactly where it stopped. Correct a tool call once and that correction becomes training signal.',
      },
    ],
  },
  {
    group: 'Integration & setup',
    items: [
      {
        q: 'Which instruments and systems integrate?',
        a: 'Asilia connects over open integrations to the systems labs already run, liquid handlers, plate readers, analytical instruments (e.g. LC/MS), and electronic lab notebooks. As a rule of thumb: if a step can be scripted or its output can be exported, Asilia can read it. Tell us your stack and we will confirm specifics.',
      },
      {
        q: 'How long does setup take?',
        a: 'Setup depends on your instruments, available interfaces, safety review, and deployment requirements. We scope the integration and timeline with you before a pilot.',
      },
      {
        q: 'Is Contineon cloud or on-premises?',
        a: 'Deployment arrangements are scoped individually. Tell us your cloud, on-premises, data residency, and governance requirements so we can confirm what is feasible.',
      },
    ],
  },
  {
    group: 'Data & security',
    items: [
      {
        q: 'Is my data private? Do you train shared models on it?',
        a: 'This website is not a lab-data upload service. Model use, training permissions, storage, and access to research data must be defined in the pilot agreement before data is connected. We do not use contact messages to train shared models.',
      },
      {
        q: 'Can I export my data if I leave?',
        a: 'Export formats, scope, and offboarding procedures need to be agreed for your pilot. This website does not provide a knowledge-graph export tool.',
      },
      {
        q: 'How do you secure my data?',
        a: 'The website uses HTTPS, Supabase authentication, and database access policies. SSO/SAML and lab audit logging are not website features. See the Security page and discuss pilot-specific requirements with us.',
      },
    ],
  },
  {
    group: 'Access & onboarding',
    items: [
      { q: 'Is Contineon incorporated?', a: 'Not yet. Contineon is an independent project in development. Requesting access does not create a paid subscription or pilot agreement. Any engagement must identify the actual parties and agreed scope before it begins.' },
      {
        q: 'How do I get access?',
        a: 'We onboard a small cohort of design-partner labs at a time. Request access and we will scope an early-partner pilot for your lab on the instruments you already run, no rip-and-replace.',
      },
      {
        q: 'Is there a demo?',
        a: 'Request a walkthrough and tell us what you would like to evaluate. We will confirm the available demonstration and its scope with you.',
      },
      {
        q: 'What support do I get?',
        a: 'Design partners work directly with the team building Asilia, with response times scoped to your pilot.',
      },
    ],
  },
];

export function FaqPage() {
  return (
    <div className="px-[5vw] pb-28 pt-32 lg:px-8 lg:pt-40">
      <Seo
        title="FAQ, Contineon"
        description="Answers to common questions about Asilia: instruments and integrations, data privacy and security, setup time, and how to get access."
        path="/faq"
      />
      {/* FAQPage rich-result markup, generated from GROUPS so it can't drift
          from the visible answers. */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: GROUPS.flatMap((g) =>
            g.items.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
          ),
        }}
      />

      <div className="mx-auto max-w-3xl">
        <div className="border-b border-line pb-8">
          <p className="lab-label text-safety">FAQ</p>
          <h1 className="mt-4 font-display text-[clamp(34px,5vw,56px)] font-bold tracking-tight text-ink">
            Questions, answered.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-muted">
            What labs ask before they retrofit. Can’t find it here?{' '}
            <a href="/contact" className="text-safety hover:underline">Ask us directly.</a>
          </p>
        </div>

        <div className="mt-10 space-y-12">
          {GROUPS.map((g) => (
            <div key={g.group}>
              <h2 className="lab-label mb-2 text-ink-faint">{g.group}</h2>
              <Accordion type="single" collapsible className="w-full">
                {g.items.map((item) => (
                  <AccordionItem key={item.q} value={item.q} className="border-line">
                    <AccordionTrigger className="text-left font-display text-base font-semibold text-ink hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-ink-muted">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* soft CTA */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
          <p className="font-display text-lg font-semibold text-ink">Ready to see it on your bench?</p>
          <div className="flex gap-3">
            <a href="/contact?topic=partner" className="inline-flex items-center justify-center gap-2 rounded bg-safety px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-safety/90">
              Request access
            </a>
            <a href="/contact?topic=demo" className="inline-flex items-center justify-center gap-2 rounded border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-line-hair">
              Book a demo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
