// Edge Function: escrow-admin
// Owner-only control plane for platform-held milestone escrow. The admin (the
// owner) creates agreements + milestones for a customer, then RELEASES a
// milestone (internal state change — funds were already captured at funding) or
// REFUNDS a milestone (Stripe partial refund against the agreement's PI).
//
// Auth: JWT + is_admin gate. The caller must be authenticated AND have
// profiles.role = 'admin'. ALL money math is server-side; service_role is the
// sole writer of every escrow row.
//
// Deploy:  supabase functions deploy escrow-admin   (WITH jwt verify)
// Secrets: STRIPE_SECRET_KEY (+ auto-injected SUPABASE_*).

import { corsHeaders, json } from '../_shared/cors.ts';
import { adminClient, getUser, stripe, SITE_URL } from '../_shared/stripe.ts';

const AGREEMENT_COLS =
  'id, user_id, title, description, currency, total_amount_cents, status, created_by, stripe_checkout_session_id, stripe_payment_intent_id, created_at';
const MILESTONE_COLS =
  'id, agreement_id, title, amount_cents, status, sort_order, released_at, refunded_at, stripe_refund_id, created_at';

// Money-math guardrails (admin-gated, but bound the inputs anyway).
const MAX_AMOUNT_CENTS = 99_999_999; // ~$999,999.99 ceiling per milestone & per agreement
const MAX_MILESTONES = 50;
const ALLOWED_CURRENCIES = new Set(['usd', 'eur', 'gbp', 'cad', 'aud']);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, req);

  try {
    const user = await getUser(req);
    if (!user) return json({ error: 'Not authenticated' }, 401, req);

    const admin = adminClient();

    // is_admin gate. Prefer the SECURITY DEFINER helper if present; fall back to
    // a direct profiles.role lookup (role is REVOKE'd from clients, so only
    // service_role/dashboard can have set it to 'admin').
    if (!(await isAdmin(admin, user.id))) {
      return json({ error: 'Forbidden' }, 403, req);
    }

    const body = await req.json().catch(() => null);
    const action = String(body?.action ?? '').trim();

    switch (action) {
      case 'create_agreement':
        if (Deno.env.get('PAYMENTS_ENABLED') !== 'true') {
          return json({ error: 'New paid engagements are not enabled.' }, 403, req);
        }
        return await createAgreement(admin, user.id, body, req);
      case 'release_milestone':
        return await releaseMilestone(admin, body, req);
      case 'refund_milestone':
        return await refundMilestone(admin, body, req);
      case 'find_users':
        return await findUsers(admin, body, req);
      default:
        return json({ error: 'Unknown action' }, 400, req);
    }
  } catch (e) {
    console.error('escrow-admin error:', e);
    return json({ error: 'Unexpected error' }, 500, req);
  }
});

type Admin = ReturnType<typeof adminClient>;

/** True if the user is an admin. Tries is_admin(uid) RPC, then profiles.role. */
async function isAdmin(admin: Admin, uid: string): Promise<boolean> {
  const rpc = await admin.rpc('is_admin', { uid });
  if (!rpc.error) return rpc.data === true;
  // RPC absent/erroring — fall back to the profiles.role lookup. This is still
  // safe (role is REVOKE'd from clients in 0005, so only service_role/dashboard
  // can set it), but a PERSISTENT fallback means is_admin() failed to deploy or
  // lost its grant — log it so the regression surfaces instead of hiding.
  console.warn('is_admin RPC unavailable, falling back to profiles.role:', rpc.error?.message);
  const { data } = await admin.from('profiles').select('role').eq('id', uid).maybeSingle();
  return data?.role === 'admin';
}

