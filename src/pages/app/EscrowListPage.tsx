import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Landmark, ChevronRight } from 'lucide-react';
import { listMyAgreements, type EscrowAgreement } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import {
  formatMoney,
  agreementBadgeVariant,
} from '@/pages/app/escrow/format';

export function EscrowListPage() {
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();

  const { data: agreements, isLoading } = useQuery({
    queryKey: ['agreements'],
    queryFn: listMyAgreements,
  });

  // Handle the Stripe redirect back from an escrow funding checkout.
  useEffect(() => {
    const checkout = params.get('checkout');
    if (!checkout) return;

    const next = new URLSearchParams(params);
    next.delete('checkout');

    if (checkout === 'success') {
      toast('Checkout returned. Payment status will update after confirmation.');
      const t = setTimeout(() => qc.invalidateQueries({ queryKey: ['agreements'] }), 1500);
      setParams(next, { replace: true });
      return () => clearTimeout(t);
    }
    if (checkout === 'cancel') {
      toast('Checkout canceled. Check your engagement for its current payment status.');
      setParams(next, { replace: true });
    }
  }, [params, setParams, qc]);

  return (
    <div className="space-y-8">
      <div className="border-b border-line pb-6">
        <p className="lab-label text-safety">ENGAGEMENT</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">Your engagement</h1>
        <p className="mt-1 text-ink-muted">
          Your design-partner pilot, funded by milestone. Payment is held securely and released
          to us only as each milestone is completed.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-px border border-line bg-line">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse bg-panel" />
          ))}
        </div>
      ) : agreements?.length ? (
        <ul className="border border-line">
          {agreements.map((a: EscrowAgreement) => (
            <li key={a.id} className="border-b border-line last:border-b-0">
              <Link
                to={`/app/escrow/${a.id}`}
                className="flex items-center justify-between gap-4 bg-surface px-5 py-4 transition-colors hover:bg-panel/60"
              >
                <div className="flex items-center gap-3">
                  <Landmark className="h-5 w-5 shrink-0 text-ink" strokeWidth={1.5} />
                  <div>
                    <p className="font-medium text-ink">{a.title}</p>
                    <p className="font-mono-tech text-[11px] text-ink-faint">
                      {formatMoney(a.total_amount_cents, a.currency)} ·{' '}
                      Created {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={agreementBadgeVariant(a.status)} className="capitalize">
                    {a.status}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-ink-faint" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border border-dashed border-line px-6 py-16 text-center">
          <Landmark className="mx-auto h-10 w-10 text-ink-faint" strokeWidth={1.3} />
          <p className="mt-4 font-display text-lg text-ink">Your pilot engagement isn’t set up yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">
            Once your onboarding call is done, our team scopes your milestones and your engagement
            appears here to fund. Questions in the meantime?{' '}
            <Link to="/contact?topic=partner" className="text-safety hover:underline">Get in touch</Link>.
          </p>
        </div>
      )}
    </div>
  );
}
