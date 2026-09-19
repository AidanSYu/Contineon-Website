import { FUNCTIONS_URL, SUPABASE_ANON_KEY, isBackendConfigured } from '@/lib/backendConfig';
import { subscribeSchema, type SubscribeInput } from '@/lib/validation';

/**
 * Join the newsletter / waitlist. Routed through the `newsletter-subscribe`
 * Edge Function, which verifies Turnstile, stores a pending row, and emails a
 * double-opt-in confirmation link.
 */
export async function subscribe(input: SubscribeInput): Promise<{ alreadyConfirmed?: boolean }> {
  if (!isBackendConfigured) {
    throw new Error('Newsletter signup is unavailable. Please contact hello@contineon.com.');
  }

  const payload = subscribeSchema.parse(input);

  const res = await fetch(`${FUNCTIONS_URL}/newsletter-subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Could not subscribe. Please try again.');
  }
  return res.json() as Promise<{ alreadyConfirmed?: boolean }>;
}
