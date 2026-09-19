import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Seo, JsonLd, ORGANIZATION_JSONLD, SITE_URL } from '@/components/Seo';
import { Magnetic, ParticleField } from '@/components/motion';
import { Cta } from '@/components/marketing/ui';
import { GridField } from '@/components/marketing/visuals';
import { AsciiMedia } from '@/components/marketing/AsciiMedia';
import { InteractiveAscii } from '@/components/marketing/InteractiveAscii';
import { MediaCredit } from '@/components/marketing/MediaCredit';
import { CREDITS, type MediaCreditInfo } from '@/lib/mediaCredits';
import { gsap, useGSAP, SplitText } from '@/lib/gsap';
import { cn } from '@/lib/utils';

/* =============================================================================
   Landing — Contineon. A short cinematic mission piece. The open, the hook,
   what we actually build, the call. Each screen one idea, one distinct medium:
   ISS video, a generative loom, the ASCII sun, a photographic still. The poetry
   hooks; the specifics make it real. One typeface, one accent, all obsidian.
   ============================================================================= */

/* Cinematic still with a gentle scroll parallax. */
function ParallaxImage({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const image = ref.current;
    if (!image || nearViewport) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setNearViewport(true);
        observer.disconnect();
      },
      { rootMargin: '100% 0px' },
    );
    observer.observe(image);
    return () => observer.disconnect();
  }, [nearViewport]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (ref.current) {
          gsap.to(ref.current, {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
          });
        }
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  // The UI source is VP8L lossless: pixel-identical to the PNG at a smaller transfer size.
  return (
    <img
      ref={ref}
      src={nearViewport ? src : undefined}
      alt=""
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      className={cn('h-full w-full object-contain object-center', className)}
    />
  );
}

/* A full-bleed cinematic beat: media behind, one statement in front. The
   headline reveals word by word on scroll; supporting lines fade up after. */
function Beat({
  media,
  children,
  minH = 'min-h-[92svh]',
}: {
  media: ReactNode;
  children: ReactNode;
  minH?: string;
}) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const title = root.current?.querySelector('[data-beat-title]');
        if (title) {
          const split = new SplitText(title, { type: 'lines,words', linesClass: 'overflow-hidden pb-[0.1em]' });
          gsap.from(split.words, {
            yPercent: 122,
            duration: 0.8,
            ease: 'power4.out',
            stagger: 0.028,
            scrollTrigger: { trigger: title, start: 'top 88%', once: true },
          });
        }
        const fades = root.current?.querySelectorAll('[data-beat-fade]');
        if (fades?.length) {
          gsap.from(fades, {
            opacity: 0,
            y: 18,
            duration: 0.65,
            ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: { trigger: root.current, start: 'top 64%', once: true },
          });
        }
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className={cn('dark relative flex items-center overflow-hidden bg-[#06080B] text-ink', minH)}>
      {media}
      <div className="site-shell relative z-10 py-[clamp(80px,12vw,170px)]">
        {children}
      </div>
    </section>
  );
}

/* ---------------------------------- Hero ----------------------------------- */

/* Candidate hero films, switchable via ?hero= while we decide which one ships.
   orbit   — the original NASA EXPLORE clip (320p source, upscaled).
   descent — cosmos → sun → Earth → city night → the lab. One continuous fall.
   dot     — Pale Blue Dot remastered: same arc as orbit but cut from 1080p
             footage, with Sagan's lines set live in our own type (below).
   lab     — the A-Lab arm in graded slow motion. No space at all. */
type HeroVariant = {
  src: string;
  poster: string;
  /** Lines shown once over the open, before the title reveals. */
  intro?: string[];
  /** Attribution overlay — only the variants that include CC BY footage.
      The NASA material (orbit, dot, the space half of descent) is public
      domain and needs none. */
  credit?: MediaCreditInfo;
};

const HERO_VARIANTS: Record<string, HeroVariant> = {
  orbit: { src: '/images/iss-hero.mp4', poster: '/images/iss-hero-poster.jpg' },
  descent: {
    src: '/images/hero-descent.mp4',
    poster: '/images/hero-descent-poster.jpg',
    credit: CREDITS.aLabR1, // the descent ends on the A-Lab shot
  },
  dot: {
    src: '/images/hero-dot.mp4',
    poster: '/images/hero-dot-poster.jpg',
    intro: ['Consider again that dot.', 'That’s here. That’s home. That’s us.'],
  },
  lab: { src: '/images/hero-lab.mp4', poster: '/images/hero-lab-poster.jpg', credit: CREDITS.aLabR1 },
};

