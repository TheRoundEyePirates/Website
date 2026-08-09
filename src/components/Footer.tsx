import { Anchor } from 'lucide-react';
import Anchor3D from './Anchor3D';

interface FooterProps {
  /** Logo for dark surfaces (footer). Falls back to the anchor. */
  logo?: string | null;
}

function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
    </svg>
  );
}

export default function Footer({ logo = null }: FooterProps) {
  return (
    <footer
      id="contact"
      className="scroll-mt-24 border-t border-ink/10 bg-navy px-6 py-16 text-center"
    >
      <div data-stagger className="mx-auto max-w-3xl space-y-6">
        <div className="flex justify-center" aria-hidden="true">
          {logo ? (
            <img
              src={logo}
              alt="The Round Eye Pirates"
              className="h-20 w-auto max-w-[13rem] rounded-xl object-contain shadow-lg ring-1 ring-gold/40"
            />
          ) : (
            <Anchor3D height={110} width={110} />
          )}
        </div>

        <div className="flex items-center justify-center gap-2 font-mono text-sm uppercase tracking-[0.3em] text-parchment">
          <Anchor size={18} className="text-gold" strokeWidth={1.5} aria-hidden="true" />
          The Round Eye Pirates
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.25em] text-parchment/60">
          FTC 37060 · Founded July 2026
        </p>

        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-parchment/40">
          Hastings · Napier — Hawke's Bay, New Zealand
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-xs text-parchment/60">
          <a
            href="/"
            className="transition-colors hover:text-gold"
          >
            The Ship
          </a>
          <a
            href="/faq/"
            className="transition-colors hover:text-gold"
          >
            FAQ
          </a>
          <a
            href="/code/"
            className="transition-colors hover:text-gold"
          >
            Code
          </a>
          <a
            href="/contact/"
            className="transition-colors hover:text-gold"
          >
            Contact
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-xs text-parchment/60">
          <a
            href="https://github.com/orgs/TheRoundEyePirates"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-gold"
          >
            <GithubIcon /> github.com/orgs/TheRoundEyePirates
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 border-t border-ink/15 pt-8">
          <a
            href="https://www.firstinspires.org/robotics/ftc"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 opacity-80 transition-opacity hover:opacity-100"
          >
            <img src="/logos/ftc.svg" alt="FIRST Tech Challenge" className="h-12 w-auto" />
          </a>
        </div>

        <p className="mx-auto max-w-xl font-mono text-[9px] uppercase tracking-[0.2em] text-parchment/40">
          FIRST® and FIRST Tech Challenge are registered trademarks of FIRST® (For Inspiration and
          Recognition of Science and Technology).
        </p>

        <p className="pt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-parchment/40">
          © 2026 The Round Eye Pirates — FTC Team 37060
        </p>
      </div>
    </footer>
  );
}
