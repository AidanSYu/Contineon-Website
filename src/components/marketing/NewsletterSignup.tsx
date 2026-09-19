import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, MailCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Turnstile } from '@/components/Turnstile';
import { subscribe } from '@/lib/api/subscribers';
import { subscribeSchema } from '@/lib/validation';
import { flags } from '@/lib/flags';
import { isBackendConfigured } from '@/lib/backendConfig';
import { legal } from '@/config/legal';
import { cn } from '@/lib/utils';

const turnstileEnabled = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);

/* =============================================================================
   NewsletterSignup, lightweight double-opt-in capture for visitors who aren't
   ready to start a trial. Wires the existing `subscribe()` API + newsletter
   Edge Function. `source` tags where the signup came from for attribution.
   ============================================================================= */

export function NewsletterSignup({ source = 'footer', className }: { source?: string; className?: string }) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [done, setDone] = useState<'confirmed' | 'pending' | null>(null);
  const [verificationAttempt, setVerificationAttempt] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = subscribeSchema.safeParse({ email, source, turnstileToken: token });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Enter a valid email.');
      return;
    }
    if (turnstileEnabled && !token) {
      toast.error('Please complete the verification challenge.');
      return;
    }

    setIsPending(true);
    try {
      const result = await subscribe({ email, source, turnstileToken: token });
      setDone(result.alreadyConfirmed ? 'confirmed' : 'pending');
      setEmail('');
      setToken('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not subscribe. Please try again.');
    } finally {
      setIsPending(false);
      setToken('');
      setVerificationAttempt((attempt) => attempt + 1);
    }
  };

  if (!flags.newsletter || !isBackendConfigured) {
    return <p className={cn('text-sm text-ink-muted', className)}>Follow our <a href="/news" className="text-safety hover:underline">news</a> for updates, or <a href={`mailto:${legal.contactEmail}`} className="text-safety hover:underline">contact the team</a>.</p>;
  }

  if (done) {
    return (
      <div role="status" className={cn('flex items-start gap-2.5 text-sm text-ink-muted', className)}>
        <MailCheck className="mt-0.5 h-4 w-4 flex-none text-safety" strokeWidth={1.75} />
        <span>
          {done === 'confirmed' ? 'You’re already subscribed. Thank you for following along.' : 'Check your inbox and click the link to confirm your subscription.'}
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn('w-full', className)} noValidate>
      <div className="flex gap-2">
        <Input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@lab.org"
          aria-label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10"
        />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 flex-none items-center gap-1.5 rounded bg-ink px-4 text-sm font-medium text-paper transition-colors hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? 'Joining…' : (<>Join <ArrowRight className="h-4 w-4" /></>)}
        </button>
      </div>
      {turnstileEnabled && <Turnstile key={verificationAttempt} onToken={setToken} className="pt-3" />}
      <p className="mt-3 text-xs leading-relaxed text-ink-muted">
        By joining, you request occasional Contineon updates. Confirm by email; unsubscribe by
        emailing us at any time. <a href="/privacy" className="text-safety hover:underline">Privacy Notice</a>.
      </p>
    </form>
  );
}
