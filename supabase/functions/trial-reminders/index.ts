// Edge Function: trial-reminders
// Sends a single "your free trial ends soon" email to users whose trial ends
// within the next ~3 days and who haven't been reminded yet.
//
// This is lifecycle-email SCAFFOLDING. To put it into production:
//   1. Apply migration 0004_trial_reminded.sql (adds subscriptions.trial_reminded_at).
//   2. Set secrets: RESEND_API_KEY, EMAIL_FROM, CRON_SECRET (+ auto SUPABASE_*).
//   3. Deploy:  supabase functions deploy trial-reminders
//   4. Trigger on a schedule — e.g. a daily pg_cron job that calls this function,
//      or an external scheduler. Protect it with the CRON_SECRET header below.
//
// It is intentionally idempotent (trial_reminded_at) and safe to run repeatedly.

import { corsHeaders, json } from '../_shared/cors.ts';
import { adminClient, SITE_URL } from '../_shared/stripe.ts';

const REMIND_WITHIN_DAYS = 3;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, req);

  // Only the scheduler may invoke this — never a browser.
  const secret = Deno.env.get('CRON_SECRET');
  if (!secret || req.headers.get('x-cron-secret') !== secret) {
    return json({ error: 'Forbidden' }, 403, req);
  }

  try {
    const admin = adminClient();
    const cutoff = new Date(Date.now() + REMIND_WITHIN_DAYS * 86_400_000).toISOString();

    // Trials ending within the window, not cancelled, not yet reminded.
    const { data: subs, error } = await admin
      .from('subscriptions')
      .select('id, user_id, plan_id, trial_end, cancel_at_period_end')
      .eq('status', 'trialing')
      .eq('cancel_at_period_end', false)
      .is('trial_reminded_at', null)
      .lte('trial_end', cutoff)
      .gt('trial_end', new Date().toISOString());

    if (error) {
      console.error('trial-reminders query failed:', error);
      return json({ error: 'Query failed' }, 500, req);
    }

    let sent = 0;
    for (const sub of subs ?? []) {
      // Resolve the user's email via the admin auth API.
      const { data: u } = await admin.auth.admin.getUserById(sub.user_id);
      const email = u.user?.email;
      if (!email) continue;

      const ok = await sendReminder(email, sub.trial_end as string).catch((e) => {
        console.error('reminder email failed:', e);
        return false;
      });
      if (ok === false) continue;

      await admin
        .from('subscriptions')
        .update({ trial_reminded_at: new Date().toISOString() })
        .eq('id', sub.id);
      sent++;
    }

    return json({ ok: true, scanned: subs?.length ?? 0, sent }, 200, req);
  } catch (e) {
    console.error('trial-reminders error:', e);
    return json({ error: 'Unexpected error' }, 500, req);
  }
});

async function sendReminder(email: string, trialEnd: string): Promise<boolean> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('EMAIL_FROM');
  const billingUrl = `${SITE_URL}/app/billing`;
  const ends = new Date(trialEnd).toLocaleDateString();

  if (!apiKey || !from) {
    console.log('[dev] would remind', email, '— trial ends', ends, '→', billingUrl);
    return true;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: email,
      subject: 'Your Contineon trial ends soon',
      html: `<p>Your free trial ends on <strong>${ends}</strong>.</p>
             <p>Your plan will begin automatically so your campaigns keep running. You can review or
             change your plan anytime from your billing page:</p>
             <p><a href="${billingUrl}">Manage billing</a></p>
             <p>Questions? Just reply to this email.</p>`,
    }),
  });
  return res.ok;
}
