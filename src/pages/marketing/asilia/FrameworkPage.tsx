import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Magnetic } from '@/components/motion';
import { Cta } from '@/components/marketing/ui';
import { GridField } from '@/components/marketing/visuals';
import { ConsolePreview } from '@/components/marketing/ConsolePreview';
import { CREDITS } from '@/lib/mediaCredits';
import { Cinematic, Section, ASILIA_URL } from './shared';

/* Asilia Framework — the detailed product page. The overview at /asilia stays
   sparse (antigravity-style); the full story lives here: the flagship hero,
   the closed loop, the console and capabilities, compounding memory, the
   engine underneath, and a close that routes to the SDK. */

const LOOP = [
  { k: 'Plan', t: 'Decompose an objective into an ordered campaign of concrete experiments.' },
  { k: 'Run', t: 'Execute on your instruments, calling for a human only where hands are genuinely needed.' },
  { k: 'Evaluate', t: 'Read the results back, the failures included, score them, and explain them.' },
  { k: 'Learn', t: 'Fold every outcome into the lab’s memory so the next campaign starts smarter.' },
];

const FRAMEWORK = [
  { h: 'Autonomous planning', p: 'Asilia turns an objective into an ordered campaign of concrete experiments.' },
  { h: 'Runs on your bench', p: 'It executes on the instruments, ELN, and integrations you already operate. No rip-and-replace.' },
  { h: 'Human-in-the-loop', p: 'It pauses for the steps that need hands, then resumes from exactly where it stopped.' },
  { h: 'Honest evaluation', p: 'Results, including the failures, are read back, scored, and explained.' },
];

const MEMORY: [string, string][] = [
  ['Compounding', 'Knowledge carries across every campaign.'],
  ['Portable', 'Your graph and run history export with you.'],
  ['Honest', 'Claims are labelled as targets until they’re benchmarked.'],
];

