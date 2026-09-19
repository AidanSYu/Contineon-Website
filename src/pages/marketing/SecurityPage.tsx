import { Lock, Database, KeyRound, Network, Eye, FileCheck } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { legal, websiteProviders } from '@/config/legal';

/* =============================================================================
   SecurityPage, the trust posture a lab needs before it connects Asilia to its
   instruments and data. Honest about what exists today vs. what is on the
   roadmap (the product is in private trial).
   ============================================================================= */

const PILLARS = [
  { icon: Database, title: 'Limited website data', body: 'The website handles inquiries, update subscriptions, and invited account records. Please agree data handling with us before connecting research data or instruments.' },
  { icon: Lock, title: 'Transport and credentials', body: 'Production connections use HTTPS. Account authentication is handled by Supabase; privileged database and email credentials belong in server-side configuration.' },
  { icon: Network, title: 'Database access controls', body: 'The website database defines row-level access policies for account-owned records. Public contact and newsletter writes pass through server-side functions. These controls do not establish isolation for a separate lab deployment.' },
  { icon: KeyRound, title: 'Account access', body: 'The website uses email and password authentication and distinguishes administrators from account holders. SSO and SAML are not offered by this website.' },
  { icon: Eye, title: 'Research data', body: 'Cross-lab learning and differential privacy are not features of this website. Any pilot needs its own review of data access, storage, model use, and deletion before research data is shared.' },
  { icon: FileCheck, title: 'Review before a pilot', body: 'Tell us the controls your lab requires. Deployment architecture, audit records, export procedures, and incident responsibilities need to be confirmed for the specific engagement.' },
];

export function SecurityPage() {
  return (
    <div className="px-[5vw] pb-28 pt-32 lg:px-8 lg:pt-40">
      <Seo
        title="Security & Trust, Contineon"
        description="Current website security controls, service providers, and the review needed before an Asilia pilot."
        path="/security"
      />

      <div className="mx-auto max-w-5xl">
        <div className="border-b border-line pb-8">
          <p className="lab-label text-safety">SECURITY &amp; TRUST</p>
          <h1 className="mt-4 font-display text-[clamp(34px,5vw,56px)] font-bold tracking-tight text-ink">
            Security, with clear boundaries.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted">
            Contineon is a project in development. Here is what this website implements and what
            needs to be reviewed before any laboratory deployment.
          </p>
        </div>

        {/* pillars */}
        <div className="mt-12 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.title} className="bg-surface p-7">
              <div className="flex h-10 w-10 items-center justify-center border border-line-hair text-safety">
                <p.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">{p.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{p.body}</p>
            </div>
          ))}
        </div>

        {/* subprocessors */}
        <div className="mt-14">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Website service providers</h2>
          <p className="mt-2 max-w-2xl text-ink-muted">
            These providers support the website where their corresponding features are enabled.
            Pilot-specific providers and processing arrangements must be confirmed separately.
          </p>
          <div className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
            {websiteProviders.map(({ name, role }, i) => (
              <div
                key={name}
                className={`flex flex-wrap items-center justify-between gap-2 px-6 py-4 ${i ? 'border-t border-line' : ''}`}
              >
                <span className="font-display font-semibold text-ink">{name}</span>
                <span className="text-sm text-ink-muted">{role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* honest status */}
        <div className="mt-14 rounded-xl border border-line bg-panel p-7">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Where we are today</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-ink-muted">
            {legal.status} We do not claim SOC 2 certification, an independent security audit,
            or a published Data Processing Addendum. This page describes the website implementation;
            it is not an assurance that a particular lab deployment meets your requirements. Contact
            us before sending sensitive data or connecting instruments.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/contact?topic=security" className="inline-flex items-center justify-center gap-2 rounded bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:opacity-90">
              Request our security details
            </a>
            <a href={`mailto:${legal.contactEmail}?subject=Security%20report`} className="inline-flex items-center justify-center gap-2 rounded border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-line-hair">
              Report a vulnerability
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
