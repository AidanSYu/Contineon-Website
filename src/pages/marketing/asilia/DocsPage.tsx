import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Seo } from '@/components/Seo';

/* Asilia docs — a real documentation portal (sidebar + article), modeled on
   antigravity.google/docs, not a marketing one-pager. Utilitarian and dense,
   still on the Asilia obsidian ground, rendered inside AsiliaLayout (so the Asilia
   header sits on top). Content is a starter set; deeper pages are marked Soon. */

type NavItem = { label: string; href?: string; to?: string; external?: boolean; soon?: boolean };
type NavGroup = { title: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    title: 'Getting started',
    items: [
      { label: 'Introduction', href: '#introduction' },
      { label: 'Quickstart', href: '#quickstart' },
    ],
  },
  {
    title: 'Concepts',
    items: [
      { label: 'The autonomous loop', href: '#concepts' },
      { label: 'Human in the loop', href: '#concepts' },
      { label: 'Compounding memory', href: '#concepts' },
    ],
  },
  {
    title: 'Products',
    items: [
      { label: 'Asilia Framework', href: '#framework' },
      { label: 'Asilia SDK', href: '#sdk' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { label: 'CLI reference', to: '/asilia/sdk#cli' },
      { label: 'API access', href: '#api' },
      { label: 'Release notes', to: '/asilia/news' },
    ],
  },
];

/* Terminal-style code block for docs snippets. */
function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-4 overflow-x-auto rounded-xl border border-white/12 bg-[#0A0C10] p-4 font-mono-tech text-[13px] leading-[1.8] text-white/85">
      <code>{children}</code>
    </pre>
  );
}

function DocSection({
  id,
  kicker,
  title,
  children,
}: {
  id: string;
  kicker?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-white/10 py-12 first:border-t-0 first:pt-0">
      {kicker && <p className="lab-label mb-3 text-safety">{kicker}</p>}
      <h2 className="text-[clamp(24px,3vw,44px)] font-bold tracking-[-0.03em] text-white">{title}</h2>
      <div className="mt-5 max-w-2xl space-y-4 text-[15px] leading-relaxed text-white/65 2xl:max-w-3xl 2xl:text-[16px]">{children}</div>
    </section>
  );
}

