// Edge Function: newsletter-confirm
// Opened directly from the email link (GET). Confirms the subscriber and
// redirects to the site. Deploy WITHOUT JWT verification since it's a public
// browser navigation, not an authenticated API call:
//
//   supabase functions deploy newsletter-confirm --no-verify-jwt

import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const siteUrl = Deno.env.get('SITE_URL') ?? 'https://contineon.com';
  const url = new URL(req.url);
  const token = url.searchParams.get('token') ?? '';

  const redirect = (params: string) =>
    new Response(null, { status: 302, headers: { Location: `${siteUrl}/?${params}` } });

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) return redirect('subscribe=invalid');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );

    const { data, error } = await supabase
      .from('subscribers')
      .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
      .eq('confirm_token', token)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('confirm update failed:', error);
      return redirect('subscribe=error');
    }
    if (data) return redirect('subscribe=confirmed');
    const { data: existing, error: lookupError } = await supabase.from('subscribers')
      .select('status').eq('confirm_token', token).maybeSingle();
    if (lookupError) return redirect('subscribe=error');
    return redirect(existing?.status === 'confirmed' ? 'subscribe=already' : 'subscribe=invalid');
  } catch (e) {
    console.error('newsletter-confirm error:', e);
    return redirect('subscribe=error');
  }
});
