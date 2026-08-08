import { ArrowUpRight, Building2, User } from 'lucide-react';
import ShipDivider from './ShipDivider';

const ORG = 'TheRoundEyePirates';
const USER = 'the-round-eye-pirates';

export default function GitHubRepos() {
  return (
    <section id="code" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-24 sm:py-32">
      <ShipDivider label="Ship's Code" />

      <h2 data-animate="blur" className="font-display text-3xl text-ink sm:text-4xl">
        Our Code
      </h2>

      <p data-animate="slide-up" className="mt-4 max-w-md font-mono text-sm leading-6 text-ink/60">
        Find our repositories and projects out on the GitHub seas.
      </p>

      <div data-stagger className="mt-10 grid gap-6 sm:grid-cols-2">
        <a
          href={`https://github.com/${ORG}`}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center justify-between gap-4 border border-ink/25 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_14px_28px_-14px_rgba(0,0,0,0.6)]"
        >
          <span className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/60 bg-sand text-gold">
              <Building2 size={20} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span>
              <span className="block font-display text-lg text-ink transition-colors group-hover:text-gold">
                {ORG}
              </span>
              <span className="block font-mono text-xs uppercase tracking-[0.25em] text-ink/50">
                Organization
              </span>
            </span>
          </span>
          <ArrowUpRight size={18} strokeWidth={1.5} className="shrink-0 text-ink/40 transition-colors group-hover:text-gold" aria-hidden="true" />
        </a>

        <a
          href={`https://github.com/${USER}`}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center justify-between gap-4 border border-ink/25 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_14px_28px_-14px_rgba(0,0,0,0.6)]"
        >
          <span className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/60 bg-sand text-gold">
              <User size={20} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span>
              <span className="block font-display text-lg text-ink transition-colors group-hover:text-gold">
                {USER}
              </span>
              <span className="block font-mono text-xs uppercase tracking-[0.25em] text-ink/50">
                Team Account
              </span>
            </span>
          </span>
          <ArrowUpRight size={18} strokeWidth={1.5} className="shrink-0 text-ink/40 transition-colors group-hover:text-gold" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