export function AsiliaFrameworkPage() {
  return (
    <>
      <Seo
        title="Asilia Framework, Contineon"
        description="The Asilia Framework is the autonomous lab system: it plans a campaign, runs it on the instruments you already have, hands work back when it needs you, and remembers everything it learns."
        path="/asilia/framework"
      />

      {/* HERO — real autonomous-lab footage: the Berkeley A-Lab, robot arms
          synthesizing novel materials on their own. Source: Wikimedia Commons,
          Szymanski et al. "An autonomous laboratory..." (Nature, 2023), CC BY 4.0. */}
      <Section
        minH="min-h-[100svh]"
        className="items-end"
        media={
          <Cinematic
            video="/images/asilia-lab.mp4"
            poster="/images/asilia-lab.jpg"
            grade="saturate(1.08) contrast(1.05) brightness(0.9)"
            scan
            frame
            eager
            credit={CREDITS.aLabR1}
          />
        }
      >
        <div className="max-w-4xl pb-6 2xl:max-w-[70rem]">
          <h1 data-title className="text-[clamp(42px,7vw,152px)] font-bold leading-[0.92] tracking-[-0.05em]">
            Run your lab on its own.
          </h1>
          <p data-fade className="mt-8 max-w-2xl text-[clamp(17px,1.6vw,28px)] font-medium leading-snug text-white/70 2xl:max-w-3xl">
            Asilia turns an objective into a campaign, runs it on the instruments you already have, hands work
            back when it needs you, and remembers everything it learns.
          </p>
          <div data-fade className="mt-10 flex flex-wrap items-center gap-3">
            <Magnetic>
              <Cta to="/contact?topic=partner" variant="accent">
                Request access <ArrowRight className="h-4 w-4" />
              </Cta>
            </Magnetic>
            <Magnetic>
              <Cta to={ASILIA_URL} variant="outlineLight">
                Partner sign in <ArrowUpRight className="h-4 w-4" />
              </Cta>
            </Magnetic>
          </div>
        </div>
      </Section>

      {/* THE LOOP — the worldview stated before the detail */}
      <Section
        minH="min-h-[90svh]"
        media={<GridField className="opacity-[0.16]" />}
      >
        <div className="max-w-5xl 2xl:max-w-[80rem]">
          <h2 data-title className="max-w-3xl text-[clamp(32px,5vw,104px)] font-bold leading-[0.98] tracking-[-0.05em] 2xl:max-w-[56rem]">
            One loop, closed and running.
          </h2>
          <p data-fade className="mt-7 max-w-xl text-[clamp(16px,1.4vw,25px)] leading-relaxed text-white/70 2xl:max-w-2xl">
            Discovery is a loop: try something, run it for real, measure what happened, carry it forward. Asilia
            closes that loop and runs it on its own.
          </p>
          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-white/12 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {LOOP.map((s, i) => (
              <div key={s.k} data-fade className="bg-[#0A0C10]/80 p-6 backdrop-blur-sm">
                <span className="lab-label text-safety">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-4 text-xl font-semibold">{s.k}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-white/60">{s.t}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* DETAIL — console + capabilities, led by the moat line */}
      <Section minH="min-h-[92svh]" media={<GridField className="opacity-[0.16]" />}>
        <div className="grid items-center gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div data-fade>
            <ConsolePreview label="Asilia console" />
          </div>
          <div>
            <h2 data-title className="text-[clamp(26px,3.2vw,64px)] font-bold leading-[1.04] tracking-[-0.04em]">
              The full loop, on your instruments.
            </h2>
            <p data-fade className="mt-6 max-w-xl text-[clamp(15px,1.25vw,22px)] leading-relaxed text-white/70">
              Every other self-driving lab asks you to rebuild from scratch. The Asilia Framework retrofits the
              instruments, the ELN, and the people you already have.
            </p>
            <dl className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {FRAMEWORK.map((c) => (
                <div key={c.h} data-fade className="py-4">
                  <dt className="text-[16px] font-semibold text-white/90">{c.h}</dt>
                  <dd className="mt-1 text-[14.5px] leading-relaxed text-white/60">{c.p}</dd>
                </div>
              ))}
            </dl>
            <div data-fade className="mt-8 flex flex-wrap gap-3">
              <Magnetic>
                <Cta to={ASILIA_URL} variant="outlineLight">
                  Partner sign in <ArrowUpRight className="h-4 w-4" />
                </Cta>
              </Magnetic>
              <Magnetic>
                <Cta to="/asilia/docs" variant="outlineLight">
                  Read the docs <ArrowRight className="h-4 w-4" />
                </Cta>
              </Magnetic>
            </div>
          </div>
        </div>
      </Section>

      {/* COMPOUNDING MEMORY — the durable knowledge graph */}
      <Section
        minH="min-h-[90svh]"
        media={
          <Cinematic
            image="/images/gargantua-blackhole.webp"
            grade="saturate(1.16) contrast(1.08) brightness(0.94)"
          />
        }
      >
        <div className="grid items-center gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div>
            <h2 data-title className="text-[clamp(30px,4.4vw,88px)] font-bold leading-[1.0] tracking-[-0.04em]">
              Most labs throw away their hardest-won knowledge.
            </h2>
            <p data-fade className="mt-7 max-w-xl text-[clamp(16px,1.35vw,24px)] leading-relaxed text-white/70 2xl:max-w-2xl">
              Every run (recipes, failure modes, lab lore) accumulates into a private knowledge graph. It is
              yours alone, it exports with you, and it makes each campaign smarter than the last.
            </p>
          </div>
          <dl className="space-y-px overflow-hidden rounded-xl border border-white/12">
            {MEMORY.map(([t, d]) => (
              <div key={t} data-fade className="bg-[#0A0C10]/80 px-6 py-5 backdrop-blur-sm">
                <dt className="text-[16px] font-semibold text-white/90">{t}</dt>
                <dd className="mt-1 text-[14.5px] text-white/60">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* UNDER THE HOOD — the Einstein Engine, named once; depth lives in
          Technology. The proper noun sits in one swappable sentence on purpose. */}
      <Section
        minH="min-h-[88svh]"
        media={
          <Cinematic
            video="/images/sun-ballet.mp4"
            poster="/images/sun-ballet-poster.jpg"
            grade="saturate(1.2) contrast(1.1) brightness(0.82)"
            scan
          />
        }
      >
        <div className="max-w-3xl 2xl:max-w-[60rem]">
          <h2 data-title className="text-[clamp(32px,5vw,104px)] font-bold leading-[0.98] tracking-[-0.05em]">
            A reasoning engine built for the bench.
          </h2>
          <p data-fade className="mt-7 max-w-xl text-[clamp(16px,1.4vw,25px)] leading-relaxed text-white/70 2xl:max-w-2xl">
            Asilia runs on the Einstein Engine, Contineon’s reasoning model for physical science. It plans the
            experiments, reads the results back, and decides what to run next.
          </p>
          <div data-fade className="mt-9">
            <Magnetic>
              <Cta to="/technology/foundation-models" variant="outlineLight">
                See the technology <ArrowRight className="h-4 w-4" />
              </Cta>
            </Magnetic>
          </div>
        </div>
      </Section>

      {/* CLOSE + cross-link to the SDK */}
      <Section
        minH="min-h-[80svh]"
        className="items-center"
        media={
          <>
            <GridField className="opacity-[0.14]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_118%,rgba(242,97,58,0.22),transparent_66%)]" />
          </>
        }
      >
        <div className="mx-auto max-w-3xl text-center 2xl:max-w-[64rem]">
          <h2 data-title className="text-[clamp(30px,4.6vw,96px)] font-bold leading-[1.0] tracking-[-0.05em]">
            See it run on your bench.
          </h2>
          <div data-fade className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Magnetic>
              <Cta to="/contact?topic=partner" variant="accent">
                Request access <ArrowRight className="h-4 w-4" />
              </Cta>
            </Magnetic>
            <Magnetic>
              <Cta to="/asilia/sdk" variant="outlineLight">
                Explore the SDK <ArrowRight className="h-4 w-4" />
              </Cta>
            </Magnetic>
          </div>
        </div>
      </Section>
    </>
  );
}
