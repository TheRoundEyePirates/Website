import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const TREASURE_EVENT = 'rept:treasure';
const SECRETS = [
  'arrr',
  'treasure',
  'ahoy',
  'yo ho ho',
  'booty',
  'plunder',
  'doubloon',
  'cannonball',
  'pirate',
];
const BUFFER_MAX = 16;
const COIN_COUNT = 44;
const SPARK_COUNT = 26;
const BOOTY_KEY = 'rept:booty';

const QUOTES = [
  'Fair winds and following seas, matey — FTC 37060.',
  'X marks the spot... and the playoffs.',
  'May your servos never stall and your battery never die.',
  'A well-oiled gearbox is worth its weight in gold.',
  'Yo ho ho, and a fresh haul of code.',
  'Raise the black flag — the pirates sail on.',
  'Rrr, more torque, more treasure.',
  'Dead men tell no tales; living pirates win matches.',
];

interface Coin {
  left: number;
  size: number;
  delay: number;
  duration: number;
}

interface Spark {
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

function makeSparks(): Spark[] {
  return Array.from({ length: SPARK_COUNT }, () => ({
    left: Math.random() * 100,
    size: 5 + Math.random() * 7,
    delay: Math.random() * 1.6,
    duration: 1.6 + Math.random() * 1.4,
  }));
}

function TreasureChest() {
  const [open, setOpen] = useState(false);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [quote, setQuote] = useState(QUOTES[0]);
  const [booty, setBooty] = useState(0);
  const [toast, setToast] = useState(false);
  const toastTimerRef = useRef<number | null>(null);
  const countedRef = useRef(false);

  const openChest = useCallback(() => {
    setCoins(makeCoins());
    setSparks(makeSparks());
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    setOpen(true);
    document.dispatchEvent(new CustomEvent(TREASURE_EVENT));
  }, []);

  const closeChest = useCallback(() => {
    setOpen(false);
    setToast(true);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(false), 2200);
  }, []);

  useEffect(() => {
    try {
      setBooty(Number(localStorage.getItem(BOOTY_KEY) ?? 0));
    } catch {
      setBooty(0);
    }
  }, []);

  useEffect(() => {
    let buffer = '';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        closeChest();
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
  }, [open, openChest, closeChest]);

  useEffect(() => {
    if (!open) {
      countedRef.current = false;
      return;
    }
    if (countedRef.current) return;
    countedRef.current = true;
    try {
      const next = (Number(localStorage.getItem(BOOTY_KEY)) || 0) + 1;
      localStorage.setItem(BOOTY_KEY, String(next));
      setBooty(next);
    } catch {
      /* storage unavailable — booty count is just for show */
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
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

      {toast && !open && (
        <p className="toast-pop fixed bottom-6 left-1/2 z-[95] -translate-x-1/2 border border-gold/40 bg-ink px-5 py-3 font-mono text-xs uppercase tracking-[0.3em] text-gold shadow-[4px_4px_0_rgba(28,25,23,0.4)]">
          Booty secured — {booty} haul{booty === 1 ? '' : 's'}
        </p>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Treasure chest"
          className="animate-overlay fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-ink/80 p-6 backdrop-blur-sm"
          onClick={closeChest}
        >
          <span
            aria-hidden="true"
            className="gold-flash pointer-events-none fixed inset-0 z-[-1]"
          />

          {sparks.map((spark, index) => (
            <span
              key={`spark-${index}`}
              className="spark"
              style={{
                left: `${spark.left}%`,
                width: spark.size,
                height: spark.size,
                animationDelay: `${spark.delay}s`,
                animationDuration: `${spark.duration}s`,
              }}
            />
          ))}

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
            className="animate-pop relative w-full max-w-md border border-gold/40 bg-sand p-8 text-center shadow-[8px_8px_0_rgba(28,25,23,0.4)] sm:p-10"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeChest}
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
              {quote}
            </p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40">
              Haul No. {booty} — the booty is logged in the ship's ledger
            </p>
            <button
              type="button"
              onClick={closeChest}
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
