// Edge Function: create-checkout-session
// Creates a Stripe Checkout session for a trial subscription to a plan.
// Requires an authenticated caller (the user's JWT is forwarded as Bearer).
//
// Deploy:  supabase functions deploy create-checkout-session
// Secrets: STRIPE_SECRET_KEY, SITE_URL (+ auto-injected SUPABASE_*).

import { corsHeaders, json } from '../_shared/cors.ts';
import { adminClient, ensureStripeCustomer, getUser, stripe, SITE_URL } from '../_shared/stripe.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, req);
  if (Deno.env.get('PAYMENTS_ENABLED') !== 'true') {
    return json({ error: 'Online payments are not available. Contact hello@contineon.com about your engagement.' }, 403, req);
  }

  try {
    const user = await getUser(req);
    if (!user) return json({ error: 'Not authenticated' }, 401, req);

    const body = await req.json().catch(() => null);
    const planId = String(body?.plan_id ?? '').trim();
    if (!planId) return json({ error: 'Missing plan_id' }, 400, req);

    // Look up the plan server-side — never trust a price id from the client.
    const admin = adminClient();
    const { data: plan, error: planErr } = await admin
      .from('plans')
      .select('id, stripe_price_id, trial_days, amount_cents, is_active')
      .eq('id', planId)
      .maybeSingle();

    if (planErr || !plan || !plan.is_active) return json({ error: 'Unknown plan' }, 400, req);
    if (!plan.stripe_price_id) {
      return json({ error: 'This plan is not purchasable yet. Please contact us.' }, 400, req);
    }

    const customerId = await ensureStripeCustomer(user.id, user.email);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
      subscription_data: {
        trial_period_days: plan.trial_days > 0 ? plan.trial_days : undefined,
        metadata: { supabase_user_id: user.id, plan_id: plan.id },
      },
      // Tie the user + plan to the session so the webhook can reconcile it.
      metadata: { supabase_user_id: user.id, plan_id: plan.id },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      success_url: `${SITE_URL}/app/billing?checkout=success`,
      cancel_url: `${SITE_URL}/app/billing?checkout=cancel`,
    });

    if (!session.url) return json({ error: 'Could not create checkout session' }, 500, req);
    return json({ url: session.url }, 200, req);
  } catch (e) {
    console.error('create-checkout-session error:', e);
    return json({ error: 'Unexpected error' }, 500, req);
  }
});
