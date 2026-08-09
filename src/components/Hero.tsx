import { useEffect, useRef, useState } from 'react';
import {
  motion,
  MotionConfig,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CompassRose from './CompassRose';

const PANEL_COUNT = 3;

const TITLE_WORDS = ['The', 'Round', 'Eye', 'Pirates'];

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 26, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Hero() {
  const pausedRef = useRef(false);
  const [index, setIndex] = useState(0);

  // Auto-advance the top carousel so it stays in one area — no scroll-pinning,
  // you can scroll straight down past the hero.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      if (!pausedRef.current) setIndex((i) => (i + 1) % PANEL_COUNT);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const go = (dir: number) => setIndex((i) => (i + dir + PANEL_COUNT) % PANEL_COUNT);

  // Magnetic compass: pointer position eases into a 3D tilt via springs.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 90, damping: 20, mass: 0.6 });
  const smoothY = useSpring(pointerY, { stiffness: 90, damping: 20, mass: 0.6 });
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-14, 14]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [10, -10]);

  return (
    <section
      id="home"
      data-hero-horizontal
      className="relative flex h-screen overflow-hidden"
      onPointerMove={(event) => {
        if (event.pointerType !== 'mouse') return;
        pointerX.set(event.clientX / window.innerWidth - 0.5);
        pointerY.set(event.clientY / window.innerHeight - 0.5);
      }}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <MotionConfig reducedMotion="user">
        {/* The top intro slides sideways on a timer (not scroll) so the whole
            hero fits in one viewport. */}
        <motion.div
          data-hero-track
          className="flex h-full w-max items-center"
          animate={{ x: `-${index * 100}vw` }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Panel 1 — the compass */}
          <div className="relative flex h-full w-screen shrink-0 flex-col items-center justify-center px-6 pt-20 text-center">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="flex flex-col items-center"
            >
              <motion.div variants={item} className="mb-8 flex items-center justify-center">
                <motion.div
                  style={{ rotateX, rotateY, transformPerspective: 700 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative h-60 w-60 will-change-transform sm:h-72 sm:w-72"
                >
                  {/* Soft golden grounding glow so the instrument floats above the page. */}
                  <div
                    className="absolute -inset-12 rounded-full bg-[radial-gradient(circle,rgba(212,160,44,0.16),rgba(212,160,44,0)_70%)]"
                    aria-hidden="true"
                  />
                  {/* Gentle buoy — the compass rides the swell. */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative h-full w-full"
                  >
                    <CompassRose />
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.p
                variants={item}
                className="font-mono text-xs uppercase tracking-[0.4em] text-gold sm:text-sm"
              >
                FTC 37060
              </motion.p>
            </motion.div>

            <span
              className="absolute top-1/2 right-0 hidden h-24 w-px -translate-y-1/2 bg-gold/30 sm:block"
              aria-hidden="true"
            />
          </div>

          {/* Panel 2 — the name */}
          <div className="relative flex h-full w-screen shrink-0 flex-col items-center justify-center px-6 pt-20 text-center">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="flex flex-col items-center"
            >
              <motion.p
                variants={item}
                className="font-mono text-xs uppercase tracking-[0.35em] text-gold sm:text-sm"
              >
                Ahoy — welcome aboard
              </motion.p>

              <h1 className="mt-5 font-display text-4xl leading-tight text-ink sm:text-6xl md:text-7xl">
                {TITLE_WORDS.map((word) => (
                  <motion.span
                    key={word}
                    variants={item}
                    className="mr-[0.28em] inline-block last:mr-0"
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>

              <motion.p variants={item} className="mt-4 font-pirate text-2xl text-gold sm:text-3xl">
                丸い目の海賊団
              </motion.p>
            </motion.div>

            <span
              className="absolute top-1/2 right-0 hidden h-24 w-px -translate-y-1/2 bg-gold/30 sm:block"
              aria-hidden="true"
            />
          </div>

          {/* Panel 3 — the tagline */}
          <div className="relative flex h-full w-screen shrink-0 flex-col items-center justify-center px-6 pt-20 text-center">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="flex flex-col items-center"
            >
              <motion.p variants={item} className="font-mono text-sm text-ink/70">
                Charting course since July 2026.
              </motion.p>

              <motion.hr variants={item} className="mt-10 w-24 border-ink/30" />

              <motion.p variants={item} className="mt-8 max-w-sm text-sm text-ink/50">
                The story of FTC Team 37060 begins below — crew, robot, journal, and all.
              </motion.p>
            </motion.div>
          </div>
        </motion.div>

        {/* Carousel arrows */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous panel"
          className="absolute top-1/2 left-3 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-card/70 text-gold backdrop-blur transition hover:bg-gold hover:text-card sm:left-6"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next panel"
          className="absolute top-1/2 right-3 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-card/70 text-gold backdrop-blur transition hover:bg-gold hover:text-card sm:right-6"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>

        {/* Carousel dots */}
        <div className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          {Array.from({ length: PANEL_COUNT }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to panel ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-gold' : 'w-1.5 bg-ink/25 hover:bg-gold/60'
              }`}
            />
          ))}
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-ink/45">
            Set Course
          </span>
          <span className="relative block h-px w-16 overflow-hidden bg-ink/15">
            <span className="animate-scroll-cue-x absolute inset-0 bg-gold" />
          </span>
        </motion.div>
      </MotionConfig>
    </section>
  );
}
