import { useEffect, useState } from 'react';

/**
 * The course the crew has sailed: a gold dashed route drawn down the page as
 * you scroll. Each section is a landmark on the line — the marker reaches it
 * exactly when the section comes into view, and the name of the current
 * landmark travels with the marker.
 */
const MILESTONES = [
  { id: 'home', label: 'Harbour' },
  { id: 'about', label: 'Manifest' },
  { id: 'ship', label: 'Brickwave' },
  { id: 'robot', label: 'Robot Log' },
  { id: 'crew', label: 'Crew' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'history', label: 'History' },
  { id: 'location', label: 'Location' },
  { id: 'contact', label: 'Harbour Home' },
] as const;

interface Milestone {
  id: string;
  label: string;
  /** Progress value (0–1) at which this landmark is reached. */
  reachedAt: number;
}

function readMilestones(scrollable: number, winHeight: number): Milestone[] {
  return MILESTONES.flatMap(({ id, label }) => {
    const el = document.getElementById(id);
    if (!el) return [];
    const top = el.getBoundingClientRect().top + window.scrollY;
    const reachedAt = Math.max(0, Math.min(1, (top + el.offsetHeight * 0.5 - winHeight) / scrollable));
    return [{ id, label, reachedAt }];
  });
}

export default function CourseLine() {
  const [progress, setProgress] = useState(0);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    let frame = 0;

    // Cache the scrollable height so the per-frame scroll handler never forces
    // a reflow by reading layout. Re-measured on resize / load only.
    let scrollable = 1;

    const measure = () => {
      const doc = document.documentElement;
      const winHeight = window.innerHeight;
      scrollable = Math.max(doc.scrollHeight - winHeight, 1);
      setMilestones(readMilestones(scrollable, winHeight));
      setProgress(Math.min(1, Math.max(0, window.scrollY / scrollable)));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setProgress(Math.min(1, Math.max(0, window.scrollY / scrollable)));
      });
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      window.removeEventListener('load', measure);
    };
  }, []);

  const current = [...milestones].reverse().find((m) => progress >= m.reachedAt)?.label;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-4 z-40 hidden h-screen w-4 md:block"
    >
      {/* Un-travelled course — a faint dashed route. */}
      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 border-l border-dashed border-gold/20" />

      {/* Landmarks along the course. */}
      {milestones.map((m) => (
        <span
          key={m.id}
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: `${m.reachedAt * 100}%` }}
        >
          <span
            className={`block h-1.5 w-1.5 -translate-y-1/2 rounded-full transition-all duration-500 ${
              progress >= m.reachedAt
                ? 'bg-gold shadow-[0_0_8px_rgba(180,83,9,0.9)]'
                : 'bg-gold/25'
            }`}
          />
        </span>
      ))}

      {/* The course drawn so far. */}
      <span
        className="absolute top-0 left-1/2 w-[2px] -translate-x-1/2 rounded-full bg-gradient-to-b from-gold via-gold/80 to-gold/40 shadow-[0_0_8px_rgba(180,83,9,0.5)]"
        style={{ height: `${progress * 100}%` }}
      />

      {/* The marker, with the name of the landmark it is passing. */}
      <span
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: `${progress * 100}%` }}
      >
        <span className="-translate-y-1/2">
          <span className="block h-2 w-2 rotate-45 border border-gold bg-sand shadow-[0_0_10px_rgba(180,83,9,0.9)]" />
          {current && (
            <span className="absolute top-1/2 left-4 -translate-y-1/2 font-mono text-[9px] tracking-[0.3em] whitespace-nowrap text-gold [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]">
              {current}
            </span>
          )}
        </span>
      </span>
    </div>
  );
}