// ── create_agreement ────────────────────────────────────────────────────────
async function createAgreement(
  admin: Admin,
  adminUserId: string,
  body: Record<string, unknown> | null,
  req: Request,
): Promise<Response> {
  const customerId = String(body?.user_id ?? '').trim();
  const title = String(body?.title ?? '').trim();
  const description = body?.description != null ? String(body.description) : null;
  const currency = String(body?.currency ?? 'usd').trim().toLowerCase() || 'usd';
  const rawMilestones = Array.isArray(body?.milestones) ? body!.milestones as unknown[] : [];

  if (!customerId) return json({ error: 'Missing user_id' }, 400, req);
  if (!title) return json({ error: 'Missing title' }, 400, req);
  if (!ALLOWED_CURRENCIES.has(currency)) return json({ error: 'Unsupported currency' }, 400, req);
  if (rawMilestones.length === 0) return json({ error: 'No milestones provided' }, 400, req);
  if (rawMilestones.length > MAX_MILESTONES) {
    return json({ error: `Too many milestones (max ${MAX_MILESTONES})` }, 400, req);
  }

  // Validate the target customer exists.
  const { data: customer } = await admin
    .from('profiles')
    .select('id')
    .eq('id', customerId)
    .maybeSingle();
  if (!customer) return json({ error: 'Customer not found' }, 404, req);

  // Validate + normalize milestones (server-side money math only).
  const milestones: { title: string; amount_cents: number; sort_order: number }[] = [];
  for (let i = 0; i < rawMilestones.length; i++) {
    const m = rawMilestones[i] as Record<string, unknown>;
    const mTitle = String(m?.title ?? '').trim();
    const amount = Number(m?.amount_cents);
    if (!mTitle || !Number.isInteger(amount) || amount <= 0) {
      return json({ error: 'Each milestone needs a title and positive amount' }, 400, req);
    }
    if (amount > MAX_AMOUNT_CENTS) {
      return json({ error: 'Milestone amount exceeds the maximum' }, 400, req);
    }
    const sortOrder = Number.isInteger(Number(m?.sort_order)) ? Number(m.sort_order) : i;
    milestones.push({ title: mTitle, amount_cents: amount, sort_order: sortOrder });
  }

  const total = milestones.reduce((sum, m) => sum + m.amount_cents, 0);
  if (total <= 0) return json({ error: 'Milestones must sum to a positive total' }, 400, req);
  if (total > MAX_AMOUNT_CENTS) {
    return json({ error: 'Agreement total exceeds the maximum' }, 400, req);
  }

  // Insert the agreement (service_role — sole writer).
  const { data: agreement, error: agErr } = await admin
    .from('escrow_agreements')
    .insert({
      user_id: customerId,
      title,
      description,
      currency,
      total_amount_cents: total,
      status: 'pending',
      created_by: adminUserId,
    })
    .select(AGREEMENT_COLS)
    .single();

  if (agErr || !agreement) {
    console.error('Failed to insert escrow agreement:', agErr);
    return json({ error: 'Unexpected error' }, 500, req);
  }

  const { data: insertedMilestones, error: mErr } = await admin
    .from('escrow_milestones')
    .insert(
      milestones.map((m) => ({
        agreement_id: agreement.id,
        title: m.title,
        amount_cents: m.amount_cents,
        status: 'pending',
        sort_order: m.sort_order,
      })),
    )
    .select(MILESTONE_COLS)
    .order('sort_order', { ascending: true });

  if (mErr || !insertedMilestones) {
    console.error('Failed to insert escrow milestones:', mErr);
    return json({ error: 'Unexpected error' }, 500, req);
  }

  // Best-effort: tell the customer their engagement is ready to fund. A
  // notification failure must NOT roll back the already-committed agreement.
  try {
    const email = await getUserEmail(admin, customerId);
    if (email) {
      const link = `${SITE_URL}/app/escrow/${agreement.id}`;
      await sendCustomerEmail(
        email,
        'Your Contineon pilot engagement is ready to fund',
        `<p>Your design-partner pilot engagement <strong>${escapeHtml(title)}</strong> is ready.</p>
         <p>Funding it locks in your milestones and starts the work. Review the milestones and fund
         securely here:</p>
         <p><a href="${link}">View your engagement</a></p>
         <p>Questions? Just reply to this email.</p>`,
      );
    }
  } catch (e) {
    console.error('engagement-created notification failed:', e);
  }

  return json({ agreement, milestones: insertedMilestones }, 201, req);
}

