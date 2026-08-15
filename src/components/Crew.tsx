import { Anchor } from 'lucide-react';
import ShipDivider from './ShipDivider';
import type { CrewMember } from '../lib/crew';

interface CrewProps {
  crew: CrewMember[];
  coaches: CrewMember[];
}

function MemberRow({ member }: { member: CrewMember }) {
  return (
    <li className="flex items-center gap-3 border-b border-ink/10 pb-3 font-display text-lg text-ink last:border-b-0 last:pb-0">
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
        {' '}
        {member.last}
      </a>
    </li>
  );
}

export default function Crew({ crew, coaches }: CrewProps) {
  return (
    <section id="crew" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-24 sm:py-32">
      <ShipDivider label="Crew" />

      <h2 data-animate="pop" className="font-display text-fluid-lg text-ink">
        Ship's Roster
      </h2>

      <p data-animate="slide-up" className="mt-4 max-w-md font-mono text-sm leading-6 text-ink/60">
        Click on any name to read more about us.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div
          data-animate="slide-left"
          className="card-3d rounded-3xl border border-ink/25 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_-14px_rgba(0,0,0,0.6)] sm:p-8"
        >
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
            Officers &amp; Coaches
          </h3>
          <ul data-stagger className="mt-5 space-y-3">
            {coaches.map((member) => (
              <MemberRow key={member.key} member={member} />
            ))}
          </ul>
        </div>

        <div
          data-animate="slide-right"
          className="card-3d rounded-3xl border border-ink/25 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_-14px_rgba(0,0,0,0.6)] sm:p-8"
        >
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Crew</h3>
          <ul data-stagger className="mt-5 space-y-3">
            {crew.map((member) => (
              <MemberRow key={member.key} member={member} />
            ))}
          </ul>
          <p className="mt-5 border-t border-ink/10 pt-3 font-mono text-sm text-ink/40">
            …and two new crewmates have signed the articles. Names withheld until the ink dries.
          </p>
        </div>
      </div>
    </section>
  );
}
