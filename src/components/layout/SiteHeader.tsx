import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ArrowUpRight } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

type NavLink = { label: string; to: string; desc?: string };
type NavEntry = {
  label: string;
  to?: string;
  href?: string;
  external?: boolean;
  items?: NavLink[];
};

// Technology is the forward-looking research surface — foundational modeling and
// the work that diverges from the Asilia product. Asilia is its own destination
// (top-level nav → /asilia), kept separate the way antigravity.google stands apart
// from google.com. It will move to its own subdomain later.
const TECHNOLOGY: NavLink[] = [
  { label: 'Foundation Models', desc: 'Research direction', to: '/technology/foundation-models' },
  { label: 'Autonomous Discovery', desc: 'Research direction', to: '/technology/autonomous-discovery' },
];

const COMPANY: NavLink[] = [
  { label: 'Mission', desc: 'Why we exist', to: '/mission' },
  { label: 'Careers', desc: 'Build with us', to: '/contact?topic=careers' },
  { label: 'Security', desc: 'Trust & infrastructure', to: '/security' },
  { label: 'Contact', desc: 'Talk to us', to: '/contact' },
];

const NAV: NavEntry[] = [
  { label: 'Asilia', to: '/asilia' },
  { label: 'Technology', items: TECHNOLOGY },
  { label: 'About', items: COMPANY },
  { label: 'News', to: '/news' },
];

/** Routes whose hero is a full-bleed dark section under the transparent header.
    /asilia is absent: it renders its own chrome (AsiliaHeader), never this one. */
const DARK_HERO_ROUTES = new Set(['/', '/mission']);

