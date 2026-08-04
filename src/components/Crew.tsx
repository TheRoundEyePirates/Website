import { Anchor } from 'lucide-react';
import ShipDivider from './ShipDivider';

const CREW = ['Lihan Badenhorst', 'Ryan Fox', 'Hunter Cameron'] as const;

const COACHES = ['Dr. Ricardo Fox', 'Mr. White'] as const;

export default function Crew() {
  return (
    <section id="crew" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-24 sm:py-32">
      <ShipDivider label="Crew" />

      <h2 data-animate="blur" className="font-display text-3xl text-ink sm:text-4xl">
        Ship's Roster
      </h2>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div
          data-animate="slide-left"
          className="border border-ink/25 bg-card p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-8"
        >
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Crew</h3>
          <ul data-stagger className="mt-5 space-y-3">
            {CREW.map((name) => (
              <li
                key={name}
                className="flex items-center gap-3 border-b border-ink/10 pb-3 font-display text-lg text-ink last:border-b-0 last:pb-0"
              >
                <Anchor size={14} strokeWidth={1.5} className="shrink-0 text-gold" aria-hidden="true" />
                {name}
              </li>
            ))}
          </ul>
        </div>

        <div
          data-animate="slide-right"
          className="border border-ink/25 bg-card p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-8"
        >
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
            Officers &amp; Coaches
          </h3>
          <ul data-stagger className="mt-5 space-y-3">
            {COACHES.map((name) => (
              <li
                key={name}
                className="flex items-center gap-3 border-b border-ink/10 pb-3 font-display text-lg text-ink last:border-b-0 last:pb-0"
              >
                <Anchor size={14} strokeWidth={1.5} className="shrink-0 text-gold" aria-hidden="true" />
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
