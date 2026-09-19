import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Magnetic } from '@/components/motion';
import { Cta } from '@/components/marketing/ui';
import { GridField } from '@/components/marketing/visuals';
import { ConsolePreview } from '@/components/marketing/ConsolePreview';
import { CREDITS } from '@/lib/mediaCredits';
import { Cinematic, Section, ASILIA_URL } from './asilia/shared';

/* =============================================================================
   Asilia overview, the front door of the standalone Asilia site, paced like
   antigravity.google's main page: one idea per screen, almost no body copy.
   Asilia is the UMBRELLA: the name over everything Contineon ships for
   autonomous science (like GPT over its family). The hero introduces the name
   itself; the demo film and framework specifics sit under it as the first
   product, with the SDK beside it and room for more (CLI etc.) later. All
   depth lives on /asilia/framework and /asilia/sdk.
   ============================================================================= */

export function AsiliaPage() {
  return (
    <>
      <Seo
        title="Asilia, Contineon"
        description="Asilia is Contineon's system for autonomous science: it plans real experiments, runs them on real instruments, and learns from every result. Today it ships as the Asilia Framework and the open Asilia SDK."
        path="/asilia"
      />

      {/* HERO — one vision line over real autonomous-lab footage. Source:
          Wikimedia Commons, Szymanski et al. (Nature, 2023), CC BY 4.0. */}
      <Section
        minH="min-h-[100svh]"
        className="items-end"
        media={
          <Cinematic
            video="/images/lab-arm.mp4"
            poster="/images/lab-arm.jpg"
            grade="saturate(1.06) contrast(1.05) brightness(0.9)"
            scan
            frame
            eager
            credit={CREDITS.aLabR3}
          />
        }
      >
        <div className="max-w-5xl pb-6 2xl:max-w-[80rem]">
          <h1 data-title className="text-[clamp(64px,13vw,224px)] font-bold leading-[0.9] tracking-[-0.05em]">
            Asilia
          </h1>
          <p data-fade className="mt-6 max-w-2xl text-[clamp(19px,2vw,36px)] font-medium leading-snug text-white/80 2xl:max-w-3xl">
            The system for autonomous science.
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

      {/* UMBRELLA — what the name covers. One screen that sets the family up:
          Framework now, SDK underneath, room for more releases under Asilia. */}
      <Section media={<GridField className="opacity-[0.16]" />}>
        <div className="mx-auto max-w-3xl text-center 2xl:max-w-[64rem]">
          <h2 data-title className="text-[clamp(30px,4.4vw,88px)] font-bold leading-[1.0] tracking-[-0.04em]">
            A new era of autonomous science.
          </h2>
          <p data-fade className="mt-7 text-[clamp(16px,1.4vw,25px)] leading-relaxed text-white/70">
            Asilia is one name for everything we build toward the autonomous lab: systems that plan real
            experiments, run them on real instruments, and learn from every result. Today it ships as the
            Asilia Framework, with the open Asilia SDK underneath. More is on the way.
          </p>
        </div>
      </Section>

      {/* ASILIA FRAMEWORK — the first product under the umbrella. The demo film
          and the framework beat sit together under the product name. */}
      <Section media={<GridField className="opacity-[0.18]" />}>
        <div className="mx-auto max-w-6xl 2xl:max-w-[88rem]">
          <div className="mx-auto max-w-2xl text-center">
            <h2 data-title className="text-[clamp(30px,4.4vw,88px)] font-bold leading-[1.0] tracking-[-0.04em]">
              Explore the campaign workflow.
            </h2>
          </div>
          <div data-fade className="mt-12">
            {/* Request a walkthrough until a recorded product demonstration is available. */}
            <ConsolePreview label="Asilia Framework walkthrough" />
          </div>
        </div>
      </Section>

      <Section minH="min-h-[88svh]" media={<GridField className="opacity-[0.14]" />}>
        <div className="grid items-center gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div>
            <h2 data-title className="text-[clamp(30px,4.4vw,88px)] font-bold leading-[1.0] tracking-[-0.04em]">
              Asilia Framework runs the whole loop.
            </h2>
            <p data-fade className="mt-7 max-w-xl text-[clamp(16px,1.4vw,25px)] leading-relaxed text-white/70 2xl:max-w-2xl">
              The first product under Asilia. It plans the campaign, runs it on the instruments you already
              have, and hands work back only where hands are needed.
            </p>
            <div data-fade className="mt-9">
              <Magnetic>
                <Cta to="/asilia/framework" variant="outlineLight">
                  Explore the Framework <ArrowRight className="h-4 w-4" />
                </Cta>
              </Magnetic>
            </div>
          </div>
          <div data-fade>
            <ConsolePreview label="Asilia console" />
          </div>
        </div>
      </Section>

      {/* SDK — one beat, one sentence, one route deeper */}
      <Section
        minH="min-h-[80svh]"
        media={<Cinematic image="/images/airglow.jpg" grade="saturate(1.14) contrast(1.08) brightness(0.9)" />}
      >
        <div className="max-w-3xl 2xl:max-w-[60rem]">
          <h2 data-title className="text-[clamp(30px,4.4vw,88px)] font-bold leading-[1.0] tracking-[-0.04em]">
            Built in the open.
          </h2>
          <p data-fade className="mt-7 max-w-xl text-[clamp(16px,1.4vw,25px)] leading-relaxed text-white/70 2xl:max-w-2xl">
            The Asilia SDK is the open toolkit underneath: typed capabilities in Python, packaged and signed as
            .asilia plugins. Apache-2.0.
          </p>
          <div data-fade className="mt-9">
            <Magnetic>
              <Cta to="/asilia/sdk" variant="outlineLight">
                Explore the SDK <ArrowRight className="h-4 w-4" />
              </Cta>
            </Magnetic>
          </div>
        </div>
      </Section>

      {/* CLOSE */}
      <Section
        minH="min-h-[92svh]"
        className="items-center"
        media={
          <>
            <GridField className="opacity-[0.14]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_118%,rgba(242,97,58,0.22),transparent_66%)]" />
          </>
        }
      >
        <div className="mx-auto max-w-3xl text-center 2xl:max-w-[64rem]">
          <h2 data-title className="text-[clamp(34px,5.4vw,116px)] font-bold leading-[0.98] tracking-[-0.05em]">
            Run Asilia on the lab you already have.
          </h2>
          <div data-fade className="mt-10 flex flex-wrap items-center justify-center gap-3">
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
    </>
  );
}
