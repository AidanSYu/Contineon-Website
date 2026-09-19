import { FUNCTIONS_URL, SUPABASE_ANON_KEY, isBackendConfigured } from '@/lib/supabase';
import { contactSchema, type ContactInput } from '@/lib/validation';

/**
 * Submit the contact form. Routed through the `contact` Edge Function so the
 * server can verify the Turnstile token and write with the service_role key —
 * the browser never gets write access to `contact_messages`.
 */
export async function submitContact(input: ContactInput): Promise<void> {
  if (!isBackendConfigured) {
    throw new Error('The contact form is unavailable. Please email hello@contineon.com.');
  }

  const payload = contactSchema.parse(input);

  const res = await fetch(`${FUNCTIONS_URL}/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Anonymous callers authenticate to the Functions gateway with the
      // public anon key. (Logged-in users could send their JWT instead.)
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Could not send your message. Please try again.');
  }
}
