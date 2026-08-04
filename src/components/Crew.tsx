import { Anchor } from 'lucide-react';
import ShipDivider from './ShipDivider';

interface CrewMember {
  title?: string;
  first: string;
  last: string;
  nickname?: string;
}

const CREW: CrewMember[] = [
  { first: 'Lihan', last: 'Badenhorst' },
  { first: 'Ryan', last: 'Fox', nickname: 'Spillover' },
  { first: 'Hunter', last: 'Cameron', nickname: 'Tickets' },
];

const COACHES: CrewMember[] = [
  { title: 'Dr.', first: 'Ricardo', last: 'Fox', nickname: 'Lostfoxy' },
  { title: 'Mr.', first: 'White', last: '' },
];

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
          className="border border-ink/25 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_-14px_rgba(28,25,23,0.35)] sm:p-8"
        >
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Crew</h3>
          <ul data-stagger className="mt-5 space-y-3">
            {CREW.map((member) => (
              <li
                key={`${member.first}${member.last}`}
                className="flex items-center gap-3 border-b border-ink/10 pb-3 font-display text-lg text-ink last:border-b-0 last:pb-0"
              >
                <Anchor size={14} strokeWidth={1.5} className="shrink-0 text-gold" aria-hidden="true" />
                {member.title && <span className="font-mono text-sm text-ink/60">{member.title}</span>}
                {member.first}
                {member.nickname && (
                  <span className="font-mono text-sm text-gold">&ldquo;{member.nickname}&rdquo;</span>
                )}
                {member.last}
              </li>
            ))}
          </ul>
        </div>

        <div
          data-animate="slide-right"
          className="border border-ink/25 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_-14px_rgba(28,25,23,0.35)] sm:p-8"
        >
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
            Officers &amp; Coaches
          </h3>
          <ul data-stagger className="mt-5 space-y-3">
            {COACHES.map((member) => (
              <li
                key={`${member.first}${member.last}`}
                className="flex items-center gap-3 border-b border-ink/10 pb-3 font-display text-lg text-ink last:border-b-0 last:pb-0"
              >
                <Anchor size={14} strokeWidth={1.5} className="shrink-0 text-gold" aria-hidden="true" />
                {member.title && <span className="font-mono text-sm text-ink/60">{member.title}</span>}
                {member.first}
                {member.nickname && (
                  <span className="font-mono text-sm text-gold">&ldquo;{member.nickname}&rdquo;</span>
                )}
                {member.last}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
