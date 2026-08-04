import { useEffect, useState } from 'react';
import { Anchor } from 'lucide-react';
import ShipDivider from './ShipDivider';

const QUOTES = [
  { text: 'A smooth sea never made a skilled sailor.', by: 'Sea proverb' },
  { text: 'One eye on the horizon, one on the field.', by: 'The crew' },
  { text: 'We may be young, but our keel is true.', by: "Captain's log" },
  { text: 'Fair winds and following seas.', by: 'Traditional sign-off' },
  { text: 'Every build is a ship; every match a crossing.', by: 'The crew' },
] as const;

const IDLE_MS = 6000;

export default function QuoteTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % QUOTES.length),
      IDLE_MS,
    );
    return () => clearInterval(timer);
  }, []);

  const quote = QUOTES[index];

  return (
    <section className="mx-auto max-w-5xl px-6 py-24 sm:py-28">
      <ShipDivider label="Tavern Tales" />

      <blockquote
        key={index}
        className="animate-quote-fade mx-auto flex max-w-2xl flex-col items-center gap-4 text-center"
      >
        <Anchor size={18} strokeWidth={1.5} className="text-gold" aria-hidden="true" />
        <p className="font-display text-xl leading-relaxed text-ink sm:text-2xl">“{quote.text}”</p>
        <footer className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50">
          — {quote.by}
        </footer>
      </blockquote>
    </section>
  );
}
