import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Seo } from '@/components/Seo';

import { POSTS, formatDate } from '@/content/posts';

export function AsiliaNewsPage() {
  return (
    <>
      <Seo
        title="News, Asilia"
        description="What's new in Asilia: product updates, SDK previews, and announcements from Contineon's autonomous lab system."
        path="/asilia/news"
      />

      <div className="min-h-screen bg-[#06080B] pt-16 text-white">
        <div className="mx-auto max-w-3xl px-[5vw] py-16 lg:px-8">
          <header>
            <h1 className="text-[clamp(34px,5vw,92px)] font-bold leading-[1.0] tracking-[-0.04em]">
              What’s new in Asilia.
            </h1>
            <p className="mt-5 max-w-xl text-[clamp(16px,1.4vw,23px)] leading-relaxed text-white/60">
              Product updates, SDK previews, and announcements from the team building Asilia.
            </p>
          </header>

          <div className="mt-14 divide-y divide-white/10 border-y border-white/10">
            {POSTS.map((post) => (
              <article key={post.title} className="group py-8">
                <div className="flex items-center gap-3">
                  <span className="lab-label text-white/40">{formatDate(post.date)}</span>
                  <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[11px] font-medium text-white/60">
                    Perspective
                  </span>
                </div>
                <h2 className="mt-3 text-[clamp(20px,2.4vw,38px)] font-bold leading-[1.1] tracking-[-0.02em] text-white">
                  <Link to={`/news/${post.slug}`} className="hover:underline">{post.title}</Link>
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-white/60">{post.excerpt}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <p className="text-[15px] text-white/70">Looking for company-wide news?</p>
            <Link
              to="/news"
              className="mt-2 inline-flex items-center gap-1.5 text-[15px] font-medium text-white transition-opacity hover:opacity-70"
            >
              Visit the Contineon newsroom <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