function Hero() {
  const root = useRef<HTMLElement>(null);
  const media = useRef<HTMLVideoElement>(null);
  const [params] = useSearchParams();
  const variant = HERO_VARIANTS[params.get('hero') ?? ''] ?? HERO_VARIANTS.orbit;
  const introLines = variant.intro;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Pause the hero video once it's scrolled off-screen — otherwise the 8MB clip keeps
  // decoding behind every section below the fold, competing for the main thread the whole
  // time you're reading the rest of the page.
  useEffect(() => {
    const video = media.current;
    if (!video) return;
    if (reduceMotion) {
      video.pause();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.style.willChange = 'transform';
          video.play().catch(() => {});
        } else {
          video.pause();
          video.style.willChange = 'auto';
        }
      },
      { threshold: 0.05 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [reduceMotion]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // The Sagan lines play once over a dimmed open; the title waits for them.
        // Under reduced motion this block never runs, so the overlay stays hidden
        // and the title appears on its usual schedule.
        const intro = root.current?.querySelector('[data-hero-intro]');
        if (intro && introLines) {
          const lines = intro.querySelectorAll('[data-hero-intro-line]');
          gsap
            .timeline()
            .set(intro, { autoAlpha: 1 })
            .fromTo(lines[0], { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.5)
            .to(lines[0], { opacity: 0, y: -18, duration: 0.6, ease: 'power2.in' }, 3.1)
            .fromTo(lines[1], { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 3.7)
            .to(lines[1], { opacity: 0, y: -18, duration: 0.6, ease: 'power2.in' }, 6.3)
            .to(intro, { autoAlpha: 0, duration: 0.5 }, 6.8);
        }
        const titleDelay = intro && introLines ? 7.1 : 0.1;
        const title = root.current?.querySelector('[data-hero-title]');
        if (title) {
          const split = new SplitText(title, { type: 'lines,words', linesClass: 'overflow-hidden pb-[0.1em]' });
          gsap.from(split.words, { yPercent: 120, duration: 0.8, ease: 'power4.out', stagger: 0.028, delay: titleDelay });
        }
        gsap.from('[data-hero-fade]', { opacity: 0, y: 16, duration: 0.65, ease: 'power3.out', stagger: 0.08, delay: titleDelay + 0.4 });
        if (media.current) {
          gsap.fromTo(
            media.current,
            { scale: 1.06 },
            {
              scale: 1.16,
              duration: 18,
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
              scrollTrigger: {
                trigger: root.current,
                start: 'top bottom',
                end: 'bottom top',
                toggleActions: 'play pause resume pause',
              },
            },
          );
          gsap.to(media.current, {
            yPercent: 16,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
          });
        }
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [variant.src], revertOnUpdate: true },
  );

  return (
    <section ref={root} className="dark relative flex min-h-[100svh] items-end overflow-hidden bg-[#06080B] text-ink">
      <div className="absolute inset-0">
        <video
          key={variant.src}
          ref={media}
          className="h-[118%] w-full object-cover [filter:saturate(1.14)_contrast(1.08)_brightness(1.02)]"
          autoPlay={!reduceMotion}
          muted
          loop
          playsInline
          preload={reduceMotion ? 'metadata' : 'auto'}
          poster={variant.poster}
        >
          <source src={variant.src} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#06080B]/25 via-transparent to-[#06080B]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06080B]/75 via-[#06080B]/10 to-transparent" />
      </div>
      <ParticleField className="pointer-events-none absolute inset-0 z-[1]" />
      <GridField className="opacity-[0.5]" />

      {introLines && (
        <div
          data-hero-intro
          className="pointer-events-none invisible absolute inset-0 z-30 flex items-center justify-center bg-[#06080B]/70"
        >
          <div className="grid place-items-center px-6 text-center">
            {introLines.map((line) => (
              <p
                key={line}
                data-hero-intro-line
                className="[grid-area:1/1] max-w-4xl text-[clamp(24px,3vw,58px)] font-medium leading-snug tracking-[-0.03em] text-white/95 opacity-0"
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="site-shell relative z-10 pb-20 pt-32">
        <div className="max-w-5xl 2xl:max-w-none">
          <h1
            data-hero-title
            className="text-[clamp(38px,8vw,176px)] font-bold leading-[0.9] tracking-[-0.05em]"
          >
            <span className="block">Industrializing</span>
            <span className="block">Breakthrough</span>
            <span className="block">Science.</span>
          </h1>
          <div data-hero-fade className="mt-10 flex flex-wrap items-center gap-3">
            <Magnetic>
              <Cta to="/asilia" variant="outlineLight">
                See Asilia <ArrowRight className="h-4 w-4" />
              </Cta>
            </Magnetic>
          </div>
        </div>
      </div>

      {variant.credit && <MediaCredit credit={variant.credit} />}
    </section>
  );
}

/* --------------------------------- Page ------------------------------------ */
export function LandingPage() {
  return (
    <>
      <Seo
        title="Contineon, industrializing breakthrough science"
        description="Contineon builds the autonomous laboratory: foundational models that design an experiment, run it on real instruments, learn from the result, and choose what to run next. The first is Asilia."
        path="/"
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            ORGANIZATION_JSONLD,
            {
              '@type': 'WebSite',
              '@id': `${SITE_URL}/#website`,
              name: 'Contineon',
              url: `${SITE_URL}/`,
              publisher: { '@id': `${SITE_URL}/#organization` },
            },
          ],
        }}
      />

      <Hero />

      {/* The hook — a bespoke loom, not another Earth video */}
      <Beat
        media={
          <>
            <InteractiveAscii
              src="/images/mill.opt.mp4"
              poster="/images/mill-poster.jpg"
              cols={124}
              speed={2.5}
              className="absolute inset-0"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#06080B] via-[#06080B]/40 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06080B]/60 via-transparent to-[#06080B]/25" />
          </>
        }
      >
        <h2
          data-beat-title
          className="max-w-5xl text-[clamp(36px,6.6vw,142px)] font-bold leading-[0.96] tracking-[-0.05em] 2xl:max-w-[72rem]"
        >
          Science never had its industrial revolution.
        </h2>
        <p
          data-beat-fade
          className="mt-8 max-w-3xl text-[clamp(18px,1.7vw,31px)] font-medium leading-snug text-white/80 2xl:max-w-[52rem]"
        >
          It is still done by hand. One result at a time. The way cloth was made before the loom.
        </p>
      </Beat>

      {/* What we build — the specifics, the proof it is real */}
      <Beat
        minH="min-h-[98svh]"
        media={
          <>
            <AsciiMedia
              src="/images/sun-sdo.opt.mp4"
              type="video"
              poster="/images/sun-sdo-poster.jpg"
              cols={140}
              speed={2.5}
              fps={20}
              tint="ember"
              contrast={1.4}
              className="absolute inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#06080B] via-[#06080B]/20 to-[#06080B]/85" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#06080B]/90 via-[#06080B]/10 to-transparent" />
            <GridField className="opacity-25" />
          </>
        }
      >
        <h2
          data-beat-title
          className="max-w-5xl text-[clamp(36px,6.6vw,142px)] font-bold leading-[0.96] tracking-[-0.05em] 2xl:max-w-[72rem]"
        >
          We are building the invention factory.
        </h2>
        <p
          data-beat-fade
          className="mt-8 max-w-3xl text-[clamp(18px,1.7vw,31px)] font-medium leading-snug text-white/80 2xl:max-w-[52rem]"
        >
          Foundational model systems that design an experiment, run it on real instruments, learn from
          the result, and choose what to run next. On their own. At machine speed,{' '}
          <span className="text-safety">in every existing lab.</span>
        </p>
      </Beat>

      {/* The call — specific, direct, one CTA */}
      <Beat
        minH="min-h-[90svh]"
        media={
          <>
            <div className="absolute inset-0">
              <ParallaxImage src="/images/sr71-quote-wide.webp" className="object-cover object-center opacity-100 [filter:saturate(1.22)_contrast(1.32)_brightness(1.18)]" />
            </div>
            {/* Soft scrim pooled behind the left-aligned copy (radial, not a directional
                wipe) — keeps text legible without a black bar sliding in from the edge. */}
            <div className="absolute inset-0 bg-[radial-gradient(75%_85%_at_20%_50%,rgba(6,8,11,0.8),transparent_62%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#06080B]/25 via-transparent to-[#06080B]/42" />
            <GridField className="opacity-20" />
          </>
        }
      >
        <h2
          data-beat-title
          className="max-w-4xl text-[clamp(34px,5.6vw,120px)] font-bold leading-[0.98] tracking-[-0.05em] 2xl:max-w-[64rem]"
        >
          Come build it with us.
        </h2>
        <p data-beat-fade className="mt-8 max-w-2xl text-[clamp(16px,1.5vw,27px)] leading-relaxed text-white/65 2xl:max-w-3xl">
          We are a small team of researchers and engineers. If you build foundational models,
          autonomous systems, or the instruments they run on, we want to talk.
        </p>
        <div data-beat-fade className="mt-10">
          <Magnetic>
            <Cta to="/contact?topic=partner" variant="accent">
              Request access <ArrowRight className="h-4 w-4" />
            </Cta>
          </Magnetic>
        </div>
      </Beat>
    </>
  );
}
