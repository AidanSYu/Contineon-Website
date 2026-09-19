import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { legal } from '@/config/legal';
import { Logo } from './Logo';
import { NewsletterSignup } from '@/components/marketing/NewsletterSignup';

type FooterLink = { label: string; href: string; external?: boolean };

const COLS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Explore',
    links: [
      { label: 'Asilia', href: '/asilia' },
      { label: 'Foundation Models', href: '/technology/foundation-models' },
      { label: 'Autonomous Discovery', href: '/technology/autonomous-discovery' },
      { label: 'News', href: '/news' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Mission', href: '/mission' },
      { label: 'Careers', href: '/contact?topic=careers' },
      { label: 'Security', href: '/security' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Docs', href: '/docs' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Request access', href: '/contact?topic=partner' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-line bg-paper">
      <div className="site-shell grid gap-10 py-16 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr] lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo className="text-[19px]" />
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            We’re building Asilia: an autonomous research system for the instruments
            your lab already has.
          </p>

          <div className="mt-6">
            <h4 className="lab-label">Get launch updates</h4>
            <p className="mb-3 mt-2 text-sm text-ink-muted">
              Occasional updates on Asilia and our research.
            </p>
            <NewsletterSignup source="footer" />
          </div>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="lab-label">{col.title}</h4>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) =>
                l.external ? (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      {l.label}
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                    </a>
                  </li>
                ) : (
                  <li key={l.label}>
                    <Link
                      to={l.href}
                      className="text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="site-shell flex flex-col items-center justify-between gap-3 py-6 lab-label sm:flex-row">
          <span>© {new Date().getFullYear()} Contineon</span>
          <span className="max-w-md text-center sm:text-right">{legal.status}</span>
        </div>
      </div>
    </footer>
  );
}
