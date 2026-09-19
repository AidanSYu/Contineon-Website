import { useEffect, useRef, useState, type ReactNode } from 'react';
import { gsap, useGSAP, SplitText } from '@/lib/gsap';
import { MediaCredit } from '@/components/marketing/MediaCredit';
import type { MediaCreditInfo } from '@/lib/mediaCredits';
import { cn } from '@/lib/utils';

/* Shared cinematic primitives for every page of the standalone Asilia site
   (overview, Framework, SDK, Docs, News). Full-bleed graded media + the
   SplitText/fade section shell, all obsidian. Extracted from the original
   single-page AsiliaPage so the detail pages render identically. */

/* Full-bleed cinematic media (video or still) with the instrument-feed grade,
   ember key-light, optional scan-sweep, and legibility scrims. Pauses off-screen. */
export function Cinematic({
  video,
  poster,
  image,
  grade = 'saturate(1.12) contrast(1.07) brightness(0.98)',
  scan = false,
  frame = false,
  eager = false,
  credit,
}: {
  video?: string;
  poster?: string;
  image?: string;
  grade?: string;
  scan?: boolean;
  frame?: boolean;
  /** Reserve eager loading for media visible in the first viewport. */
  eager?: boolean;
  /** Attribution overlay — pass only when the media's license requires it. */
  credit?: MediaCreditInfo;
}) {
  const root = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLVideoElement | HTMLImageElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const ambientAnimations = useRef<ReturnType<typeof gsap.to>[]>([]);
  const isVisible = useRef(false);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const shouldLoad = eager || isNearViewport;

  useEffect(() => {
    if (eager || isNearViewport) return;

    const el = root.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      const frameId = window.requestAnimationFrame(() => setIsNearViewport(true));
      return () => window.cancelAnimationFrame(frameId);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsNearViewport(true);
        io.disconnect();
      },
      { rootMargin: '75% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager, isNearViewport]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const setActive = (active: boolean) => {
      isVisible.current = active;

      const mediaElement = media.current;
      if (mediaElement) mediaElement.style.willChange = active ? 'transform' : 'auto';
      if (mediaElement instanceof HTMLVideoElement) {
        if (active) mediaElement.play().catch(() => {});
        else mediaElement.pause();
      }

      ambientAnimations.current.forEach((animation) => animation.paused(!active));
    };

    if (typeof IntersectionObserver === 'undefined') {
      setActive(true);
      return () => setActive(false);
    }

    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.01 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      setActive(false);
    };
  }, []);

  useEffect(() => {
    const el = media.current;
    if (!shouldLoad || !(el instanceof HTMLVideoElement)) return;

    if (isVisible.current) el.play().catch(() => {});
  }, [eager, shouldLoad, video]);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const animations: ReturnType<typeof gsap.to>[] = [];
      if (media.current) {
        animations.push(
          gsap.fromTo(
            media.current,
            { scale: 1.05 },
            { scale: 1.14, duration: 20, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true },
          ),
        );
      }
      if (scan && scanRef.current) {
        animations.push(
          gsap.fromTo(
            scanRef.current,
            { yPercent: -120 },
            { yPercent: 520, duration: 7, ease: 'none', repeat: -1, repeatDelay: 3.5, paused: true },
          ),
        );
      }
      ambientAnimations.current = animations;
      if (isVisible.current) animations.forEach((animation) => animation.resume());

      return () => {
        if (ambientAnimations.current === animations) ambientAnimations.current = [];
      };
    });
    return () => {
      ambientAnimations.current = [];
      mm.revert();
    };
  });

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden">
      {video ? (
        <video
          ref={media as React.RefObject<HTMLVideoElement>}
          className="h-full w-full object-cover will-change-transform"
          style={{ filter: grade }}
          autoPlay={eager}
          muted
          loop
          playsInline
          src={shouldLoad ? video : undefined}
          poster={shouldLoad ? poster : undefined}
          preload={shouldLoad ? 'auto' : 'none'}
        />
      ) : (
        <img
          ref={media as React.RefObject<HTMLImageElement>}
          src={shouldLoad ? image : undefined}
          alt=""
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={eager ? 'high' : 'low'}
          className="h-full w-full object-cover will-change-transform"
          style={{ filter: grade }}
        />
      )}

      {/* ember key-light from the upper right */}
      <div className="pointer-events-none absolute inset-0 mix-blend-screen bg-[radial-gradient(120%_90%_at_85%_12%,rgba(242,97,58,0.13),transparent_55%)]" />
      {scan && (
        <div
          ref={scanRef}
          className="pointer-events-none absolute inset-x-0 top-0 h-[24%] mix-blend-screen bg-gradient-to-b from-transparent via-[#F2613A]/[0.09] to-transparent"
        />
      )}
      {/* legibility scrims */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#06080B]/45 via-[#06080B]/20 to-[#06080B]/92" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#06080B]/70 via-[#06080B]/10 to-transparent" />
      {frame && (
        <div className="pointer-events-none absolute inset-[20px] z-[3] hidden md:block">
          <span className="absolute left-0 top-0 h-5 w-5 border-l border-t border-white/20" />
          <span className="absolute right-0 top-0 h-5 w-5 border-r border-t border-white/20" />
          <span className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-white/20" />
          <span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-white/20" />
        </div>
      )}
      {credit && <MediaCredit credit={credit} />}
    </div>
  );
}

/* A section that reveals its [data-title] word-by-word and fades [data-fade] up. */
export function Section({
  media,
  children,
  minH = 'min-h-[92svh]',
  className,
  id,
}: {
  media?: ReactNode;
  children: ReactNode;
  minH?: string;
  className?: string;
  id?: string;
}) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const title = root.current?.querySelector('[data-title]');
        if (title) {
          const split = new SplitText(title, {
            type: 'lines,words',
            linesClass: 'overflow-hidden pb-[0.1em]',
          });
          gsap.from(split.words, {
            yPercent: 122,
            duration: 0.85,
            ease: 'power4.out',
            stagger: 0.025,
            scrollTrigger: { trigger: title, start: 'top 86%' },
          });
        }
        const fades = root.current?.querySelectorAll('[data-fade]');
        if (fades?.length) {
          gsap.from(fades, {
            opacity: 0,
            y: 18,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: { trigger: root.current, start: 'top 60%' },
          });
        }
      });
      return () => mm.revert();
    },
    { scope: root },
  );
  return (
    <section
      ref={root}
      id={id}
      className={cn(
        'dark relative flex items-center overflow-hidden bg-[#06080B] text-ink',
        minH,
        className,
      )}
    >
      {media}
      <div className="site-shell relative z-10 py-[clamp(80px,11vw,150px)]">
        {children}
      </div>
    </section>
  );
}

/* Shared content links used across the Asilia site. */
export const ASILIA_URL = '/login';
