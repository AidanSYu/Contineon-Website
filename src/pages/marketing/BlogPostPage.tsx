import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Seo, JsonLd, ORGANIZATION_JSONLD, SITE_URL, absolute } from '@/components/Seo';
import { getPost, formatDate } from '@/content/posts';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function BlogPostPage() {
  const { slug } = useParams();
  const post = slug ? getPost(slug) : undefined;

  if (!post) return <NotFoundPage />;

  return (
    <div className="px-[5vw] pb-28 pt-32 lg:px-8 lg:pt-40">
      <Seo
        title={`${post.title}, Contineon`}
        description={post.excerpt}
        path={`/news/${post.slug}`}
        type="article"
        publishedTime={post.date}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.excerpt,
              datePublished: post.date,
              dateModified: post.date,
              url: absolute(`/news/${post.slug}`),
              image: absolute('/images/og-card.jpg'),
              author: { '@id': `${SITE_URL}/#organization` },
              publisher: ORGANIZATION_JSONLD,
              mainEntityOfPage: absolute(`/news/${post.slug}`),
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
                { '@type': 'ListItem', position: 2, name: 'News', item: `${SITE_URL}/news` },
                { '@type': 'ListItem', position: 3, name: post.title },
              ],
            },
          ],
        }}
      />

      <article className="mx-auto max-w-2xl">
        <Link to="/news" className="inline-flex items-center gap-1.5 font-mono-tech text-[11px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" /> All news
        </Link>

        <header className="mt-6 border-b border-line pb-8">
          <p className="font-mono-tech text-[11px] uppercase tracking-[0.14em] text-ink-faint">
            {formatDate(post.date)} · {post.readingMinutes} min read
          </p>
          <h1 className="mt-3 font-display text-[clamp(30px,4.4vw,48px)] font-bold leading-[1.08] tracking-tight text-ink">
            {post.title}
          </h1>
        </header>

        <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-ink-muted">
          {post.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
          <p className="font-display text-lg font-semibold text-ink">See it on your bench.</p>
          <div className="flex gap-3">
            <a href="/contact?topic=partner" className="inline-flex items-center justify-center rounded bg-safety px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-safety/90">
              Request access
            </a>
            <a href="/contact?topic=demo" className="inline-flex items-center justify-center rounded border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-line-hair">
              Book a demo
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