// ── release_milestone ───────────────────────────────────────────────────────
async function releaseMilestone(
  admin: Admin,
  body: Record<string, unknown> | null,
  req: Request,
): Promise<Response> {
  const milestoneId = String(body?.milestone_id ?? '').trim();
  if (!milestoneId) return json({ error: 'Missing milestone_id' }, 400, req);

  const milestone = await loadMilestone(admin, milestoneId);
  if (!milestone) return json({ error: 'Milestone not found' }, 404, req);

  const agreement = await loadAgreement(admin, milestone.agreement_id);
  if (!agreement) return json({ error: 'Milestone not found' }, 404, req);

  if (agreement.status !== 'funded') {
    return json({ error: 'Agreement is not funded.' }, 409, req);
  }
  if (milestone.status !== 'funded') {
    return json({ error: 'Milestone is not in a settleable state.' }, 409, req);
  }

  const { data: updated, error: updErr } = await admin
    .from('escrow_milestones')
    .update({ status: 'released', released_at: new Date().toISOString() })
    .eq('id', milestoneId)
    .eq('status', 'funded') // predicate keeps the write idempotent
    .select(MILESTONE_COLS)
    .single();

  if (updErr || !updated) {
    console.error('Failed to release milestone:', updErr);
    return json({ error: 'Unexpected error' }, 500, req);
  }

  const refreshed = await maybeCompleteAgreement(admin, agreement.id);

  // Best-effort: notify the customer a milestone was completed.
  try {
    const email = await getUserEmail(admin, agreement.user_id);
    if (email) {
      const link = `${SITE_URL}/app/escrow/${agreement.id}`;
      await sendCustomerEmail(
        email,
        'A milestone on your Contineon engagement was completed',
        `<p>We’ve marked the milestone <strong>${escapeHtml(milestone.title)}</strong> as completed on
         your engagement <strong>${escapeHtml(agreement.title)}</strong>.</p>
         <p>See the latest status here:</p>
         <p><a href="${link}">View your engagement</a></p>`,
      );
    }
  } catch (e) {
    console.error('milestone-released notification failed:', e);
  }

  return json({ milestone: updated, agreement: refreshed }, 200, req);
}

// ── refund_milestone ────────────────────────────────────────────────────────
async function refundMilestone(
  admin: Admin,
  body: Record<string, unknown> | null,
  req: Request,
): Promise<Response> {
  const milestoneId = String(body?.milestone_id ?? '').trim();
  if (!milestoneId) return json({ error: 'Missing milestone_id' }, 400, req);

  const milestone = await loadMilestone(admin, milestoneId);
  if (!milestone) return json({ error: 'Milestone not found' }, 404, req);

  const agreement = await loadAgreement(admin, milestone.agreement_id);
  if (!agreement) return json({ error: 'Milestone not found' }, 404, req);

  if (agreement.status !== 'funded' || !agreement.stripe_payment_intent_id) {
    return json({ error: 'Agreement is not funded.' }, 409, req);
  }
  if (milestone.status !== 'funded') {
    return json({ error: 'Milestone is not in a settleable state.' }, 409, req);
  }

  // Partial refund against the agreement's captured PaymentIntent. The amount is
  // the milestone's server-side amount — never a client value. The idempotency
  // key (one per milestone, which is refunded at most once) collapses concurrent
  // duplicate requests — e.g. a double-click or two admin sessions — into a
  // SINGLE Stripe refund instead of issuing two real refunds.
  const refund = await stripe.refunds.create(
    {
      payment_intent: agreement.stripe_payment_intent_id,
      amount: milestone.amount_cents,
      metadata: { kind: 'escrow', milestone_id: milestoneId, agreement_id: agreement.id },
    },
    { idempotencyKey: `escrow-refund-${milestoneId}` },
  );

  // Mark refunded, predicated on still-'funded' so this write CONVERGES with the
  // webhook's charge.refunded handler — whichever lands first wins, the other is
  // a harmless no-op.
  const { data: updated, error: updErr } = await admin
    .from('escrow_milestones')
    .update({
      status: 'refunded',
      refunded_at: new Date().toISOString(),
      stripe_refund_id: refund.id,
    })
    .eq('id', milestoneId)
    .eq('status', 'funded')
    .select(MILESTONE_COLS)
    .maybeSingle();

  if (updErr) {
    console.error('Failed to mark milestone refunded:', updErr);
    return json({ error: 'Unexpected error' }, 500, req);
  }

  // If the webhook already marked it, re-read the current row to return state.
  const finalMilestone = updated ?? (await loadMilestone(admin, milestoneId));
  const refreshed = await maybeCompleteAgreement(admin, agreement.id);

  // Best-effort: notify the customer a milestone was refunded.
  try {
    const email = await getUserEmail(admin, agreement.user_id);
    if (email) {
      const link = `${SITE_URL}/app/escrow/${agreement.id}`;
      await sendCustomerEmail(
        email,
        'A milestone on your Contineon engagement was refunded',
        `<p>We’ve refunded the milestone <strong>${escapeHtml(milestone.title)}</strong> on your
         engagement <strong>${escapeHtml(agreement.title)}</strong>. The funds are being returned to
         your original payment method.</p>
         <p>See the latest status here:</p>
         <p><a href="${link}">View your engagement</a></p>`,
      );
    }
  } catch (e) {
    console.error('milestone-refunded notification failed:', e);
  }

  return json(
    { milestone: finalMilestone, agreement: refreshed, refund_id: refund.id },
    200,
    req,
  );
}

