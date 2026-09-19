/* =============================================================================
   Seo, per-route head tags. React 19 hoists <title>/<meta>/<link> to <head>,
   so dropping <Seo/> at the top of a page sets a consistent title, description,
   canonical URL, and Open Graph / Twitter card for that route.

   The static index.html (and the prerendered per-route copies emitted by
   scripts/prerender.mjs) carry the same tags stamped with `data-ssg` for
   crawlers that don't run JS. When a <Seo/> mounts, it removes those static
   tags so React's tags are the single source of truth from then on (otherwise
   browsers keep reading the FIRST <title> in the document and client-side
   navigations would show a stale tab title).
   ============================================================================= */

import { useEffect } from 'react';

export const SITE_URL = 'https://contineon.com';
export const SITE_NAME = 'Contineon';
const DEFAULT_IMAGE = '/images/og-card.jpg';
const DEFAULT_IMAGE_ALT = 'Contineon, industrializing breakthrough science';

export function absolute(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/** Render a JSON-LD block. Valid anywhere in the document, Google reads both. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

/**
 * Head tags for pages that must stay out of search indexes (auth, app, 404).
 * Lighter than <Seo/>: no canonical, no social card, just the directive and an
 * optional tab title.
 */
export function NoIndex({ title }: { title?: string }) {
  useEffect(() => {
    document.querySelectorAll('[data-ssg]').forEach((el) => el.remove());
  }, []);
  return (
    <>
      {title && <title>{title}</title>}
      <meta name="robots" content="noindex, nofollow" />
    </>
  );
}

/** Reusable Organization node for structured data. */
export const ORGANIZATION_JSONLD = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/brand/contineon-mark-black.png`,
  },
} as const;

export function Seo({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  imageAlt = DEFAULT_IMAGE_ALT,
  type = 'website',
  noindex = false,
  publishedTime,
  modifiedTime,
}: {
  title: string;
  description: string;
  /** Route path, e.g. "/mission". Used for canonical + og:url. */
  path: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  /** Keep this route out of search indexes (auth, app, 404). */
  noindex?: boolean;
  /** ISO date for articles, e.g. '2026-06-23'. Emitted as article:published_time. */
  publishedTime?: string;
  modifiedTime?: string;
}) {
  const url = absolute(path);
  const img = absolute(image);

  // Retire the static (prerendered) head tags once React's are live.
  useEffect(() => {
    document.querySelectorAll('[data-ssg]').forEach((el) => el.remove());
  }, []);

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {!noindex && <link rel="canonical" href={url} />}
      <meta
        name="robots"
        content={
          noindex
            ? 'noindex, nofollow'
            : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        }
      />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta property="og:image:alt" content={imageAlt} />
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && (modifiedTime ?? publishedTime) && (
        <meta property="article:modified_time" content={modifiedTime ?? publishedTime} />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
      <meta name="twitter:image:alt" content={imageAlt} />
    </>
  );
}
