import CompassRose from './CompassRose';

const CARDINALS = [
  { label: 'N', className: 'left-1/2 top-2 -translate-x-1/2' },
  { label: 'E', className: 'right-2 top-1/2 -translate-y-1/2' },
  { label: 'S', className: 'bottom-2 left-1/2 -translate-x-1/2' },
  { label: 'W', className: 'left-2 top-1/2 -translate-y-1/2' },
] as const;

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 text-center"
    >
      {/* Compass instrument */}
      <div data-animate className="relative mb-8 flex h-64 w-64 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-ink/20" aria-hidden="true" />
        <div className="absolute inset-3 rounded-full border border-ink/10" aria-hidden="true" />
        <div className="absolute inset-6 rounded-full border border-gold/30" aria-hidden="true" />
        {CARDINALS.map((cardinal) => (
          <span
            key={cardinal.label}
            aria-hidden="true"
            className={`absolute font-mono text-[10px] tracking-[0.2em] text-gold ${cardinal.className}`}
          >
            {cardinal.label}
          </span>
        ))}
        <CompassRose height={176} width={176} />
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
