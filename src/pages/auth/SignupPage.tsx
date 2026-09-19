import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { MailCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Turnstile } from '@/components/Turnstile';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { signupSchema, type SignupInput } from '@/lib/validation';

/** localStorage key the billing page reads to resume a plan chosen pre-signup. */
export const PENDING_PLAN_KEY = 'contineon.pendingPlan';

const turnstileEnabled = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);

export function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const plan = params.get('plan');
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (turnstileEnabled && !captchaToken) {
      toast.error('Please complete the verification challenge.');
      return;
    }
    try {
      await (captchaToken
        ? signUp(values.email, values.password, values.fullName, captchaToken)
        : signUp(values.email, values.password, values.fullName));
      if (plan) localStorage.setItem(PENDING_PLAN_KEY, plan);

      // If email confirmation is OFF, a session exists immediately → go to app.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/app', { replace: true });
        return;
      }
      // Otherwise prompt the user to confirm via email.
      setSubmittedEmail(values.email);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create your account.');
    }
  });

  if (submittedEmail) {
    return (
      <div className="border border-line bg-surface p-8 text-center shadow-lab">
        <MailCheck className="mx-auto h-10 w-10 text-safety" strokeWidth={1.5} />
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink">Confirm your email</h1>
        <p className="mt-2 text-sm text-ink-muted">
          We sent a confirmation link to{' '}
          <span className="text-ink">{submittedEmail}</span>. Click it to
          activate your account, then sign in to access your pilot.
        </p>
        <Button asChild className="mt-6 w-full bg-safety text-white hover:bg-safety/90">
          <Link to="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="border border-line bg-surface p-8 shadow-lab">
      <h1 className="font-display text-2xl font-extrabold uppercase leading-tight tracking-tight text-ink">Create your account</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Set up your Contineon account to access your design-partner pilot.{' '}
        Not a partner yet?{' '}
        <Link to="/contact?topic=partner" className="text-safety hover:underline">Apply for access</Link>.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <Label htmlFor="fullName" className="mb-2 block text-ink-muted">Full name</Label>
          <Input id="fullName" autoComplete="name" {...register('fullName')} aria-invalid={Boolean(errors.fullName)} />
          {errors.fullName && <p className="mt-1.5 text-xs text-safety">{errors.fullName.message}</p>}
        </div>
        <div>
          <Label htmlFor="email" className="mb-2 block text-ink-muted">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register('email')} aria-invalid={Boolean(errors.email)} />
          {errors.email && <p className="mt-1.5 text-xs text-safety">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="password" className="mb-2 block text-ink-muted">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register('password')} aria-invalid={Boolean(errors.password)} />
          {errors.password && <p className="mt-1.5 text-xs text-safety">{errors.password.message}</p>}
        </div>

        {turnstileEnabled && <Turnstile onToken={setCaptchaToken} className="pt-1" />}

        <Button type="submit" disabled={isSubmitting} className="w-full bg-safety text-white hover:bg-safety/90">
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-safety hover:underline">Sign in</Link>
      </p>
      <p className="mt-4 text-center text-xs text-ink-faint">
        By continuing you agree to our{' '}
        <Link to="/terms" className="hover:text-ink hover:underline">Terms</Link> and{' '}
        <Link to="/privacy" className="hover:text-ink hover:underline">Privacy Notice</Link>. Pilot access
        is subject to a separate agreement.
      </p>
    </div>
  );
}
