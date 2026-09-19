// Edge Function: newsletter-subscribe
// Stores a pending subscriber and emails a double-opt-in confirmation link.
//
// Deploy:  supabase functions deploy newsletter-subscribe

import { createClient } from 'jsr:@supabase/supabase-js@2';
import {
  clientIp,
  corsHeaders,
  isValidEmail,
  json,
  verifyTurnstile,
} from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, req);

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') return json({ error: 'Invalid body' }, 400, req);

    const email = String(body.email ?? '').trim().toLowerCase();
    const source = String(body.source ?? '').trim().slice(0, 100) || null;
    const honeypot = String(body.company_website ?? '');
    const token = String(body.turnstileToken ?? '');

    if (honeypot) return json({ ok: true }, 200, req);
    if (!isValidEmail(email)) return json({ error: 'Invalid email' }, 400, req);

    if (!(await verifyTurnstile(token, clientIp(req)))) {
      return json({ error: 'Verification failed. Please try again.' }, 400, req);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );

    // Insert without resetting an existing subscriber's consent state.
    const { error: insertError } = await supabase
      .from('subscribers')
      .upsert({ email, source, status: 'pending' }, { onConflict: 'email', ignoreDuplicates: true });
    if (insertError) return json({ error: 'Could not subscribe.' }, 500, req);

    const { data, error } = await supabase.from('subscribers')
      .select('confirm_token, status').eq('email', email).single();
    if (error || !data) return json({ error: 'Could not subscribe.' }, 500, req);
    if (data.status === 'confirmed') return json({ ok: true, alreadyConfirmed: true }, 200, req);

    let confirmToken = data.confirm_token as string;
    if (data.status === 'unsubscribed') {
      // A fresh request needs fresh consent; old confirmation links stay invalid.
      const { data: renewed, error: renewError } = await supabase.from('subscribers')
        .update({ status: 'pending', confirm_token: crypto.randomUUID(), confirmed_at: null })
        .eq('email', email).eq('status', 'unsubscribed').select('confirm_token').maybeSingle();
      if (renewError || !renewed) return json({ error: 'Please try subscribing again.' }, 409, req);
      confirmToken = renewed.confirm_token;
    }

    try {
      await sendConfirmation(email, confirmToken);
    } catch {
      return json({ error: 'We could not send your confirmation email. Please try again later or contact hello@contineon.com.' }, 503, req);
    }

    return json({ ok: true }, 200, req);
  } catch (e) {
    console.error('newsletter-subscribe error:', e);
    return json({ error: 'Unexpected error' }, 500, req);
  }
});

async function sendConfirmation(email: string, token: string): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('EMAIL_FROM');
  const functionsUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1`;
  const confirmUrl = `${functionsUrl}/newsletter-confirm?token=${encodeURIComponent(token)}`;

  if (!apiKey || !from) {
    throw new Error('Newsletter email delivery is not configured.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: 'Confirm your subscription to Contineon',
      html: `<p>Confirm your subscription by clicking the link below:</p>
             <p><a href="${confirmUrl}">Confirm subscription</a></p>
             <p>If you didn't request this, you can ignore this email.</p>`,
    }),
  });
  if (!response.ok) throw new Error('Confirmation email provider rejected the request.');
}
