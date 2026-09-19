import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { SmoothScroll } from '@/components/motion';
import { AsiliaHeader } from './AsiliaHeader';

/* Standalone shell for the Asilia product site. Everything under /asilia renders
   here — its own header, footer, and dark ground — with none of the marketing
   chrome. When asilia.contineon.com goes live, this whole route tree lifts to the
   subdomain and /asilia becomes a 301. */

export function AsiliaLayout() {
  const { pathname, hash } = useLocation();

  // Scroll to top on navigation, or to a #section when a hash is present.
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);

  return (
    <div className="dark relative min-h-screen bg-[#06080B] text-ink">
      {/* No GrainOverlay: it's a light-mode paper grain (fixed, z-9999) that
          switches to a screen blend under .dark and speckles the obsidian UI. */}
      <SmoothScroll />
      <AsiliaHeader />
      <main className="relative">
        <Outlet />
      </main>
      <AsiliaFooter />
    </div>
  );
}

function AsiliaFooter() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="site-shell flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-[13px] text-white/40">
          © {new Date().getFullYear()} Contineon. An independent project in development.
        </p>
        <nav className="flex items-center gap-5 text-[13px] text-white/50">
          <Link to="/" className="transition-colors hover:text-white">
            Contineon
          </Link>
          <Link to="/contact" className="transition-colors hover:text-white">
            Contact
          </Link>
          <Link to="/terms" className="transition-colors hover:text-white">
            Terms
          </Link>
          <Link to="/privacy" className="transition-colors hover:text-white">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