// ── customer email notifications (best-effort; never block the mutation) ─────
function escapeHtml(s: string): string {
  const map: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  };
  return s.replace(/[&<>"']/g, (c) => map[c]);
}

/** The customer's email from auth.users (service_role only), or null. */
async function getUserEmail(admin: Admin, userId: string): Promise<string | null> {
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user?.email) return null;
  return data.user.email;
}

/** Send a transactional email via Resend. No-ops (logs) if email isn't configured. */
async function sendCustomerEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('EMAIL_FROM');
  if (!apiKey || !from) {
    console.log('[dev] would email', to, '—', subject);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    console.error('Resend email failed:', res.status, await res.text().catch(() => ''));
  }
}

// ── find_users (admin lookup for assigning / labeling agreements) ───────────
// Two modes: { query } searches by email or full name (min 2 chars); { ids }
// resolves a set of user ids to email/name (to label the agreement list).
// Emails live in auth.users, readable only by service_role — never the client.
async function findUsers(
  admin: Admin,
  body: Record<string, unknown> | null,
  req: Request,
): Promise<Response> {
  const query = String(body?.query ?? '').trim().toLowerCase();
  const ids = Array.isArray(body?.ids) ? (body!.ids as unknown[]).map((x) => String(x)) : [];
  const byIds = ids.length > 0;
  if (!byIds && query.length < 2) return json({ users: [] }, 200, req);

  // service_role reads auth.users via the admin API. perPage bounds the scan —
  // ample for the design-partner cohort; paginate if the user base grows large.
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) {
    console.error('listUsers failed:', error);
    return json({ error: 'Unexpected error' }, 500, req);
  }

  // full_name from profiles, for matching and display labels.
  const { data: profs } = await admin.from('profiles').select('id, full_name');
  const nameById = new Map<string, string>();
  for (const p of profs ?? []) nameById.set(p.id, (p as { full_name: string | null }).full_name ?? '');

  const idSet = new Set(ids);
  const matches = data.users
    .filter((u) => {
      if (byIds) return idSet.has(u.id);
      const email = (u.email ?? '').toLowerCase();
      const name = (nameById.get(u.id) ?? '').toLowerCase();
      return email.includes(query) || name.includes(query);
    })
    .slice(0, 20)
    .map((u) => ({ id: u.id, email: u.email ?? '', full_name: nameById.get(u.id) || null }));

  return json({ users: matches }, 200, req);
}

// ── helpers ─────────────────────────────────────────────────────────────────
async function loadMilestone(admin: Admin, milestoneId: string) {
  const { data } = await admin
    .from('escrow_milestones')
    .select(MILESTONE_COLS)
    .eq('id', milestoneId)
    .maybeSingle();
  return data;
}

async function loadAgreement(admin: Admin, agreementId: string) {
  const { data } = await admin
    .from('escrow_agreements')
    .select(AGREEMENT_COLS)
    .eq('id', agreementId)
    .maybeSingle();
  return data;
}

/**
 * Recompute the agreement's terminal state: if no sibling milestone is still
 * 'pending' or 'funded', the agreement is fully settled -> 'completed'. Returns
 * the refreshed agreement row.
 */
async function maybeCompleteAgreement(admin: Admin, agreementId: string) {
  const { count } = await admin
    .from('escrow_milestones')
    .select('id', { count: 'exact', head: true })
    .eq('agreement_id', agreementId)
    .in('status', ['pending', 'funded']);

  if ((count ?? 0) === 0) {
    await admin
      .from('escrow_agreements')
      .update({ status: 'completed' })
      .eq('id', agreementId)
      .eq('status', 'funded'); // only a funded agreement completes
  }

  return await loadAgreement(admin, agreementId);
}
