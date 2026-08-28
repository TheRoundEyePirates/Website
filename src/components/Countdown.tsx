import { useEffect, useState } from 'react';

interface CountdownProps {
  target: string;
  label: string;
  location?: string;
  dates?: string;
  confirmed?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function timeLeft(target: string): TimeLeft {
  const ms = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    minutes: Math.floor(ms / 60_000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  };
}

export default function Countdown({ target, label, location, dates, confirmed = true }: CountdownProps) {
  const [now, setNow] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setNow(timeLeft(target));
    const id = setInterval(() => setNow(timeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const underway = !!now && now.days === 0 && now.hours === 0 && now.minutes === 0 && now.seconds === 0;

  const cells = [
    { value: now?.days, unit: 'days' },
    { value: now?.hours, unit: 'hours' },
    { value: now?.minutes, unit: 'min' },
    { value: now?.seconds, unit: 'sec' },
  ];

  return (
    <section id="countdown" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-16 sm:py-20">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-ink/50">
        {now ? (underway ? 'We are underway' : `Next port of call — ${label}`) : `Next port of call — ${label}`}
      </p>

      {(location || dates) && (
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.3em] text-gold">
          {[dates, location].filter(Boolean).join(' · ')}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-baseline gap-x-10 gap-y-4">
        {confirmed ? (
          cells.map((cell) => (
            <div key={cell.unit} className="flex items-baseline gap-2">
              <span
                key={String(cell.value ?? 'placeholder')}
                className="animate-count-tick font-display text-5xl tabular-nums text-ink sm:text-6xl"
                aria-hidden={!now}
              >
                {cell.value === undefined ? '––' : String(cell.value).padStart(2, '0')}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/40">
                {cell.unit}
              </span>
            </div>
          ))
        ) : (
          <span className="font-display text-4xl text-ink sm:text-5xl">To Be Confirmed</span>
        )}
      </div>
    </section>
  );
}
