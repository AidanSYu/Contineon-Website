/* =============================================================================
   Post-build prerender: emit dist/<route>/index.html for every public route
   with that route's head tags (title, description, canonical, Open Graph /
   Twitter card, JSON-LD) baked in, and regenerate dist/sitemap.xml from the
   same route list.

   Why: the site is a client-rendered SPA. Google executes JS and sees the
   React <Seo/> tags, but social unfurlers (Slack, iMessage, X, LinkedIn) and
   most LLM crawlers do not, without this step they all see the homepage meta
   on every URL. Static hosts (Cloudflare Pages, Vercel) serve these files
   before falling back to the SPA shell, so no server is involved.

   How: dist/index.html is the template. Every tag stamped `data-ssg` gets
   rewritten per route; the React <Seo/> removes `[data-ssg]` tags on mount so
   the SPA's own head tags take over after hydration.

   KEEP THE ROUTE LIST IN SYNC with each page's <Seo> props (title/description)
   and with App.tsx when routes are added or removed. Blog posts are read from
   src/content/posts.ts automatically. The script throws when a template
   pattern stops matching, so drift fails the build instead of shipping stale
   tags.

   No dependencies, no browser: runs on any CI with Node alone.
   ============================================================================= */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const DIST = 'dist';
const SITE_URL = 'https://contineon.com';
const DEFAULT_IMAGE = `${SITE_URL}/images/og-card.jpg`;

const ORGANIZATION = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Contineon',
  url: `${SITE_URL}/`,
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/brand/contineon-mark-black.png` },
};
const WEBSITE = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'Contineon',
  url: `${SITE_URL}/`,
  publisher: { '@id': `${SITE_URL}/#organization` },
};
const BASE_JSONLD = { '@context': 'https://schema.org', '@graph': [ORGANIZATION, WEBSITE] };

/** Public routes. title/description mirror each page's <Seo> props. */
const STATIC_ROUTES = [
  {
    path: '/',
    title: 'Contineon, industrializing breakthrough science',
    description:
      'Contineon builds the autonomous laboratory: foundational models that design an experiment, run it on real instruments, learn from the result, and choose what to run next. The first is Asilia.',
    changefreq: 'weekly',
    priority: '1.0',
  },
  {
    path: '/asilia',
    title: 'Asilia, Contineon',
    description:
      "Asilia is Contineon's system for autonomous science: it plans real experiments, runs them on real instruments, and learns from every result. Today it ships as the Asilia Framework and the open Asilia SDK.",
    changefreq: 'weekly',
    priority: '0.9',
  },
  {
    path: '/asilia/framework',
    title: 'Asilia Framework, Contineon',
    description:
      'The Asilia Framework is the autonomous lab system: it plans a campaign, runs it on the instruments you already have, hands work back when it needs you, and remembers everything it learns.',
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    path: '/asilia/sdk',
    title: 'Asilia SDK, Contineon',
    description:
      'Everything you need to build for Asilia: asilia-protocol, the open typed contract for autonomous-lab software, and the asilia CLI that scaffolds, builds, signs, and verifies .asilia plugin packages. Open source, Apache-2.0.',
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    path: '/asilia/docs',
    title: 'Documentation, Asilia',
    description:
      'Asilia documentation: get started with the Asilia Framework and Asilia SDK, learn the autonomous loop, and connect the lab you already run.',
    changefreq: 'monthly',
    priority: '0.7',
  },
  {
    path: '/asilia/news',
    title: 'News, Asilia',
    description:
      "What's new in Asilia: product updates, SDK previews, and announcements from Contineon's autonomous lab system.",
    changefreq: 'weekly',
    priority: '0.6',
  },
  {
    path: '/mission',
    title: 'Mission, Contineon',
    description:
      'Discovery runs at the speed of the people doing it. Contineon builds the system that lets a lab run and learn on its own, so the answers we need stop having to wait.',
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    path: '/technology/foundation-models',
    title: 'Foundation Models, Contineon',
    description:
      'The foundational models that reason about experiments: they propose the run, read the result, and decide what comes next.',
    changefreq: 'monthly',
    priority: '0.5',
  },
  {
    path: '/technology/autonomous-discovery',
    title: 'Autonomous Discovery, Contineon',
    description:
      'Research that pushes past the Asilia product into open-ended, self-directed scientific discovery.',
    changefreq: 'monthly',
    priority: '0.5',
  },
  {
    path: '/news',
    title: 'News, Contineon',
    description:
      'Announcements, research notes, and launch updates from the team building the self-driving lab that remembers.',
    changefreq: 'weekly',
    priority: '0.7',
  },
  {
    path: '/docs',
    title: 'Integration guide, Contineon',
    description:
      'How Asilia connects to the instruments, ELN, and data you already run, and how a campaign goes from objective to compounding memory.',
    changefreq: 'monthly',
    priority: '0.7',
  },
  {
    path: '/faq',
    title: 'FAQ, Contineon',
    description:
      'Answers to common questions about Asilia: instruments and integrations, data privacy and security, setup time, and how to get access.',
    changefreq: 'monthly',
    priority: '0.7',
  },
  {
    path: '/security',
    title: 'Security & Trust, Contineon',
    description:
      'Current website security controls, service providers, and the review needed before an Asilia pilot.',
    changefreq: 'monthly',
    priority: '0.7',
  },
  {
    path: '/changelog',
    title: 'Changelog, Contineon',
    description: 'What\u2019s new in Contineon and the Asilia platform.',
    changefreq: 'weekly',
    priority: '0.5',
  },
  {
    path: '/contact',
    title: 'Contact, Contineon',
    description:
      'Talk to the Contineon team about retrofitting your lab with Asilia. Book a demo or ask about an enterprise deployment.',
    changefreq: 'yearly',
    priority: '0.6',
  },
  {
    path: '/terms',
    title: 'Website Terms, Contineon',
    description: 'Terms for using the Contineon website and requesting early access.',
    changefreq: 'yearly',
    priority: '0.3',
  },
  {
    path: '/privacy',
    title: 'Privacy Notice, Contineon',
    description: 'How the Contineon website handles inquiries, newsletter subscriptions, and account information.',
    changefreq: 'yearly',
    priority: '0.3',
  },
];

