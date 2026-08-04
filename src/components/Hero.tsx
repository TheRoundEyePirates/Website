import { useEffect, useRef } from 'react';
import CompassRose from './CompassRose';

export default function Hero() {
  const parallaxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const frame = parallaxRef.current;
    if (!frame) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Butter-smooth pointer parallax: targets update on pointermove, but the
    // transform is eased toward them on a rAF loop (no CSS transition lag,
    // no jumps). Eases back to level when the pointer leaves.
    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const tick = () => {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;
      frame.style.transform = `perspective(700px) rotateY(${(currentX * 16).toFixed(2)}deg) rotateX(${(-currentY * 16).toFixed(2)}deg)`;
      if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (reduced) return;
      const rect = frame.getBoundingClientRect();
      targetX = (event.clientX - rect.left) / rect.width - 0.5;
      targetY = (event.clientY - rect.top) / rect.height - 0.5;
      start();
    };

    const onPointerLeave = () => {
      if (reduced) return;
      targetX = 0;
      targetY = 0;
      start();
    };

    frame.addEventListener('pointermove', onPointerMove);
    frame.addEventListener('pointerleave', onPointerLeave);
    return () => {
      frame.removeEventListener('pointermove', onPointerMove);
      frame.removeEventListener('pointerleave', onPointerLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="home"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 text-center"
    >
      {/* Compass instrument */}
      <div data-animate className="mb-8 flex items-center justify-center">
        <div
          ref={parallaxRef}
          className="relative h-64 w-64 will-change-transform sm:h-72 sm:w-72"
        >
          {/* Soft grounding shadow so the instrument floats above the page. */}
          <div
            className="absolute -inset-12 rounded-full bg-[radial-gradient(circle,rgba(28,25,23,0.35),rgba(28,25,23,0)_70%)]"
            aria-hidden="true"
          />
          <CompassRose />
        </div>
      </div>

      <p data-animate data-delay="0.1" className="font-mono text-xs uppercase tracking-[0.4em] text-navy sm:text-sm">
        FTC 37060
      </p>

      <h1
        data-animate
        data-delay="0.2"
        className="mt-5 font-display text-4xl leading-tight text-ink sm:text-6xl md:text-7xl"
      >
        The Round Eye Pirates
      </h1>

      <p data-animate data-delay="0.25" className="mt-4 font-pirate text-2xl text-gold sm:text-3xl">
        丸い目の海賊団
      </p>

      <p data-animate data-delay="0.3" className="mt-6 font-mono text-sm text-ink/70">
        Charting course since July 2026.
      </p>

      <hr data-animate data-delay="0.4" className="mt-10 w-24 border-ink/30" />

      {/* Scroll cue */}
      <div
        data-animate
        data-delay="0.6"
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-ink/45">Set Course</span>
        <span className="relative block h-10 w-px overflow-hidden bg-ink/15">
          <span className="animate-scroll-cue absolute inset-0 bg-gold" />
        </span>
      </div>
    </section>
  );
}
