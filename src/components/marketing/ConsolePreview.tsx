import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/* Placeholder for the Asilia console. The old baked screenshot carried stale
   branding, so until a fresh on-brand capture exists we show a clean framed
   placeholder rather than a misleading image. */
export function ConsolePreview({ className, label = 'Asilia console' }: { className?: string; label?: string }) {
  return (
    <div
      className={cn(
        'relative aspect-[16/9] overflow-hidden rounded-2xl border border-line bg-panel',
        className,
      )}
    >
      {/* faint technical grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
        }}
      />
      <div className="absolute inset-0 grid place-items-center px-6 text-center">
        <div>
          <svg
            viewBox="0 0 4096 4096"
            className="mx-auto h-10 w-10 text-ink-faint"
            fill="currentColor"
            aria-hidden="true"
          >
            <rect x="327.68" y="1311.676" width="489.99" height="1472.647" />
            <rect x="817.67" y="819.009" width="2950.65" height="489.99" />
            <rect x="817.67" y="2787.001" width="2950.65" height="489.99" />
          </svg>
          <p className="mt-4 lab-label">{label}</p>
          <p className="mt-2 text-sm text-ink-muted">See the current interface in a walkthrough</p>
          <Link to="/contact?topic=demo" className="mt-4 inline-block text-sm text-safety underline underline-offset-4">Request a walkthrough</Link>
        </div>
      </div>
    </div>
  );
}
