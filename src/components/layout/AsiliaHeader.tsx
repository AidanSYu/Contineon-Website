import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Boxes, Code2, type LucideIcon } from 'lucide-react';
import { Logo } from './Logo';
import { AsiliaLogo } from './AsiliaLogo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* Asilia's own chrome — a separate top bar from the marketing SiteHeader, the way
   antigravity.google stands apart from google.com. Left lockup: the Contineon
   mark returns to the main site, the Asilia mark returns to this site's root. The
   center nav carries a Products mega-menu (Framework + SDK), everything dark
   because Asilia is all obsidian. */

type Product = { label: string; desc: string; to: string; icon: LucideIcon };
type AsiliaNavLink = { label: string; to: string };

const PRODUCTS: Product[] = [
  {
    label: 'Asilia Framework',
    desc: 'The autonomous lab system. Runs the full loop on the instruments you already own.',
    to: '/asilia/framework',
    icon: Boxes,
  },
  {
    label: 'Asilia SDK',
    desc: 'The developer toolkit. Build, extend, and automate your lab as code.',
    to: '/asilia/sdk',
    icon: Code2,
  },
];

const NAV: AsiliaNavLink[] = [
  { label: 'Docs', to: '/asilia/docs' },
  { label: 'News', to: '/asilia/news' },
];

export function AsiliaHeader() {
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

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setOpen(false);
    setMenu(null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pathname]);

  const openMenu = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenu(label);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(null), 120);
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-[100] transition-colors duration-300',
        scrolled || open || menu
          ? 'border-b border-white/10 bg-[#06080B]/95'
          : 'border-b border-transparent bg-transparent',
      )}
      onMouseLeave={scheduleClose}
    >
      <div className="site-shell flex h-16 items-center justify-between">
        {/* Lockup: Contineon mark → main site · Asilia mark + wordmark → this root. */}
        <div className="flex items-center gap-3">
          {/* Same 19px as SiteHeader so the mark is identical in both chromes. */}
          <Logo revealWordmark className="text-[19px] text-white" />
          <span aria-hidden="true" className="h-4 w-px bg-white/20" />
          <Link
            to="/asilia"
            className="flex items-center gap-1.5 text-white transition-opacity hover:opacity-70"
          >
            <AsiliaLogo className="text-[19px] text-white" />
            <span className="text-[17px] font-semibold tracking-tight">Asilia</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <div
            className="relative"
            onMouseEnter={() => openMenu('Products')}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={menu === 'Products'}
              onClick={() => setMenu((m) => (m === 'Products' ? null : 'Products'))}
              className="flex items-center gap-1 rounded-md px-3 py-2 text-[15px] text-white/80 transition-colors hover:text-white"
            >
              Products
              <ChevronDown
                className={cn('h-3.5 w-3.5 transition-transform', menu === 'Products' && 'rotate-180')}
              />
            </button>
            {menu === 'Products' && (
              <div
                className="absolute left-0 top-[calc(100%+8px)] w-[380px] overflow-hidden rounded-2xl border border-white/10 bg-[#0A0D12] p-2 shadow-lab"
                onMouseEnter={() => openMenu('Products')}
              >
                {PRODUCTS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <Link
                      key={p.label}
                      to={p.to}
                      className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-white/5"
                    >
                      <span className="mt-0.5 rounded-lg bg-white/5 p-2 text-safety">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="block">
                        <span className="block text-[14px] font-semibold text-white">{p.label}</span>
                        <span className="mt-0.5 block text-[12.5px] leading-snug text-white/50">
                          {p.desc}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="rounded-md px-3 py-2 text-[15px] text-white/80 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1.5 md:flex">
          <Button asChild size="sm" className="bg-safety text-white hover:bg-safety/90">
            <Link to="/contact?topic=partner">Request access</Link>
          </Button>
        </div>

        <button
          className="text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/10 bg-[#06080B]/97 px-[5vw] py-6 md:hidden">
          <nav className="flex flex-col gap-1">
            <div className="py-2">
              <span className="lab-label text-white/45">Products</span>
              <div className="mt-2 flex flex-col gap-1">
                {PRODUCTS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <Link
                      key={p.label}
                      to={p.to}
                      className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-[15px] text-white/80 hover:bg-white/5 hover:text-white"
                    >
                      <Icon className="h-4 w-4 text-safety" />
                      {p.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="rounded-lg px-2 py-2.5 text-[15px] text-white/80 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 border-t border-white/10 pt-4">
              <Button asChild className="w-full bg-safety text-white hover:bg-safety/90">
                <Link to="/contact?topic=partner">Request access</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