/* ---------- Blog posts, parsed from src/content/posts.ts ------------------- */

function readPosts() {
  const src = readFileSync('src/content/posts.ts', 'utf8');
  const posts = [];
  const entry =
    /slug:\s*'((?:[^'\\]|\\.)*)'[\s\S]*?title:\s*'((?:[^'\\]|\\.)*)'[\s\S]*?date:\s*'((?:[^'\\]|\\.)*)'[\s\S]*?excerpt:\s*'((?:[^'\\]|\\.)*)'/g;
  let m;
  while ((m = entry.exec(src)) !== null) {
    const unesc = (s) => s.replace(/\\(['\\])/g, '$1');
    posts.push({ slug: unesc(m[1]), title: unesc(m[2]), date: m[3], excerpt: unesc(m[4]) });
  }
  if (posts.length === 0) throw new Error('prerender: no posts parsed from src/content/posts.ts');
  return posts;
}

const postRoutes = readPosts().map((p) => ({
  path: `/news/${p.slug}`,
  title: `${p.title}, Contineon`,
  description: p.excerpt,
  changefreq: 'monthly',
  priority: '0.6',
  lastmod: p.date,
  article: p,
}));

const ROUTES = [...STATIC_ROUTES, ...postRoutes];

/* ---------- HTML transformation ------------------------------------------- */

const escAttr = (s) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const template = readFileSync(join(DIST, 'index.html'), 'utf8');

/** Replace a data-ssg tag's content; throw if the template no longer matches. */
function sub(html, re, replacer) {
  if (!re.test(html)) throw new Error(`prerender: template pattern not found: ${re}`);
  return html.replace(re, replacer);
}

function setMetaContent(html, attrSelector, value) {
  const re = new RegExp(`(<meta ${attrSelector} content=")[^"]*(" data-ssg\\s*/?>)`);
  return sub(html, re, (_, a, b) => a + escAttr(value) + b);
}

function renderRoute(route) {
  const url = SITE_URL + (route.path === '/' ? '/' : route.path);
  let html = template;

  html = sub(
    html,
    /<title data-ssg>[\s\S]*?<\/title>/,
    `<title data-ssg>${escText(route.title)}</title>`,
  );
  html = setMetaContent(html, 'name="description"', route.description);
  html = sub(
    html,
    /(<link rel="canonical" href=")[^"]*(" data-ssg\s*\/?>)/,
    (_, a, b) => a + url + b,
  );
  html = setMetaContent(html, 'property="og:type"', route.article ? 'article' : 'website');
  html = setMetaContent(html, 'property="og:title"', route.title);
  html = setMetaContent(html, 'property="og:description"', route.description);
  html = setMetaContent(html, 'property="og:url"', url);
  html = setMetaContent(html, 'property="og:image"', DEFAULT_IMAGE);
  html = setMetaContent(html, 'property="og:image:alt"', route.title);
  html = setMetaContent(html, 'name="twitter:title"', route.title);
  html = setMetaContent(html, 'name="twitter:description"', route.description);
  html = setMetaContent(html, 'name="twitter:image"', DEFAULT_IMAGE);

  if (route.article) {
    html = sub(
      html,
      /<meta name="twitter:card"/,
      `<meta property="article:published_time" content="${route.article.date}" data-ssg />\n    <meta name="twitter:card"`,
    );
  }

  const jsonld = route.article
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          ORGANIZATION,
          WEBSITE,
          {
            '@type': 'BlogPosting',
            headline: route.article.title,
            description: route.article.excerpt,
            datePublished: route.article.date,
            dateModified: route.article.date,
            url,
            image: DEFAULT_IMAGE,
            author: { '@id': `${SITE_URL}/#organization` },
            publisher: { '@id': `${SITE_URL}/#organization` },
            mainEntityOfPage: url,
          },
        ],
      }
    : BASE_JSONLD;
  html = sub(
    html,
    /<script type="application\/ld\+json" data-ssg>[\s\S]*?<\/script>/,
    `<script type="application/ld+json" data-ssg>${JSON.stringify(jsonld)}</script>`,
  );

  return html;
}

/* ---------- Emit files ----------------------------------------------------- */

if (!existsSync(join(DIST, 'index.html'))) {
  throw new Error('prerender: dist/index.html not found, run vite build first');
}

let count = 0;
for (const route of ROUTES) {
  const outFile =
    route.path === '/' ? join(DIST, 'index.html') : join(DIST, route.path.slice(1), 'index.html');
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, renderRoute(route));
  count += 1;
}

/* ---------- Sitemap, generated from the same route list -------------------- */

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map((r) => {
  const loc = SITE_URL + (r.path === '/' ? '/' : r.path);
  const lastmod = r.lastmod ? `\n    <lastmod>${r.lastmod}</lastmod>` : '';
  return `  <url>\n    <loc>${loc}</loc>${lastmod}\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`;
}).join('\n')}
</urlset>
`;
writeFileSync(join(DIST, 'sitemap.xml'), sitemap);

console.log(`prerender: wrote ${count} routes + sitemap.xml`);
