import { useState } from 'react';

interface Term {
  word: string;
  what: string;
}

const TERMS: Term[] = [
  {
    word: 'Alliance',
    what: 'Two teams, red or blue, working one match together. Pick your shipmates before the horn.',
  },
  {
    word: 'Auto',
    what: 'The first 30 seconds. The robot sails on code alone — no hands on the sticks.',
  },
  {
    word: 'TeleOp',
    what: 'Driver time. Sticks in hand, eyes on the field.',
  },
  {
    word: 'Intake',
    what: 'The part of the robot that grabs game pieces and hauls them aboard.',
  },
  {
    word: 'Starboard',
    what: 'The right side of the ship when you face forward. Get it wrong and your alliance station drifts away.',
  },
  {
    word: 'Outreach',
    what: 'Taking robotics to people who have never touched a robot. Every shore we land on, we teach.',
  },
  {
    word: 'Gracious Professionalism',
    what: "The FIRST rule of the seas: compete hard, respect the other crew, never sink anyone on purpose.",
  },
  {
    word: 'Pit crew',
    what: 'The people at the table fixing, tuning, and quietly panicking between matches.',
  },
  {
    word: 'Drivetrain',
    what: 'Wheels, motors, gears — how the robot actually moves. The keel of the machine.',
  },
  {
    word: 'Ballast',
    what: 'Extra weight for stability. Counterweights for a robot; rocks for a ship.',
  },
  {
    word: 'Endgame',
    what: 'The last stretch of the match. The moment everything you built actually gets tested.',
  },
  {
    word: 'Pivot',
    what: 'A tight turn — and sometimes the honest answer to "which one do we fix first?".',
  },
];

export default function Glossary() {
  const [open, setOpen] = useState<Record<number, boolean>>({});

  const toggle = (index: number) =>
    setOpen((prev) => ({ ...prev, [index]: !prev[index] }));

  return (
    <section id="lingo" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-24 sm:py-28">
      <p data-animate="fade-in" className="font-mono text-xs uppercase tracking-[0.3em] text-ink/50">
        Speak the language
      </p>

      <div
        data-animate="fade-up"
        data-delay="0.1"
        className="mt-3 flex flex-wrap items-baseline justify-between gap-4"
      >
        <h2 className="font-display text-fluid-lg text-ink">Sea &amp; bot lingo</h2>
        <p className="max-w-sm font-mono text-xs leading-5 text-ink/60">
          Pirate words we borrow and robot words we made up. Swipe sideways.
        </p>
      </div>

      <div
        data-animate="fade-up"
        data-delay="0.15"
        className="mt-10 -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:-mx-6"
      >
        {TERMS.map((term, index) => {
          const flipped = open[index];
          return (
            <button
              type="button"
              key={term.word}
              onClick={() => toggle(index)}
              aria-pressed={flipped}
              className="perspective-dramatic group w-64 shrink-0 snap-start text-left sm:w-72"
            >
              <div
                className={`transform-3d relative h-48 transition-transform duration-500 ${
                  flipped ? 'rotate-y-180' : ''
                }`}
              >
                <div className="backface-hidden absolute inset-0 flex flex-col border border-ink/20 bg-card p-5 shadow-[4px_4px_0_rgba(212,160,44,0.12)]">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40">
                    <span>No. {String(index + 1).padStart(2, '0')}</span>
                    <span aria-hidden="true">↻</span>
                  </div>
                  <span className="mt-6 font-pirate text-3xl leading-none text-ink">
                    {term.word}
                  </span>
                </div>
                <div className="backface-hidden rotate-y-180 absolute inset-0 flex items-center border border-gold/50 bg-navy p-5">
                  <p className="font-mono text-sm leading-6 text-parchment">{term.what}</p>
                </div>
              </div>
            </button>
          );
        })}

        <div className="flex w-40 shrink-0 snap-start items-center justify-center font-mono text-[10px] uppercase leading-5 tracking-[0.3em] text-ink/30">
          the end — no more words
        </div>
      </div>
    </section>
  );
}
