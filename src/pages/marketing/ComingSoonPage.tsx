import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Seo } from '@/components/Seo';

export function ComingSoonPage({
  title,
  kicker = 'TECHNOLOGY',
  description,
}: {
  title: string;
  kicker?: string;
  description: string;
}) {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-[78svh] items-center px-[5vw] pb-28 pt-40 lg:px-8">
      <Seo title={`${title}, Contineon`} description={description} path={pathname} />

      <div className="mx-auto max-w-2xl text-center">
        <p className="lab-label text-safety">{kicker}</p>
        <h1 className="mt-5 font-display text-[clamp(38px,6.4vw,110px)] font-bold leading-[1.02] tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-ink-muted">{description}</p>

        <div className="mx-auto mt-9 flex items-center justify-center gap-2.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-safety" />
          <span className="lab-label text-ink-faint">Research direction</span>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-ink-muted">
          {pathname.endsWith('foundation-models')
            ? 'We are exploring models that connect experimental planning with observations from physical systems. Evaluation needs to account for uncertainty, reproducibility, and the limits of each instrument.'
            : 'We are exploring how systems can propose questions, choose experiments, and revise hypotheses while keeping scientists responsible for safety and interpretation.'}
          {' '}This is a research direction, not a released product. We have no public release date or benchmark announcement for this work.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 rounded-full bg-safety px-5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-safety/90"
          >
            Discuss the research <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-hairline-strong px-5 py-2.5 text-[15px] font-medium text-ink transition-colors hover:bg-panel"
          >
            <ArrowLeft className="h-4 w-4" /> Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
