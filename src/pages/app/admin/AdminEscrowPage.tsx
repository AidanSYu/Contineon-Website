import { flags } from '@/lib/flags';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, ShieldCheck, X } from 'lucide-react';
import {
  listAllAgreements,
  getAgreement,
  createAgreement,
  releaseMilestone,
  refundMilestone,
  findUsers,
  resolveUsers,
  type EscrowAgreement,
  type EscrowMilestone,
  type CreateAgreementInput,
  type AdminUser,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  formatMoney,
  agreementBadgeVariant,
  milestoneBadgeVariant,
} from '@/pages/app/escrow/format';

type DraftMilestone = { title: string; amount: string };

/** Parse a "$1,250.00" / "1250.5" style dollar string into integer cents. */
function dollarsToCents(value: string): number {
  const n = Number.parseFloat(value.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(n)) return NaN;
  return Math.round(n * 100);
}

export function AdminEscrowPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const [customer, setCustomer] = useState<AdminUser | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('usd');
  const [milestones, setMilestones] = useState<DraftMilestone[]>([{ title: '', amount: '' }]);

  const { data: agreements, isLoading } = useQuery({
    queryKey: ['admin-agreements'],
    queryFn: listAllAgreements,
  });

  // Resolve customer emails for the listed agreements (admin-only lookup).
  const customerIds = useMemo(
    () => [...new Set((agreements ?? []).map((a) => a.user_id))],
    [agreements],
  );
  const { data: customerUsers } = useQuery({
    queryKey: ['admin-user-map', customerIds],
    queryFn: () => resolveUsers(customerIds),
    enabled: customerIds.length > 0,
  });
  const emailById = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of customerUsers ?? []) m.set(u.id, u.email);
    return m;
  }, [customerUsers]);

  const resetForm = () => {
    setCustomer(null);
    setTitle('');
    setDescription('');
    setCurrency('usd');
    setMilestones([{ title: '', amount: '' }]);
  };

  const createMut = useMutation({
    mutationFn: () => {
      const input: CreateAgreementInput = {
        user_id: customer?.id ?? '',
        title: title.trim(),
        currency: currency.trim().toLowerCase() || 'usd',
        milestones: milestones.map((m, i) => ({
          title: m.title.trim(),
          amount_cents: dollarsToCents(m.amount),
          sort_order: i,
        })),
      };
      const desc = description.trim();
      if (desc) input.description = desc;
      return createAgreement(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-agreements'] });
      toast.success('Agreement created.');
      resetForm();
      setOpen(false);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : 'Could not create agreement.'),
  });

  // Live total from the milestone drafts, for operator feedback.
  const draftTotalCents = useMemo(
    () => milestones.reduce((sum, m) => sum + (dollarsToCents(m.amount) || 0), 0),
    [milestones],
  );

  const milestonesValid = milestones.every(
    (m) => m.title.trim() && Number.isFinite(dollarsToCents(m.amount)) && dollarsToCents(m.amount) > 0,
  );
  const canCreate = !!customer && !!title.trim() && milestones.length > 0 && milestonesValid;

  const updateMilestone = (idx: number, patch: Partial<DraftMilestone>) =>
    setMilestones((prev) => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="lab-label text-safety">ADMIN · ENGAGEMENTS</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
            Pilot engagements
          </h1>
          <p className="mt-1 text-ink-muted">
            {flags.payments ? 'Create agreements, then release or refund milestones once work is verified.' : 'New paid engagements are closed. Existing engagements can still be reviewed and refunded.'}
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button disabled={!flags.payments} className="bg-safety text-white hover:bg-safety/90">
              <Plus className="mr-2 h-4 w-4" /> New agreement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create a pilot agreement</DialogTitle>
              <DialogDescription>
                Assign it to a customer and define the milestones that release the held funds.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="lab-label">Customer</label>
                <CustomerPicker value={customer} onChange={setCustomer} />
              </div>
              <div className="space-y-1.5">
                <label className="lab-label">Title</label>
                <Input
                  placeholder="e.g. ASILIA integration, Phase 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="lab-label">Description (optional)</label>
                <Textarea
                  placeholder="Scope and terms of the agreement."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="lab-label">Currency</label>
                <Input
                  className="w-32 uppercase"
                  maxLength={3}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="lab-label">Milestones</label>
                  <span className="font-mono-tech text-[11px] text-ink-faint">
                    Total {formatMoney(draftTotalCents, currency)}
                  </span>
                </div>
                <div className="space-y-2">
                  {milestones.map((m, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Input
                        className="flex-1"
                        placeholder={`Milestone ${i + 1} title`}
                        value={m.title}
                        onChange={(e) => updateMilestone(i, { title: e.target.value })}
                      />
                      <Input
                        className="w-28"
                        inputMode="decimal"
                        placeholder="Amount"
                        value={m.amount}
                        onChange={(e) => updateMilestone(i, { amount: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setMilestones((prev) =>
                            prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev,
                          )
                        }
                        disabled={milestones.length === 1}
                        className="mt-1 rounded-md p-2 text-ink-faint transition-colors hover:bg-panel hover:text-safety disabled:opacity-40"
                        aria-label={`Remove milestone ${i + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMilestones((prev) => [...prev, { title: '', amount: '' }])}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add milestone
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() => createMut.mutate()}
                disabled={!canCreate || createMut.isPending}
                className="bg-safety text-white hover:bg-safety/90"
              >
                {createMut.isPending ? 'Creating…' : 'Create agreement'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner className="h-6 w-6 text-safety" />
        </div>
      ) : agreements?.length ? (
        <div className="space-y-6">
          {agreements.map((a) => (
            <AgreementCard key={a.id} agreement={a} customerEmail={emailById.get(a.user_id)} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-line px-6 py-16 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-ink-faint" strokeWidth={1.3} />
          <p className="mt-4 font-display text-lg text-ink">No agreements yet</p>
          <p className="mt-1 text-sm text-ink-muted">
            Pilot agreements will appear here once created.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Search-and-select a customer by email or name to assign an agreement to.
 * Backed by the admin-only find_users endpoint (emails live in auth.users).
 */
function CustomerPicker({
  value,
  onChange,
}: {
  value: AdminUser | null;
  onChange: (u: AdminUser | null) => void;
}) {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  const { data: results, isFetching } = useQuery({
    queryKey: ['admin-user-search', debounced],
    queryFn: () => findUsers(debounced),
    enabled: debounced.length >= 2 && !value,
  });

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-md border border-line bg-panel px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm text-ink">{value.full_name || value.email}</p>
          {value.full_name && (
            <p className="truncate font-mono-tech text-[11px] text-ink-faint">{value.email}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="ml-2 shrink-0 text-ink-faint transition-colors hover:text-safety"
          aria-label="Clear customer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Input
        placeholder="Search by email or name…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {debounced.length >= 2 && (
        <div className="max-h-44 overflow-y-auto rounded-md border border-line">
          {isFetching ? (
            <p className="px-3 py-2 text-sm text-ink-faint">Searching…</p>
          ) : results?.length ? (
            results.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => onChange(u)}
                className="flex w-full flex-col items-start gap-0.5 border-b border-line px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-panel"
              >
                <span className="text-sm text-ink">{u.full_name || '—'}</span>
                <span className="font-mono-tech text-[11px] text-ink-faint">{u.email}</span>
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-ink-faint">No matches.</p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * One agreement plus its milestones (loaded via getAgreement, which RLS lets
 * admins read for any user) with release/refund controls. Mutations invalidate
 * both this agreement and the admin list so statuses refresh everywhere.
 */
function AgreementCard({
  agreement,
  customerEmail,
}: {
  agreement: EscrowAgreement;
  customerEmail?: string;
}) {
  const qc = useQueryClient();

  const { data: full, isLoading } = useQuery({
    queryKey: ['agreement', agreement.id],
    queryFn: () => getAgreement(agreement.id),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['agreement', agreement.id] });
    qc.invalidateQueries({ queryKey: ['admin-agreements'] });
  };

  const releaseMut = useMutation({
    mutationFn: (milestoneId: string) => releaseMilestone(milestoneId),
    onSuccess: () => {
      invalidate();
      toast.success('Milestone released.');
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : 'Could not release milestone.'),
  });

  const refundMut = useMutation({
    mutationFn: (milestoneId: string) => refundMilestone(milestoneId),
    onSuccess: () => {
      invalidate();
      toast.success('Milestone refunded.');
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : 'Could not refund milestone.'),
  });

  const mutating = releaseMut.isPending || refundMut.isPending;
  const milestones = full?.milestones ?? [];

  return (
    <div className="border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <p className="font-medium text-ink">{agreement.title}</p>
          <p className="font-mono-tech text-[11px] text-ink-faint">
            {formatMoney(agreement.total_amount_cents, agreement.currency)} ·{' '}
            {customerEmail ?? `user ${agreement.user_id}`}
          </p>
        </div>
        <Badge variant={agreementBadgeVariant(agreement.status)} className="capitalize">
          {agreement.status}
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center px-5 py-6">
          <Spinner className="h-5 w-5 text-safety" />
        </div>
      ) : milestones.length ? (
        <ul className="divide-y divide-line">
          {milestones.map((m: EscrowMilestone) => {
            const actionable = m.status === 'funded';
            return (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={milestoneBadgeVariant(m.status)} className="capitalize">
                    {m.status}
                  </Badge>
                  <span className="text-sm text-ink">{m.title}</span>
                  <span className="font-mono-tech text-[11px] text-ink-faint">
                    {formatMoney(m.amount_cents, agreement.currency)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!actionable || mutating}
                    onClick={() => releaseMut.mutate(m.id)}
                  >
                    Release
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!actionable || mutating}
                    onClick={() => refundMut.mutate(m.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    Refund
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-5 py-3 text-sm text-ink-muted">No milestones.</p>
      )}
    </div>
  );
}
