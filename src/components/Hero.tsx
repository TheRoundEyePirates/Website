import {
  motion,
  MotionConfig,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from 'motion/react';
import CompassRose from './CompassRose';

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

const panelViewport = { once: true, amount: 0.4 } as const;

export default function Hero() {
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
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-28 pt-24 text-center"
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
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={panelViewport}
          className="flex max-w-3xl flex-col items-center"
        >
          {/* The compass */}
          <motion.div variants={item} className="mb-7 flex items-center justify-center">
            <motion.div
              style={{ rotateX, rotateY, transformPerspective: 700 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              className="relative h-32 w-32 will-change-transform sm:h-40 sm:w-40"
            >
              {/* Soft golden grounding glow so the instrument floats above the page. */}
              <div
                className="absolute -inset-8 rounded-full bg-[radial-gradient(circle,rgba(212,160,44,0.16),rgba(212,160,44,0)_70%)]"
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
            FTC 37060 — Ahoy, welcome aboard
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

          <motion.p variants={item} className="mt-3 font-pirate text-2xl text-gold sm:text-3xl">
            丸い目の海賊団
          </motion.p>

          <motion.hr variants={item} className="mt-8 w-24 border-ink/30" />

          <motion.p variants={item} className="mt-6 max-w-sm text-sm text-ink/60">
            Charting course since July 2026. The story of FTC Team 37060 begins below — crew, robot,
            journal, and all.
          </motion.p>
        </motion.div>
      </MotionConfig>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={panelViewport}
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
    </section>
  );
}
