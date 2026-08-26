import { useGSAP } from '@gsap/react';
import gsap, { PIRATE_EASE } from '../lib/gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Entrance variants for `data-animate`. The attribute value selects the
 * variant (e.g. `data-animate="slide-right"`); a bare `data-animate`
 * defaults to a gentle fade-up.
 */
const VARIANTS: Record<string, { from: gsap.TweenVars; ease: string }> = {
  'fade-up': { from: { opacity: 0, y: 40 }, ease: 'power3.out' },
  'fade-in': { from: { opacity: 0 }, ease: 'power2.out' },
  'slide-left': { from: { opacity: 0, x: -56 }, ease: 'power3.out' },
  'slide-right': { from: { opacity: 0, x: 56 }, ease: 'power3.out' },
  scale: { from: { opacity: 0, scale: 0.92 }, ease: 'back.out(1.6)' },
  blur: { from: { opacity: 0, filter: 'blur(10px)', y: 16 }, ease: 'power3.out' },
  tilt: {
    from: { opacity: 0, y: 28, rotationX: 16, transformPerspective: 900 },
    ease: 'power3.out',
  },
  pop: { from: { opacity: 0, scale: 0.6 }, ease: 'back.out(2.2)' },
  flip: {
    from: { opacity: 0, rotationY: 90, transformPerspective: 900 },
    ease: 'power4.out',
  },
  swing: { from: { opacity: 0, y: -20, rotation: -8 }, ease: 'elastic.out(1, 0.6)' },
  rise: { from: { opacity: 0, y: 72 }, ease: 'power2.out' },
  spin: { from: { opacity: 0, rotation: 120, scale: 0.8 }, ease: 'power4.out' },
  'flip-up': {
    from: { opacity: 0, rotationX: 90, transformPerspective: 900 },
    ease: 'back.out(1.4)',
  },
  zoom: { from: { opacity: 0, scale: 1.5 }, ease: 'power3.out' },
  skew: { from: { opacity: 0, x: -48, skewX: 10 }, ease: 'power2.out' },
  bounce: { from: { opacity: 0, y: -64 }, ease: 'bounce.out' },
  'reveal-left': {
    from: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
    ease: 'power3.inOut',
  },
  'reveal-right': {
    from: { opacity: 0, clipPath: 'inset(0 0 0 100%)' },
    ease: 'power3.inOut',
  },
  'reveal-up': {
    from: { opacity: 0, clipPath: 'inset(100% 0 0 0)' },
    ease: 'power3.inOut',
  },
  'reveal-down': {
    from: { opacity: 0, clipPath: 'inset(0 0 100% 0)' },
    ease: 'power3.inOut',
  },
  'typewriter': {
    from: { opacity: 0, filter: 'blur(4px)', letterSpacing: '0.4em' },
    ease: 'power2.out',
  },
  'wave': {
    from: { opacity: 0, y: 48, rotationX: -30, transformPerspective: 600 },
    ease: 'back.out(1.2)',
  },
  'glow': {
    from: { opacity: 0, scale: 0.95, filter: 'blur(6px) brightness(1.6)' },
    ease: 'power2.out',
  },
};

/**
 * Global scroll engine:
 *  - `[data-animate]`  entrance reveals with variants (see below), plus
 *    optional `data-y`, `data-x`, `data-delay`, `data-duration`, `data-ease`.
 *  - `[data-stagger]`  animates its DIRECT children in a wave (`data-stagger`
 *    sets the interval).
 *  - `[data-parallax]` drifts vertically against the scroll direction.
 *  - `[data-draw]` grows a vertical line as you scroll (timeline rule); if the
 *    element is an SVG shape, its stroke is drawn instead (DrawSVGPlugin).
 *  - `[data-split]`   splits text into words/chars and reveals them in a wave
 *    (`data-split="words"` or `"chars"`, default chars).
 *  - `[data-scramble]` scrambles text into place once it scrolls into view.
 *  - `a[href="#…"]`   smooth-scrolls to in-page anchors (ScrollToPlugin).
 * Respects `prefers-reduced-motion`.
 */
