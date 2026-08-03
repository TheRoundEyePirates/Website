import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

interface Variant {
  from: gsap.TweenVars;
  ease: string;
}

/**
 * Entrance variants for `data-animate`. The attribute value selects the
 * variant (e.g. `data-animate="slide-right"`); a bare `data-animate`
 * defaults to a gentle fade-up.
 */
const VARIANTS: Record<string, Variant> = {
  'fade-up': { from: { opacity: 0, y: 40 }, ease: 'power3.out' },
  'fade-in': { from: { opacity: 0 }, ease: 'power2.out' },
  'slide-left': { from: { opacity: 0, x: -56 }, ease: 'power3.out' },
  'slide-right': { from: { opacity: 0, x: 56 }, ease: 'power3.out' },
  scale: { from: { opacity: 0, scale: 0.92 }, ease: 'back.out(1.6)' },
  blur: { from: { opacity: 0, filter: 'blur(10px)', y: 16 }, ease: 'power3.out' },
};

const DEFAULT_DURATION = 0.9;

/**
 * Global scroll engine:
 *  - `[data-animate]`  entrance reveals with variants (see above), plus
 *    optional `data-y`, `data-x`, `data-delay`, `data-duration`, `data-ease`.
 *  - `[data-stagger]`  animates its DIRECT children in a wave (`data-stagger`
 *    sets the interval).
 *  - `[data-hero-scrub]` drifts + fades as the hero scrolls away.
 *  - `[data-parallax]` drifts vertically against the scroll direction.
 *  - `[data-draw]` grows a vertical line as you scroll (timeline rule).
 * Respects `prefers-reduced-motion`.
 */
export default function Animate() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const triggers: ScrollTrigger[] = [];
    const track = (trigger: ScrollTrigger | undefined) => {
      if (trigger) triggers.push(trigger);
    };

    // ── Staggered groups ─────────────────────────────────────────────
    gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((container) => {
      const children = Array.from(container.children) as HTMLElement[];
      if (children.length === 0) return;

      const stagger = Number(container.dataset.stagger ?? 0.12);
      const delay = Number(container.dataset.delay ?? 0);
      const duration = Number(container.dataset.duration ?? DEFAULT_DURATION);

      const tween = gsap.fromTo(
        children,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration,
          ease: 'power3.out',
          stagger,
          delay,
          scrollTrigger: {
            trigger: container,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        },
      );
      track(tween.scrollTrigger);
    });

    // ── Individual reveals ───────────────────────────────────────────
    gsap.utils.toArray<HTMLElement>('[data-animate]').forEach((el) => {
      if (el.closest('[data-stagger]')) return;

      const variant = VARIANTS[el.dataset.animate ?? 'fade-up'] ?? VARIANTS['fade-up'];
      const from: gsap.TweenVars = { ...variant.from };
      if (el.dataset.y !== undefined) from.y = Number(el.dataset.y);
      if (el.dataset.x !== undefined) from.x = Number(el.dataset.x);

      const tween = gsap.fromTo(el, from, {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: Number(el.dataset.duration ?? DEFAULT_DURATION),
        ease: el.dataset.ease ?? variant.ease,
        delay: Number(el.dataset.delay ?? 0),
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
      track(tween.scrollTrigger);
    });

    // ── Hero scrub-out ───────────────────────────────────────────────
    gsap.utils.toArray<HTMLElement>('[data-hero-scrub]').forEach((el) => {
      const tween = gsap.to(el, {
        opacity: 0.15,
        y: 90,
        scale: 0.97,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
      track(tween.scrollTrigger);
    });

    // ── Parallax drift ───────────────────────────────────────────────
    gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
      const speed = Number(el.dataset.parallax ?? 0.5);
      const dist = Math.min(120 * speed, 140);
      const tween = gsap.fromTo(el, { y: -dist }, {
        y: dist,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
      track(tween.scrollTrigger);
    });

    // ── Vertical line draw ───────────────────────────────────────────
    gsap.utils.toArray<HTMLElement>('[data-draw]').forEach((el) => {
      const tween = gsap.fromTo(
        el,
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            end: 'bottom 40%',
            scrub: true,
          },
        },
      );
      track(tween.scrollTrigger);
    });

    const refresh = () => ScrollTrigger.refresh();
    const fontsReady = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
    fontsReady?.ready.then(refresh).catch(() => undefined);
    window.addEventListener('load', refresh);

    return () => {
      triggers.forEach((trigger) => trigger.kill());
      window.removeEventListener('load', refresh);
    };
  }, []);

  return null;
}
