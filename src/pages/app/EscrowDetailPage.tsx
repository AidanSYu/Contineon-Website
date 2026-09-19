import { flags } from '@/lib/flags';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import { getAgreement, startEscrowCheckout, type EscrowMilestone } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';
import {
  formatMoney,
  agreementBadgeVariant,
  milestoneBadgeVariant,
  milestoneProgress,
  engagementStatusCopy,
} from '@/pages/app/escrow/format';

export function EscrowDetailPage() {
  const { id = '' } = useParams();
  const [funding, setFunding] = useState(false);

  const { data: agreement, isLoading } = useQuery({
    queryKey: ['agreement', id],
    queryFn: () => getAgreement(id),
    enabled: !!id,
  });

  const handleFund = async () => {
    setFunding(true);
    try {
      const url = await startEscrowCheckout(id);
      window.location.assign(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not start funding.');
      setFunding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-6 w-6 text-safety" />
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="space-y-6">
        <Link
          to="/app/escrow"
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Back to your engagement
        </Link>
        <div className="border border-dashed border-line px-6 py-16 text-center">
          <p className="font-display text-lg text-ink">Agreement not found</p>
          <p className="mt-1 text-sm text-ink-muted">
            It may have been removed, or you don’t have access to it.
          </p>
        </div>
      </div>
    );
  }

  const milestones = agreement.milestones;
  // The customer can fund once the admin finalizes the agreement to 'pending'.
  // A 'draft' is still being edited and create-escrow-payment rejects it (409).
  const canFund = flags.payments && agreement.status === 'pending';
  const { done, total } = milestoneProgress(milestones);
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/app/escrow"
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Back to your engagement
        </Link>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="lab-label text-safety">PILOT ENGAGEMENT</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
            {agreement.title}
          </h1>
          {agreement.description && (
            <p className="mt-1 max-w-2xl text-ink-muted">{agreement.description}</p>
          )}
          <p className="mt-2 font-mono-tech text-[11px] text-ink-faint">
            Total {formatMoney(agreement.total_amount_cents, agreement.currency)} ·{' '}
            Created {new Date(agreement.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <Badge variant={agreementBadgeVariant(agreement.status)} className="capitalize">
            {agreement.status}
          </Badge>
          {!flags.payments && agreement.status === 'pending' && (
            <p className="max-w-sm text-right text-sm text-ink-muted">Online payments are not available. Contact the team about your engagement.</p>
          )}
          {canFund && (
            <Button
              onClick={handleFund}
              disabled={funding}
              className="bg-safety text-white hover:bg-safety/90"
            >
              {funding ? 'Redirecting…' : 'Fund engagement'}
            </Button>
          )}
        </div>
      </div>

      {/* Engagement status + milestone progress */}
      <div className="rounded-lg border border-line bg-surface p-5">
        <p className="text-sm text-ink-muted">{engagementStatusCopy(agreement.status)}</p>
        {total > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between font-mono-tech text-[11px] uppercase tracking-[0.14em] text-ink-faint">
              <span>Milestone progress</span>
              <span>{done} of {total} settled</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-safety transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </div>

      <div>
        <p className="lab-label mb-3">Milestones</p>
        {milestones.length ? (
          <div className="border border-line bg-surface">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Milestone</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Resolved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {milestones.map((m: EscrowMilestone) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium text-ink">{m.title}</TableCell>
                    <TableCell className="font-mono-tech text-ink-muted">
                      {formatMoney(m.amount_cents, agreement.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={milestoneBadgeVariant(m.status)} className="capitalize">
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-ink-muted">
                      {m.status === 'released' && m.released_at ? (
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <CheckCircle2 className="h-3.5 w-3.5 text-safety" />
                          {new Date(m.released_at).toLocaleDateString()}
                        </span>
                      ) : m.status === 'refunded' && m.refunded_at ? (
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <RotateCcw className="h-3.5 w-3.5 text-destructive" />
                          {new Date(m.refunded_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-ink-faint">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="border border-dashed border-line px-6 py-12 text-center text-sm text-ink-muted">
            No milestones have been defined for this agreement yet.
          </div>
        )}
      </div>
    </div>
  );
}
