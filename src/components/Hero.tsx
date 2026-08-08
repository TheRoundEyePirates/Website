import { useEffect, useRef } from 'react';
import {
  motion,
  MotionConfig,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CompassRose from './CompassRose';

gsap.registerPlugin(ScrollTrigger);

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
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Magnetic compass: pointer position eases into a 3D tilt via springs.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 90, damping: 20, mass: 0.6 });
  const smoothY = useSpring(pointerY, { stiffness: 90, damping: 20, mass: 0.6 });
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-14, 14]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [10, -10]);

  // Horizontal pan: the hero is pinned while its track slides sideways as you
  // scroll; when the last panel has passed, the pin releases and the page
  // carries on downward. Runs from this component's own effect so it fires
  // after React has taken over the DOM (setting it up from the global engine
  // conflicts with React hydration and silently no-ops).
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    if (distance() <= 0) return;

    const tween = gsap.fromTo(
      track,
      { x: 0 },
      {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => '+=' + distance(),
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
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
    >
      <MotionConfig reducedMotion="user">
        {/* The track is pinned while it pans sideways as you scroll; once the
            last panel has passed, the pin releases and the page continues
            downward. */}
        <div ref={trackRef} data-hero-track className="flex h-full w-max items-center">
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
