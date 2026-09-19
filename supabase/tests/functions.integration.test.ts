// Edge Function integration tests — exercise the REAL functions + Postgres on a
// local `supabase start` stack. They self-skip when no stack is reachable.
//
// What they cover (all WITHOUT any Stripe/Resend/Turnstile secrets):
//   • handle_new_user trigger   → a profiles row is auto-created on signup
//   • contact                   → stores valid msgs, 400s bad input, drops honeypot
//   • newsletter subscribe+confirm → double opt-in flips pending → confirmed
//   • create-checkout-session   → auth + catalog guards (returns before Stripe)
//   • create-portal-session     → auth + "no billing account" guard
//
// The Stripe *happy paths* (real Checkout/Portal URLs) are intentionally out of
// scope here — they need live Stripe test keys. See README.md to add them.
import { describe, it, expect } from 'vitest';
import {
  hasStack,
  stack,
  serviceClient,
  createUser,
  signIn,
  callFn,
  uniqueEmail,
  functionsUrl,
} from './_helpers';

if (!hasStack) {
  console.warn(
    '\n[integration] No local Supabase stack detected — skipping Edge Function tests.\n' +
      '              Run `supabase start`, then `npm run test:integration`.\n' +
      '              (See supabase/tests/README.md.)\n',
  );
}

const suite = hasStack ? describe : describe.skip;

suite('Edge Functions (integration)', () => {
  describe('handle_new_user trigger → profiles', () => {
    it('auto-creates a profiles row when an auth user is created', async () => {
      const user = await createUser(uniqueEmail());
      const admin = serviceClient();

      // The trigger fires in the same transaction, but allow a brief retry.
      let profile: { id: string } | null = null;
      for (let i = 0; i < 10 && !profile; i++) {
        const { data } = await admin.from('profiles').select('id').eq('id', user.id).maybeSingle();
        profile = data;
        if (!profile) await new Promise((r) => setTimeout(r, 150));
      }

      expect(profile?.id).toBe(user.id);
    });
  });

  describe('contact', () => {
    it('stores a valid submission and returns { ok: true }', async () => {
      const email = uniqueEmail();
      const { status, body } = await callFn('contact', {
        body: { name: 'Grace Hopper', email, message: 'Hello from the integration suite.' },
      });

      expect(status).toBe(200);
      expect(body).toEqual({ ok: true });

      const { data } = await serviceClient()
        .from('contact_messages')
        .select('name, message')
        .eq('email', email)
        .maybeSingle();
      expect(data?.name).toBe('Grace Hopper');
    });

    it('rejects an invalid email with 400', async () => {
      const { status, body } = await callFn('contact', {
        body: { name: 'X', email: 'not-an-email', message: 'hi there' },
      });
      expect(status).toBe(400);
      expect(String(body?.error)).toMatch(/email/i);
    });

    it('silently drops a honeypot hit and stores nothing', async () => {
      const email = uniqueEmail();
      const { status, body } = await callFn('contact', {
        body: { name: 'Bot', email, message: 'spam', company_website: 'http://spam.example' },
      });

      expect(status).toBe(200);
      expect(body).toEqual({ ok: true });

      const { data } = await serviceClient().from('contact_messages').select('id').eq('email', email);
      expect(data).toEqual([]);
    });
  });

  describe('newsletter double opt-in', () => {
    it('creates a pending subscriber, then confirms it via the token link', async () => {
      const email = uniqueEmail('news');

      const sub = await callFn('newsletter-subscribe', { body: { email, source: 'itest' } });
      // This local stack has no email provider configured: do not claim delivery.
      expect(sub.status).toBe(503);

      const admin = serviceClient();
      const { data: before } = await admin
        .from('subscribers')
        .select('status, confirm_token')
        .eq('email', email)
        .single();
      expect(before.status).toBe('pending');

      // newsletter-confirm is a public GET (verify_jwt = false) that 302-redirects.
      const res = await fetch(`${functionsUrl()}/newsletter-confirm?token=${before.confirm_token}`, {
        headers: { apikey: stack!.anonKey },
        redirect: 'manual',
      });
      expect(res.status).toBeGreaterThanOrEqual(300);
      expect(res.status).toBeLessThan(400);
      expect(res.headers.get('location') ?? '').toContain('subscribe=confirmed');

      const { data: after } = await admin.from('subscribers').select('status').eq('email', email).single();
      expect(after.status).toBe('confirmed');
    });
  });

  describe('prelaunch checkout gate', () => {
    it.skipIf(process.env.TEST_PAYMENTS_ENABLED === 'true')('refuses new checkout by default', async () => {
      const { status } = await callFn('create-checkout-session', { body: { plan_id: 'starter' } });
      expect(status).toBe(403);
    });
  });

  describe.skipIf(process.env.TEST_PAYMENTS_ENABLED !== 'true')('create-checkout-session (enabled catalog guards)', () => {
    it('returns 401 when the caller is not a real user', async () => {
      // Anon key is a valid JWT but resolves to no user → function returns 401.
      const { status } = await callFn('create-checkout-session', { body: { plan_id: 'starter' } });
      expect(status).toBe(401);
    });

    it('returns 400 for an unknown plan id', async () => {
      const email = uniqueEmail();
      await createUser(email);
      const token = await signIn(email);

      const { status, body } = await callFn('create-checkout-session', {
        token,
        body: { plan_id: 'does-not-exist' },
      });
      expect(status).toBe(400);
      expect(String(body?.error)).toMatch(/unknown plan/i);
    });

    it('returns 400 for a seeded-but-unpriced plan (no stripe_price_id yet)', async () => {
      // The 0002 seed inserts `starter` with a null stripe_price_id, so checkout
      // is refused before any Stripe call. (Skip if a price id was set locally.)
      const { data: starter } = await serviceClient()
        .from('plans')
        .select('stripe_price_id')
        .eq('id', 'starter')
        .maybeSingle();
      if (starter?.stripe_price_id) return; // a real price is configured — skip

      const email = uniqueEmail();
      await createUser(email);
      const token = await signIn(email);

      const { status, body } = await callFn('create-checkout-session', {
        token,
        body: { plan_id: 'starter' },
      });
      expect(status).toBe(400);
      expect(String(body?.error)).toMatch(/not purchasable/i);
    });
  });

  describe('create-portal-session (guards only — never reaches Stripe)', () => {
    it('returns 401 when the caller is not a real user', async () => {
      const { status } = await callFn('create-portal-session', { body: {} });
      expect(status).toBe(401);
    });

    it('returns 400 when the user has no Stripe customer yet', async () => {
      const email = uniqueEmail();
      await createUser(email);
      const token = await signIn(email);

      const { status, body } = await callFn('create-portal-session', { token, body: {} });
      expect(status).toBe(400);
      expect(String(body?.error)).toMatch(/billing account/i);
    });
  });
});