export function SiteHeader() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(() =>
    typeof window === 'undefined' ? false : window.scrollY > 24,
  );
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let wasScrolled = window.scrollY > 24;
    const onScroll = () => {
      const isScrolled = window.scrollY > 24;
      if (isScrolled === wasScrolled) return;
      wasScrolled = isScrolled;
      setScrolled(isScrolled);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Collapse any open menu when the route changes. This intentionally syncs
  // local UI state to router navigation — the canonical reset-on-location case.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setOpen(false);
    setMenu(null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pathname]);

  /* Dark routes keep dark chrome even after scroll — a light paper bar sliding
     over an all-obsidian page reads as a glitch, not a header. */
  const darkChrome = DARK_HERO_ROUTES.has(pathname);
  const darkTop = darkChrome;

  const openMenu = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenu(label);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(null), 120);
  };

  const linkBase = cn(
    'text-[15px] transition-colors',
    darkTop ? 'text-white/80 hover:text-white' : 'text-ink-muted hover:text-ink',
  );

  const renderLeaf = (item: NavEntry) =>
    item.external ? (
      <a
        key={item.label}
        href={item.href}
        target="_blank"
        rel="noreferrer"
        className={cn('flex items-center gap-1 rounded-md px-3 py-2', linkBase)}
      >
        {item.label}
        <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
      </a>
    ) : (
      <Link key={item.label} to={item.to!} className={cn('rounded-md px-3 py-2', linkBase)}>
        {item.label}
      </Link>
    );

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-[100] transition-colors duration-300',
        scrolled
          ? darkChrome
            ? 'border-b border-white/10 bg-[#06080B]/95'
            : 'border-b border-line bg-[hsl(var(--background)/0.96)]'
          : 'border-b border-transparent bg-transparent',
      )}
      onMouseLeave={scheduleClose}
    >
      <div className="site-shell flex h-16 items-center justify-between">
        <Logo className={cn('text-[19px]', darkTop && 'text-white')} />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) =>
            item.items ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => openMenu(item.label)}
                onMouseLeave={scheduleClose}
              >
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={menu === item.label}
                  onClick={() => setMenu((m) => (m === item.label ? null : item.label))}
                  className={cn('flex items-center gap-1 rounded-md px-3 py-2', linkBase)}
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 transition-transform',
                      menu === item.label && 'rotate-180',
                    )}
                  />
                </button>
                {menu === item.label && (
                  <div
                    className={cn(
                      'absolute left-0 top-[calc(100%+6px)] w-64 overflow-hidden rounded-xl border p-1.5 shadow-lab',
                      darkChrome ? 'border-white/10 bg-[#0A0D12]' : 'border-line bg-surface',
                    )}
                    onMouseEnter={() => openMenu(item.label)}
                  >
                    {item.items.map((sub) => (
                      <Link
                        key={sub.label}
                        to={sub.to}
                        className={cn(
                          'block rounded-lg px-3 py-2.5 transition-colors',
                          darkChrome ? 'hover:bg-white/5' : 'hover:bg-panel',
                        )}
                      >
                        <span
                          className={cn(
                            'block text-[14px] font-medium',
                            darkChrome ? 'text-white' : 'text-ink',
                          )}
                        >
                          {sub.label}
                        </span>
                        {sub.desc && (
                          <span
                            className={cn(
                              'mt-0.5 block text-[12.5px]',
                              darkChrome ? 'text-white/50' : 'text-ink-faint',
                            )}
                          >
                            {sub.desc}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              renderLeaf(item)
            ),
          )}
        </nav>

        <div className="hidden items-center gap-1.5 md:flex">
          {user ? (
            <Button asChild size="sm" className="bg-safety text-white hover:bg-safety/90">
              <Link to="/app">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  darkTop
                    ? 'text-white/80 hover:bg-white/10 hover:text-white'
                    : 'text-ink-muted hover:text-ink',
                )}
              >
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="bg-safety text-white hover:bg-safety/90">
                <Link to="/contact?topic=partner">Request access</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className={cn('md:hidden', darkTop ? 'text-white' : 'text-ink')}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div
          className={cn(
            'max-h-[calc(100vh-4rem)] overflow-y-auto border-t px-[5vw] py-6 md:hidden',
            darkChrome
              ? 'border-white/10 bg-[#06080B]/97'
              : 'border-line bg-[hsl(var(--background)/0.97)]',
          )}
        >
          <nav className="flex flex-col gap-1">
            {NAV.map((item) =>
              item.items ? (
                <div key={item.label} className="py-2">
                  <span className={cn('lab-label', darkChrome && 'text-white/45')}>{item.label}</span>
                  <div className="mt-2 flex flex-col gap-1">
                    {item.items.map((sub) => (
                      <Link
                        key={sub.label}
                        to={sub.to}
                        className={cn(
                          'rounded-lg px-2 py-2 text-[15px]',
                          darkChrome
                            ? 'text-white/80 hover:bg-white/5 hover:text-white'
                            : 'text-ink-muted hover:bg-panel hover:text-ink',
                        )}
                      >
                        {sub.label}
                        {sub.desc && (
                          <span
                            className={cn(
                              'ml-2 text-[12.5px]',
                              darkChrome ? 'text-white/40' : 'text-ink-faint',
                            )}
                          >
                            {sub.desc}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-2 py-2.5 text-[15px]',
                    darkChrome
                      ? 'text-white/80 hover:bg-white/5 hover:text-white'
                      : 'text-ink-muted hover:bg-panel hover:text-ink',
                  )}
                >
                  {item.label}
                  <ArrowUpRight className="h-4 w-4 opacity-60" />
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.to!}
                  className={cn(
                    'rounded-lg px-2 py-2.5 text-[15px]',
                    darkChrome
                      ? 'text-white/80 hover:bg-white/5 hover:text-white'
                      : 'text-ink-muted hover:bg-panel hover:text-ink',
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
            <div
              className={cn(
                'mt-3 flex flex-col gap-2 border-t pt-4',
                darkChrome ? 'border-white/10' : 'border-line',
              )}
            >
              {user ? (
                <Button asChild className="bg-safety text-white hover:bg-safety/90">
                  <Link to="/app">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className={cn(
                      darkChrome && 'border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <Link to="/login">Sign in</Link>
                  </Button>
                  <Button asChild className="bg-safety text-white hover:bg-safety/90">
                    <Link to="/contact?topic=partner">Request access</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
