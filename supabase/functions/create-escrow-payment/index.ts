// Edge Function: create-escrow-payment
// Creates a Stripe Checkout session (mode:'payment') that FUNDS an escrow
// agreement. The customer pays the full agreement total up front; funds are
// captured into the Contineon platform balance and later released or refunded
// per milestone (platform-held milestone escrow — see escrow-admin).
//
// Auth: customer JWT (Bearer). Requires only RequireAuth (no subscription).
// The amount is ALWAYS resolved server-side from the agreement row — the client
// never sends or sees an amount. service_role is the sole writer of escrow state.
//
// Deploy:  supabase functions deploy create-escrow-payment   (WITH jwt verify)
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
    const agreementId = String(body?.agreement_id ?? '').trim();
    if (!agreementId) return json({ error: 'Missing agreement_id' }, 400, req);

    // Load the agreement server-side via service_role (sole reader/writer of
    // escrow financial state).
    const admin = adminClient();
    const { data: agreement, error: agreementErr } = await admin
      .from('escrow_agreements')
      .select('id, user_id, title, currency, total_amount_cents, status, stripe_checkout_session_id')
      .eq('id', agreementId)
      .maybeSingle();

    // 404 covers both "not found" and "not yours" — never leak existence.
    if (agreementErr || !agreement || agreement.user_id !== user.id) {
      return json({ error: 'Agreement not found' }, 404, req);
    }

    // Fundable guard: only a 'pending' agreement is awaiting payment.
    if (agreement.status !== 'pending') {
      return json({ error: 'This agreement is not awaiting payment.' }, 409, req);
    }

    // Server-side amount resolution — never trust a client amount.
    const amountCents = agreement.total_amount_cents;
    if (!amountCents || amountCents <= 0) {
      return json({ error: 'Agreement has no payable amount.' }, 400, req);
    }

    const customerId = await ensureStripeCustomer(user.id, user.email);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: agreement.currency,
            unit_amount: amountCents,
            product_data: { name: `Escrow: ${agreement.title}` },
          },
        },
      ],
      // Stamp the PaymentIntent so charge.refunded (whose charge.payment_intent
      // carries the PI metadata) can reconcile back to this agreement.
      payment_intent_data: {
        metadata: { kind: 'escrow', agreement_id: agreement.id, supabase_user_id: user.id },
      },
      // Stamp the session so checkout.session.completed can reconcile too.
      metadata: { kind: 'escrow', agreement_id: agreement.id, supabase_user_id: user.id },
      billing_address_collection: 'auto',
      success_url: `${SITE_URL}/app/escrow/${agreement.id}?checkout=success`,
      cancel_url: `${SITE_URL}/app/escrow/${agreement.id}?checkout=cancel`,
    });

    if (!session.url) return json({ error: 'Could not create checkout session' }, 500, req);

    // Record the session id for traceability. Do NOT flip status here — the
    // webhook (checkout.session.completed) is the sole authority that moves the
    // agreement to 'funded' once Stripe confirms payment.
    await admin
      .from('escrow_agreements')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', agreement.id);

    return json({ url: session.url }, 200, req);
  } catch (e) {
    console.error('create-escrow-payment error:', e);
    return json({ error: 'Unexpected error' }, 500, req);
  }
});
