// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { webcrypto } from 'node:crypto';
import ts from 'typescript';

/** Run the actual Edge Function handler with mocked boundaries; no live writes. */
function loadHandler(name: string, options: {
  env?: Record<string, string>;
  results?: unknown[];
  deliveryStatus?: number;
} = {}) {
  let handler!: (request: Request) => Promise<Response>;
  const results = [...(options.results ?? [])];
  const calls: { method: string; args: unknown[] }[] = [];
  const query: Record<string, unknown> = {};
  for (const method of ['select', 'eq', 'update', 'upsert']) {
    query[method] = (...args: unknown[]) => { calls.push({ method, args }); return query; };
  }
  query.single = query.maybeSingle = () => Promise.resolve(results.shift());
  query.then = (resolve: (value: unknown) => void) => resolve(results.shift());
  const client = { from: () => query };
  const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: options.deliveryStatus ?? 200 }));
  const getUser = vi.fn().mockResolvedValue(null);
  const js = ts.transpileModule(readFileSync(`supabase/functions/${name}/index.ts`, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  runInNewContext(js, {
    exports: {}, Request, Response, URL, crypto: webcrypto, console,
    fetch: fetchMock,
    Deno: { env: { get: (key: string) => options.env?.[key] }, serve: (fn: typeof handler) => { handler = fn; } },
    require: (id: string) => {
      if (id.includes('supabase-js')) return { createClient: () => client };
      if (id.includes('stripe')) return { getUser };
      if (id.includes('cors')) return {
        corsHeaders: () => ({}), clientIp: () => '', verifyTurnstile: async () => true,
        isValidEmail: (email: string) => email.includes('@'),
        json: (data: unknown, status: number) => new Response(JSON.stringify(data), { status }),
      };
      throw new Error(`Unexpected dependency: ${id}`);
    },
  });
  return { handler, calls, fetchMock, getUser };
}
const request = () => new Request('https://example.test/functions/v1/newsletter-subscribe', {
  method: 'POST', body: JSON.stringify({ email: 'reader@example.test', source: 'footer' }),
});
const emailEnv = { SUPABASE_URL: 'https://example.test', RESEND_API_KEY: 'test-key', EMAIL_FROM: 'hello@example.test' };
const pending = { data: { status: 'pending', confirm_token: '12345678-1234-1234-1234-123456789012' }, error: null };

describe('newsletter delivery and consent', () => {
  it('does not claim delivery when the mail provider is unconfigured', async () => {
    const { handler, fetchMock } = loadHandler('newsletter-subscribe', { results: [{ error: null }, pending] });
    expect((await handler(request())).status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('surfaces mail provider rejection instead of a false success', async () => {
    const { handler } = loadHandler('newsletter-subscribe', { env: emailEnv, deliveryStatus: 422, results: [{ error: null }, pending] });
    expect((await handler(request())).status).toBe(503);
  });
  it('sends a branded confirmation with the encoded token', async () => {
    const { handler, fetchMock } = loadHandler('newsletter-subscribe', { env: emailEnv, results: [{ error: null }, pending] });
    expect((await handler(request())).status).toBe(200);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.subject).toBe('Confirm your subscription to Contineon');
    expect(body.html).toContain(pending.data.confirm_token);
  });
  it('preserves existing confirmed consent and does not send another email', async () => {
    const { handler, calls, fetchMock } = loadHandler('newsletter-subscribe', {
      results: [{ error: null }, { data: { status: 'confirmed' }, error: null }],
    });
    expect(await (await handler(request())).json()).toEqual({ ok: true, alreadyConfirmed: true });
    expect(calls.find(call => call.method === 'upsert')?.args[1]).toEqual({ onConflict: 'email', ignoreDuplicates: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('requires a new confirmation token after unsubscribe', async () => {
    const { handler, calls } = loadHandler('newsletter-subscribe', {
      env: emailEnv,
      results: [{ error: null }, { data: { status: 'unsubscribed', confirm_token: 'old' } }, { data: { confirm_token: 'fresh' } }],
    });
    expect((await handler(request())).status).toBe(200);
    const update = calls.find(call => call.method === 'update')?.args[0] as { status: string; confirm_token: string };
    expect(update.status).toBe('pending');
    expect(update.confirm_token).not.toBe('old');
  });
  it.each([
    [null, 'invalid'],
    [{ status: 'unsubscribed' }, 'invalid'],
    [{ status: 'confirmed' }, 'already'],
  ])('distinguishes invalid links from already confirmed subscriptions: %j', async (data, state) => {
    const { handler } = loadHandler('newsletter-confirm', { results: [{ data: null }, { data }] });
    const response = await handler(new Request(`https://example.test/?token=${pending.data.confirm_token}`));
    expect(response.headers.get('Location')).toBe(`https://contineon.com/?subscribe=${state}`);
  });
});

describe('prelaunch payment gate', () => {
  it.each(['create-checkout-session', 'create-escrow-payment'])('%s refuses new checkout without explicit enablement', async (name) => {
    const { handler, getUser } = loadHandler(name);
    expect((await handler(request())).status).toBe(403);
    expect(getUser).not.toHaveBeenCalled();
  });
  it('still requires authentication when explicitly enabled', async () => {
    const { handler, getUser } = loadHandler('create-escrow-payment', { env: { PAYMENTS_ENABLED: 'true' } });
    expect((await handler(request())).status).toBe(401);
    expect(getUser).toHaveBeenCalledOnce();
  });
});
