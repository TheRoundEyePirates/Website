import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';

const TREASURE_EVENT = 'rept:treasure';
const SECRETS = ['arrr', 'treasure'];
const BUFFER_MAX = 12;
const COIN_COUNT = 36;

interface Coin {
  left: number;
  size: number;
  delay: number;
  duration: number;
}

function makeCoins(): Coin[] {
  return Array.from({ length: COIN_COUNT }, () => ({
    left: Math.random() * 100,
    size: 8 + Math.random() * 12,
    delay: Math.random() * 2.4,
    duration: 2.2 + Math.random() * 1.8,
  }));
}

function TreasureChest() {
  const [open, setOpen] = useState(false);
  const [coins, setCoins] = useState<Coin[]>([]);

  const openChest = useCallback(() => {
    setCoins(makeCoins());
    setOpen(true);
    document.dispatchEvent(new CustomEvent(TREASURE_EVENT));
  }, []);

  useEffect(() => {
    let buffer = '';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        setOpen(false);
        return;
      }
      const char = event.key.length === 1 ? event.key.toLowerCase() : '';
      if (!char) return;
      buffer = (buffer + char).slice(-BUFFER_MAX);
      if (SECRETS.some((secret) => buffer.includes(secret))) {
        buffer = '';
        openChest();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, openChest]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      {/* A whisper of a hint so the crew can find the secret again. */}
      <span
        aria-hidden="true"
        className="pointer-events-none fixed right-3 bottom-3 z-40 font-mono text-[8px] uppercase tracking-[0.3em] text-ink/25"
      >
        pssst · type “arrr”
      </span>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Treasure chest"
          className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-ink/80 p-6 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          {coins.map((coin, index) => (
            <span
              key={index}
              className="coin"
              style={{
                left: `${coin.left}%`,
                width: coin.size,
                height: coin.size,
                animationDelay: `${coin.delay}s`,
                animationDuration: `${coin.duration}s`,
              }}
            />
          ))}

          <div
            className="relative w-full max-w-md border border-gold/40 bg-sand p-8 text-center shadow-[8px_8px_0_rgba(28,25,23,0.4)] sm:p-10"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close treasure chest"
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors hover:border-gold hover:text-gold"
            >
              <X size={15} aria-hidden="true" />
            </button>

            <svg viewBox="0 0 100 84" aria-hidden="true" className="mx-auto h-40 w-auto">
              <path d="M8 40h84v6a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4Z" fill="#5c3a1e" />
              <path d="M8 50h84v22a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6Z" fill="#6f4a26" />
              <path d="M8 40c0-20 18-34 42-34s42 14 42 34Z" fill="#7f5730" />
              <rect x="6" y="36" width="88" height="8" rx="3" fill="#9a6b35" />
              <rect x="6" y="12" width="88" height="6" rx="3" fill="#b45309" />
              <rect x="14" y="50" width="72" height="6" rx="3" fill="#b45309" />
              <rect x="40" y="48" width="20" height="18" rx="3" fill="#b45309" />
              <rect x="47" y="52" width="6" height="8" rx="1.5" fill="#5c3a1e" />
              <circle cx="50" cy="58" r="1.6" fill="#5c3a1e" />
              <circle cx="50" cy="58" r="3" fill="none" stroke="#e9c568" strokeWidth="0.8" />
            </svg>

            <p className="mt-6 font-mono text-xs uppercase tracking-[0.35em] text-gold">
              X marks the spot
            </p>
            <h3 className="mt-2 font-display text-3xl text-ink">ARRR! Ye found the treasure</h3>
            <p className="mt-3 font-mono text-sm leading-7 text-ink/70">
              The crew's first haul. Fair winds and following seas, and may every build season
              end with a win — FTC 37060.
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-8 border border-ink/30 px-6 py-3 font-mono text-xs uppercase tracking-[0.25em] text-ink transition-colors hover:border-gold/60 hover:text-gold"
            >
              Take the Booty
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default TreasureChest;
