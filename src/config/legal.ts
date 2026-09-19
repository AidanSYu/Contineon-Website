/** Confirm operator identity before publication; see LAUNCH_READINESS.md.
 * Contineon is a project name, not a registered company or contracting entity.
 */
export const legal = {
  projectName: 'Contineon',
  operatorName: null as string | null,
  /** Team base confirmed by the founder; not a street address or personal residence. */
  baseLocation: 'San Francisco, California, USA',
  effectiveDate: 'September 19, 2026',
  /** Founder confirmed this inbox is monitored. */
  contactEmail: 'hello@contineon.com',
  status: 'Contineon is an independent project in development and is not yet incorporated.',
} as const;

/** Keep public provider disclosures consistent across privacy and security. */
export const websiteProviders = [
  { name: 'Cloudflare', role: 'Website hosting, content delivery, and Turnstile bot protection when enabled' },
  { name: 'Supabase', role: 'Database, account authentication, and form processing when connected' },
  { name: 'Resend', role: 'Contact notifications and newsletter confirmation emails when enabled' },
] as const;