export default function Animate() {
  useGSAP(() => {
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
      const duration = Number(container.dataset.duration ?? 0.9);

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
        rotation: 0,
        rotationX: 0,
        rotationY: 0,
        skewX: 0,
        filter: 'blur(0px)',
        duration: Number(el.dataset.duration ?? 0.9),
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

    // ── Vertical line / SVG stroke draw ──────────────────────────────
    gsap.utils.toArray<HTMLElement>('[data-draw]').forEach((el) => {
      const drawable = el.matches
        ? (el.matches('path, line, circle, rect, ellipse, polygon, polyline')
            ? el
            : el.querySelector<SVGPathElement>(
                'path, line, circle, rect, ellipse, polygon, polyline',
              ))
        : null;

      if (drawable) {
        gsap.fromTo(
          drawable,
          { drawSVG: '0%' },
          {
            drawSVG: '100%',
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top 92%',
              end: 'bottom 40%',
              scrub: true,
            },
          },
        );
        return;
      }

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

    // ── Split-text reveals ───────────────────────────────────────────
    gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
      if (el.closest('[data-stagger]')) return;

      const type = el.dataset.split === 'words' ? 'words' : 'chars';
      const split = new SplitText(el, { type });
      const targets = (split[type] ?? []) as HTMLElement[];

      const tween = gsap.fromTo(
        targets,
        { autoAlpha: 0, yPercent: 40, rotateX: -45, transformPerspective: 500 },
        {
          autoAlpha: 1,
          yPercent: 0,
          rotateX: 0,
          duration: Number(el.dataset.duration ?? 0.9),
          ease: PIRATE_EASE,
          stagger: 0.035,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        },
      );
      track(tween.scrollTrigger);
    });

    // ── Scramble text ────────────────────────────────────────────────
    gsap.utils.toArray<HTMLElement>('[data-scramble]').forEach((el) => {
      const text = el.textContent ?? '';
      gsap.fromTo(
        el,
        { text: { value: '§·:;!.~' } },
        {
          text: { value: text },
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        },
      );
    });

    // ── Scroll-linked section fade ────────────────────────────────────
    gsap.utils.toArray<HTMLElement>('[data-fade-scroll]').forEach((el) => {
      const minOpacity = Number(el.dataset.fadeScroll ?? 0.35);
      gsap.fromTo(
        el,
        { opacity: 1 },
        {
          opacity: minOpacity,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
    });

    // ── Magnetic cursor pull ──────────────────────────────────────────
    gsap.utils.toArray<HTMLElement>('[data-magnetic]').forEach((el) => {
      const strength = Number(el.dataset.magnetic ?? 0.3);
      const bounds = el.getBoundingClientRect();

      const onMove = (event: MouseEvent) => {
        const cx = bounds.left + bounds.width / 2;
        const cy = bounds.top + bounds.height / 2;
        const dx = (event.clientX - cx) * strength;
        const dy = (event.clientY - cy) * strength;
        gsap.to(el, { x: dx, y: dy, duration: 0.4, ease: 'power2.out' });
        // Track cursor position for the CSS radial-gradient glow.
        const mx = ((event.clientX - bounds.left) / bounds.width) * 100;
        const my = ((event.clientY - bounds.top) / bounds.height) * 100;
        el.style.setProperty('--mx', `${mx}%`);
        el.style.setProperty('--my', `${my}%`);
      };

      const onLeave = () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
        el.style.removeProperty('--mx');
        el.style.removeProperty('--my');
      };

      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);

      // Keep bounds fresh on scroll/resize.
      const refresh = () => {
        const b = el.getBoundingClientRect();
        Object.assign(bounds, { left: b.left, top: b.top, width: b.width, height: b.height });
      };
      window.addEventListener('scroll', refresh, { passive: true });
      window.addEventListener('resize', refresh);
    });

    // ── Card-magnetic glow tracking ───────────────────────────────────
    gsap.utils.toArray<HTMLElement>('.card-magnetic').forEach((el) => {
      const onMove = (event: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const mx = ((event.clientX - rect.left) / rect.width) * 100;
        const my = ((event.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty('--mx', `${mx}%`);
        el.style.setProperty('--my', `${my}%`);
      };
      const onLeave = () => {
        el.style.removeProperty('--mx');
        el.style.removeProperty('--my');
      };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
    });

    // ── Smooth anchor scrolling ──────────────────────────────────────
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href*="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href') ?? '';
      const hashIndex = href.indexOf('#');
      if (hashIndex === -1 || hashIndex === href.length - 1) return;

      const path = href.slice(0, hashIndex);
      const hash = href.slice(hashIndex);
      const current = window.location.pathname;
      if (
        path &&
        path !== current &&
        path !== `${current}/` &&
        `${path}/` !== current
      ) {
        return; // a different page — let the browser navigate
      }

      const target = document.querySelector<HTMLElement>(hash);
      if (!target) return;

      event.preventDefault();
      history.replaceState(null, '', hash);
      gsap.to(window, {
        duration: 0.9,
        ease: 'power2.inOut',
        scrollTo: { y: target, offsetY: 72 },
      });
    };
    document.addEventListener('click', onClick);

    const refresh = () => ScrollTrigger.refresh();
    const fontsReady = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
    fontsReady?.ready.then(refresh).catch(() => undefined);
    window.addEventListener('load', refresh);

    return () => {
      triggers.forEach((trigger) => trigger.kill());
      document.removeEventListener('click', onClick);
      window.removeEventListener('load', refresh);
    };
  }, []);

  return null;
}
