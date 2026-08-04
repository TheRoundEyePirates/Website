import { Anchor } from 'lucide-react';
import ShipDivider from './ShipDivider';
import type { CrewMember } from '../lib/crew';

export type CrewPhotos = Record<string, string[]>;

interface CrewProps {
  crew: CrewMember[];
  coaches: CrewMember[];
  photos?: CrewPhotos;
}

function MemberRow({ member, photos }: { member: CrewMember; photos?: CrewPhotos }) {
  const memberPhotos = photos?.[member.key] ?? [];

  return (
    <li
      className="group relative flex items-center gap-3 border-b border-ink/10 pb-3 font-display text-lg text-ink last:border-b-0 last:pb-0"
    >
      <Anchor size={14} strokeWidth={1.5} className="shrink-0 text-gold" aria-hidden="true" />
      <a
        href={`/crew/${member.key}/`}
        className="inline-flex flex-wrap items-center gap-2 transition-colors hover:text-gold"
      >
        {member.title && <span className="font-mono text-sm text-ink/60">{member.title}</span>}
        {member.first}
        {member.nickname && (
          <span className="font-mono text-sm text-gold">&ldquo;{member.nickname}&rdquo;</span>
        )}
        {member.last}
      </a>

      {memberPhotos.length > 0 && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-full z-20 mt-3 hidden w-max max-w-xs opacity-0 transition-all duration-200 group-hover:block group-hover:opacity-100"
        >
          <span className="flex flex-wrap gap-2 border border-ink/25 bg-card p-2 shadow-[0_14px_28px_-14px_rgba(28,25,23,0.45)]">
            {memberPhotos.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="h-16 w-16 object-cover"
                loading="lazy"
              />
            ))}
          </span>
        </span>
      )}
    </li>
  );
}

export default function Crew({ crew, coaches, photos }: CrewProps) {
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
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
            Officers &amp; Coaches
          </h3>
          <ul data-stagger className="mt-5 space-y-3">
            {coaches.map((member) => (
              <MemberRow key={member.key} member={member} photos={photos} />
            ))}
          </ul>
        </div>

        <div
          data-animate="slide-right"
          className="border border-ink/25 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_-14px_rgba(28,25,23,0.35)] sm:p-8"
        >
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Crew</h3>
          <ul data-stagger className="mt-5 space-y-3">
            {crew.map((member) => (
              <MemberRow key={member.key} member={member} photos={photos} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
