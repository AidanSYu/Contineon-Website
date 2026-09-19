/* =============================================================================
   Feature flags, resolved from Vite env at build time.
   Set them in `.env.local` (dev) or the deploy host's env (prod).
   Every flag defaults OFF so a missing/blank env var is always the safe state.
   A flag is "on" only when its VITE_ var is the literal string "true".
   ============================================================================= */

const on = (v: unknown) => v === 'true';

export const flags = {
  /** Mirror the server PAYMENTS_ENABLED gate; both default off. */
  payments: on(import.meta.env.VITE_PAYMENTS_ENABLED),
  /** Keep direct registration closed during the request-access phase.
   * Also disable public signup in the hosted Supabase Auth settings. */
  publicSignup: on(import.meta.env.VITE_PUBLIC_SIGNUP),
  /** Enable only after confirmation email delivery and unsubscribe handling are verified. */
  newsletter: on(import.meta.env.VITE_NEWSLETTER_ENABLED),
  /**
   * Show the illustrative campaign metrics (handoff alert + stat cards) on the
   * dashboard Overview. OFF by default: the ASILIA campaign backend does not
   * exist yet, so those numbers are demo data, not the signed-in user's data.
   * Turn on only for sales demos / screenshots, never in customer-facing prod.
   */
  showDemoMetrics: on(import.meta.env.VITE_SHOW_DEMO_METRICS),

  /**
   * Show the self-serve subscription plan picker + Stripe checkout inside the
   * app (Billing page picker, trial-banner "choose a plan" nudges, the Overview
   * "activate access" prompt). OFF for the design-partner phase: access is
   * provisioned through pilot engagements (/app/escrow), not self-serve checkout.
   * The checkout code stays wired, flip this to "true" to re-open self-serve.
   */
  selfServeBilling: on(import.meta.env.VITE_PAYMENTS_ENABLED) && on(import.meta.env.VITE_SELF_SERVE_BILLING),
} as const;

export type Flags = typeof flags;
