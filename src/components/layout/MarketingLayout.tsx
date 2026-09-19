import { Suspense, lazy, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { GrainOverlay } from '@/components/effects';
import { SmoothScroll } from '@/components/motion';
import { SiteHeader } from './SiteHeader';
import { NewsletterStatus } from '@/components/marketing/NewsletterStatus';
import { SiteFooter } from './SiteFooter';

const CommandMenu = lazy(() =>
  import('@/components/marketing/CommandMenu').then((module) => ({ default: module.CommandMenu })),
);
const COMMAND_EVENT = 'contineon:command';

/** Keep cmdk/Radix dialog code off the startup path. This tiny listener retains
 * the same keyboard and custom-event entry points, then the loaded menu owns
 * those listeners from that point onward. */
function DeferredCommandMenu() {
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (requested) return;

    const onKey = (event: KeyboardEvent) => {
      if ((event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setRequested(true);
      }
    };
    const onEvent = () => setRequested(true);

    document.addEventListener('keydown', onKey);
    window.addEventListener(COMMAND_EVENT, onEvent);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener(COMMAND_EVENT, onEvent);
    };
  }, [requested]);

  if (!requested) return null;

  return (
    <Suspense fallback={null}>
      <CommandMenu initiallyOpen />
    </Suspense>
  );
}

/** Public marketing shell: paper grain, header, page content, footer. */
export function MarketingLayout() {
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
    <div className="relative min-h-screen bg-paper text-ink">
      <SmoothScroll />
      <GrainOverlay />
      <DeferredCommandMenu />
      <SiteHeader />
      <NewsletterStatus />
      <main className="relative">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
