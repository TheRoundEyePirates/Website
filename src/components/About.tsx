import { Camera } from 'lucide-react';
import ShipDivider from './ShipDivider';

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-24 sm:py-32">
      <ShipDivider label="About the Crew" />

      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <div data-stagger className="space-y-5">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">
            Fresh paint. Clear skies. Unknown waters.
          </h2>
          <p className="leading-7 text-ink/75">
            The Round Eye Pirates set sail on <span className="text-navy">July 2026</span> — a
            FIRST Tech Challenge team charting its course from Hawke's Bay, New Zealand. We are a
            young crew, but the sea is the same one every team crosses.
          </p>
          <p className="leading-7 text-ink/75">
            Nautical spirit meets engineering: every build is a ship, every match a crossing, and
            every failure a lesson learned at sea. One eye fixed on the horizon, the other on the
            field.
          </p>
          <p className="font-mono text-sm text-ink/60">Est. 07.26.2026 — Hawke's Bay, NZ.</p>
        </div>

        <figure data-animate="slide-right" data-delay="0.15">
          <div
            data-parallax="0.2"
            className="flex aspect-[4/3] flex-col items-center justify-center gap-3 border border-dashed border-ink/30 bg-[#efe9da] text-ink/40"
          >
            <Camera size={40} strokeWidth={1} aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em]">
              Team Photo — Coming Soon
            </span>
          </div>
          <figcaption className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
            Figure I — The Crew
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
