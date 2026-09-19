import type { ReactNode } from 'react';
import { legal } from '@/config/legal';

/* =============================================================================
   LegalDoc, shared editorial shell for long-form legal/policy pages
   (Terms, Privacy). Keeps the masthead + typographic rhythm consistent with the
   rest of the marketing site. Content lives in the page that renders it.
   ============================================================================= */

export function LegalDoc({
  kicker,
  title,
  lastUpdated,
  children,
}: {
  kicker: string;
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <div className="px-[5vw] pb-28 pt-32 lg:px-8 lg:pt-40">
      <div className="mx-auto max-w-3xl">
        <div className="border-b border-line pb-8">
          <p className="lab-label text-safety">{kicker}</p>
          <h1 className="mt-4 font-display text-[clamp(34px,5vw,56px)] font-bold tracking-tight text-ink">
            {title}
          </h1>
          <p className="mt-4 font-mono-tech text-[11px] uppercase tracking-[0.16em] text-ink-faint">
            Last updated, {lastUpdated}
          </p>
        </div>

        <div className="legal-prose mt-10 space-y-8">{children}</div>

        <p className="mt-14 border-t border-line pt-6 text-sm text-ink-muted">
          Questions about this document?{' '}
          <a href="/contact" className="text-safety hover:underline">
            Contact us
          </a>
          .
        </p>
      </div>
    </div>
  );
}

/** A numbered section with a heading. */
export function LegalSection({ n, heading, children }: { n: string; heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
        <span className="mr-2 font-mono-tech text-sm text-ink-faint">{n}</span>
        {heading}
      </h2>
      <div className="mt-3 space-y-3 leading-relaxed text-ink-muted">{children}</div>
    </section>
  );
}

/** The project's present status; this is not a claim of incorporation. */
export function ProjectStatusNotice() {
  return (
    <div className="rounded-lg border border-line bg-panel p-5">
      <p className="font-semibold text-ink">A project in development</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        {legal.status} This website introduces our work and lets you contact the team.
        Requesting access does not create a paid subscription or a pilot agreement.
      </p>
    </div>
  );
}

export function LegalContact() {
  return (
    <p>
      {legal.operatorName && <>This website is operated by {legal.operatorName}. </>}
      Contineon is based in {legal.baseLocation}.{' '}
      For questions or privacy requests, email{' '}
      <a href={`mailto:${legal.contactEmail}`} className="text-safety hover:underline">{legal.contactEmail}</a>.
    </p>
  );
}