export function AsiliaDocsPage() {
  return (
    <>
      <Seo
        title="Documentation, Asilia"
        description="Asilia documentation: get started with the Asilia Framework and Asilia SDK, learn the autonomous loop, and connect the lab you already run."
        path="/asilia/docs"
      />

      <div className="min-h-screen bg-[#06080B] pt-16 text-white">
        <div className="site-shell flex gap-12">
          {/* Sidebar */}
          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 overflow-y-auto border-r border-white/10 py-12 pr-6 lg:block">
            <p className="lab-label mb-6 text-white/40">Documentation</p>
            <nav className="space-y-7">
              {NAV.map((group) => (
                <div key={group.title}>
                  <p className="mb-2 text-[12.5px] font-semibold uppercase tracking-wide text-white/35">
                    {group.title}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => (
                      <li key={item.label}>
                        {item.soon ? (
                          <span className="flex items-center justify-between rounded-md px-2 py-1.5 text-[14px] text-white/30">
                            {item.label}
                            <span className="lab-label text-[9px] text-white/25">Soon</span>
                          </span>
                        ) : item.to ? (
                          <Link
                            to={item.to}
                            className="block rounded-md px-2 py-1.5 text-[14px] text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <a
                            href={item.href}
                            className="block rounded-md px-2 py-1.5 text-[14px] text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                          >
                            {item.label}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* Article column */}
          <article className="min-w-0 flex-1 py-12">
            <div className="max-w-2xl 2xl:max-w-3xl">
              <p className="lab-label text-white/40">Asilia docs</p>
              <h1 className="mt-3 text-[clamp(32px,4.5vw,72px)] font-bold leading-[1.02] tracking-[-0.04em] text-white">
                Build with Asilia.
              </h1>
              <p className="mt-5 text-[clamp(16px,1.4vw,23px)] leading-relaxed text-white/65">
                Everything you need to run the lab you already have on Asilia: the autonomous loop, the Framework,
                and the SDK. This is a starter set. More lands as the SDK ships.
              </p>
            </div>

            <div className="mt-10">
              <DocSection id="introduction" kicker="Getting started" title="Introduction">
                <p>
                  Asilia is Contineon’s autonomous lab system. It turns an objective into a campaign, runs it on
                  the instruments you already operate, hands work back when it genuinely needs a person, and
                  keeps a durable memory of everything it learns.
                </p>
                <p>Asilia comes in two parts:</p>
                <ul className="list-disc space-y-1.5 pl-5 marker:text-white/30">
                  <li>
                    The{' '}
                    <Link to="/asilia/framework" className="text-white underline decoration-white/25 underline-offset-4 hover:decoration-white">
                      Asilia Framework
                    </Link>{' '}
                    runs the full autonomous loop on your bench.
                  </li>
                  <li>
                    The{' '}
                    <Link to="/asilia/sdk" className="text-white underline decoration-white/25 underline-offset-4 hover:decoration-white">
                      Asilia SDK
                    </Link>{' '}
                    is the developer kit: asilia-protocol, the open typed contract (ALP), plus the asilia CLI
                    that builds, signs, and verifies .asilia plugin packages.
                  </li>
                </ul>
              </DocSection>

              <DocSection id="quickstart" kicker="Getting started" title="Quickstart">
                <p>Install the SDK and ship a signed plugin in five commands.</p>
                <Code>
                  <span className="text-white/35"># Apache-2.0 · Python ≥ 3.10 · pulls in asilia-protocol, the contract library</span>
                  {'\n'}
                  <span className="text-safety">$</span> pip install asilia-sdk
                  {'\n\n'}
                  <span className="text-safety">$</span> asilia init my_tool --runtime python   <span className="text-white/35"># scaffold manifest.json + wrapper.py</span>
                  {'\n'}
                  <span className="text-safety">$</span> asilia keygen -o my_publisher          <span className="text-white/35"># Ed25519 keypair (keep the .key secret)</span>
                  {'\n'}
                  <span className="text-safety">$</span> asilia build my_tool --sign my_publisher.key -o my_tool.asilia
                  {'\n'}
                  <span className="text-safety">$</span> asilia verify my_tool.asilia            <span className="text-white/35"># signature + trust level</span>
                  {'\n'}
                  <span className="text-safety">$</span> asilia test my_tool                    <span className="text-white/35"># conformance suite</span>
                </Code>
                <p>
                  The contract itself is plain Python. Declare a capability and the manifest validates on
                  construction:
                </p>
                <Code>
                  <span className="text-[#7FB6D6]">from</span> asilia_protocol <span className="text-[#7FB6D6]">import</span> CapabilityDecl, CapabilityKind, Actor
                  {'\n\n'}
                  <span className="text-white/35"># the kernel routes every dispatch by kind + actor</span>
                  {'\n'}
                  decl <span className="text-white/40">=</span> CapabilityDecl(
                  {'\n'}
                  {'    '}name<span className="text-white/40">=</span><span className="text-safety">&quot;measure_purity&quot;</span>,
                  {'\n'}
                  {'    '}kind<span className="text-white/40">=</span>CapabilityKind.INSTRUMENT,
                  {'\n'}
                  {'    '}actor<span className="text-white/40">=</span>Actor.INSTRUMENT,
                  {'\n'}
                  )
                </Code>
                <p className="text-[13.5px] text-white/40">
                  The protocol and toolkit are open source. The Asilia engine is proprietary. Request access
                  to run against a live kernel.
                </p>
              </DocSection>

              <DocSection id="concepts" kicker="Concepts" title="The autonomous loop">
                <p>
                  Discovery is a loop, and Asilia closes it: <strong className="font-semibold text-white/85">plan</strong> an
                  objective into concrete experiments, <strong className="font-semibold text-white/85">run</strong> them on
                  your instruments, <strong className="font-semibold text-white/85">evaluate</strong> the results
                  (the failures included), and <strong className="font-semibold text-white/85">learn</strong>, folding
                  every outcome back into the lab’s memory so the next campaign starts smarter.
                </p>
              </DocSection>

              <DocSection id="framework" kicker="Products" title="Asilia Framework">
                <p>
                  The Framework is the autonomous lab system. It retrofits the instruments, ELN, and integrations
                  you already operate, plans and runs campaigns in parallel, and pauses for a human only where
                  hands are genuinely needed.
                </p>
                <p>
                  <Link to="/asilia/framework" className="inline-flex items-center gap-1.5 text-white underline decoration-white/25 underline-offset-4 hover:decoration-white">
                    Read the Framework overview <ArrowRight className="h-4 w-4" />
                  </Link>
                </p>
              </DocSection>

              <DocSection id="sdk" kicker="Products" title="Asilia SDK">
                <p>
                  The SDK is two packages with one job each. asilia-protocol is Asilia Protocol (ALP), the open,
                  typed contract. Capabilities register as Pydantic models across six kinds, an actor firewall
                  keeps the cognition brain from minting numbers or actuating, and JSONLogic pre and post
                  conditions ride with every capability. asilia-sdk ships the asilia CLI, which scaffolds,
                  builds, signs, and verifies the .asilia packages (container format v2, Ed25519) that carry
                  a capability from a publisher to a lab.
                </p>
                <p>
                  <Link to="/asilia/sdk" className="inline-flex items-center gap-1.5 text-white underline decoration-white/25 underline-offset-4 hover:decoration-white">
                    Read the SDK overview <ArrowRight className="h-4 w-4" />
                  </Link>
                </p>
              </DocSection>

              <DocSection id="api" kicker="Reference" title="API reference">
                <p className="text-white/50">
                  API access and supported interfaces depend on your pilot. Contact us to review the current
                  interface, integration requirements, and access arrangements.
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <Link
                    to="/contact?topic=partner"
                    className="inline-flex items-center gap-1.5 rounded-full bg-safety px-5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-safety/90"
                  >
                    Request access <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="/login"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Partner sign in <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </DocSection>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
