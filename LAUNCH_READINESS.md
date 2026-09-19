# Pre-incorporation launch review — September 19, 2026

The public website now describes Contineon as an independent, unincorporated project.
These changes prepare an informational/request-access site, not a general release of
Asilia or authorization to collect pilot payments. Existing uncommitted SEO, deployment,
and page edits were preserved. Nothing was deployed as part of this review.

## Facts still required before publication

- Confirm the actual individual(s) operating the site/data controller. Set `operatorName`
  in `src/config/legal.ts`; it is intentionally unset rather than inferred from a username
  or replaced with a nonexistent company. Confirm any required mailing/contact address
  and jurisdiction-specific disclosures separately from the team's city-level base.
- Confirm the actual inbound mailbox provider and add it to the provider disclosures.
- Verify Cloudflare hosting, Supabase deployment/region, Resend sender, provider agreements,
  international processing arrangements, retention practice, and backup deletion behavior.
  The privacy notice does not assert signed transfer clauses, a DPO, automatic deletion
  schedules, or a self-serve export tool that this repository cannot establish.
- Review the website terms/privacy notice against those facts and intended audiences.
  These are site-specific working documents, not a finding of legal compliance. Pilot
  contracts must name the real parties and separately establish fees, data handling,
  safety responsibilities, delivery scope, and offboarding.
- Verify rights and attribution for all shipped imagery/video, especially assets without
  a source/license record. Existing A-Lab credits were retained. This pass did not establish
  a full media-rights chain or verify the separate Asilia runtime's product claims.

Privacy reference used: [ICO — information to provide in a privacy notice](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/what-privacy-information-should-we-provide/).
It identifies operator/contact information, purposes, recipients, rights, and retention
periods or criteria. It is UK guidance, not a determination of which law applies here.

## Facts confirmed by the founder

- `hello@contineon.com` is monitored. It remains the public contact for inquiries,
  privacy requests, unsubscribe requests, and security reports.
- The team is based in San Francisco, California, USA. There is no office, and the
  founder's location varies. The public site uses the city-level team base, without
  presenting it as a registered office, postal address, or personal residence.
- Before sending commercial newsletters, establish a valid postal address and include
  it in those messages. This does not require renting an office: the
  [FTC's CAN-SPAM guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)
  permits a USPS-registered PO box or a properly registered private mailbox. The city
  alone is not the required postal address. Newsletter capture remains off by default.

## Defaults and hosted setup

- `VITE_PUBLIC_SIGNUP=false`: `/signup` redirects to the access-request page. Separately
  turn off **Allow new users to sign up** in the hosted Supabase Auth settings. The frontend
  redirect is not server-side access control. Local Supabase config remains suitable for tests.
- `VITE_PAYMENTS_ENABLED=false`, `VITE_SELF_SERVE_BILLING=false`, and server secret
  `PAYMENTS_ENABLED=false`: new Stripe checkout and paid-agreement creation are closed by
  default. Deploy the updated `create-checkout-session`, `create-escrow-payment`, and
  `escrow-admin` functions to enforce this on the hosted backend. Existing Stripe sessions
  or subscriptions are not canceled by this change; inspect any already-issued sessions
  before launch. Refunds, webhooks, and existing billing management remain available.
- `VITE_NEWSLETTER_ENABLED=false`: the footer directs visitors to news/contact. Enable
  capture only after a real confirmation email has been delivered and a monitored manual
  unsubscribe procedure is in place. The notice explicitly describes email-based unsubscribe.
  Deploy `newsletter-subscribe` and `newsletter-confirm` together; confirmed subscribers
  must not be reset to pending, failures must not report success, and unknown tokens must
  not look confirmed. Use the production `SITE_URL` for confirmation redirects.
- The contact page offers email instead of a nonfunctional form when Supabase is absent.
  With a configured backend, verify Turnstile site/secret keys, allowed origins, notification
  delivery, and actual storage before launch. Keep `ALLOW_INSECURE_NO_CAPTCHA` off in production.
  Ensure contact-message notifications are delivered or the inbox table is actively monitored.
- Public signup/payment switches are operational choices for this stage, not a claim that
  incorporation is universally required to operate a business or accept payment.

## Implemented

- Replaced generic SaaS templates and bracketed legal instructions with website terms and
  a privacy notice scoped to current website data handling.
- Removed unsupported SSO/SAML, differential privacy, instant setup, one-click export,
  certification, and partner-release claims from trust/FAQ surfaces.
- Replaced dated starter product announcements with the existing published article source.
- Replaced dead demo controls and research placeholders with working walkthrough links and
  research-direction content; partner sign-in links now use the existing `/login` route.
- Added contact/newsletter privacy links, form fallback states, refreshed bot verification
  after submissions, clear newsletter confirmation/error messages, and current branding in emails.
- Fixed invalid hash-selector crashes, mobile-menu expanded state, and a payment redirect
  toast that incorrectly treated a query parameter as proof of receipt.
- Updated prerendered legal/security metadata to match the revised pages.

## Verification

- `npm run build`, `npm run lint`, and `npm test`.
- Browser smoke review of 22 routes, including legal, trust, forms, product/docs/news,
  signup redirect, sign-in, and the not-found page. Six mobile route checks; no horizontal
  overflow or browser exceptions in the reviewed pages.
- Focused handler tests exercise mail failures, existing consent preservation, resubscription,
  invalid/already-confirmed tokens, and default-closed payment endpoints without live writes.
- No live Supabase/Stripe/email end-to-end test or production deployment was performed.
  Docker/Deno are not installed in this environment; see `supabase/tests/README.md` for
  the local integration suite and its explicit environment settings.
