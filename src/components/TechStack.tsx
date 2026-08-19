import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Box,
  Cloud,
  Coffee,
  Cpu,
  GitBranch,
  Mail,
  MessageCircle,
  MoonStar,
  Route,
  Shapes,
  Smartphone,
  Triangle,
} from 'lucide-react';
import { RetroGrid } from './ui/retro-grid';

interface StackItem {
  name: string;
  purpose: string;
  icon: LucideIcon;
  logo?: string;
  invertOnDark?: boolean;
  legendary?: boolean;
  /** Official website — the card links out to it when set. */
  url?: string;
  /** Local video to play in an overlay when the card is clicked. */
  videoSrc?: string;
}

const STACK: StackItem[] = [
  {
    name: 'Android Studio',
    purpose: 'FTC robot development',
    icon: Smartphone,
    logo: 'https://cdn.simpleicons.org/androidstudio/3DDC84',
    url: 'https://developer.android.com/studio',
  },
  {
    name: 'Java',
    purpose: 'Robot programming',
    icon: Coffee,
    logo: 'https://www.google.com/s2/favicons?domain=java.oracle.com&sz=128',
    url: 'https://www.java.com/',
  },
  {
    name: 'FTC SDK',
    purpose: 'Robot control framework',
    icon: Cpu,
    url: 'https://github.com/FIRST-Tech-Challenge/FtcRobotController',
  },
  {
    name: 'Pedro Pathing',
    purpose: 'Autonomous path planning',
    icon: Route,
    url: 'https://pedropathing.com/',
  },
  {
    name: 'Onshape',
    purpose: 'CAD and robot design',
    icon: Box,
    logo: 'https://www.google.com/s2/favicons?domain=onshape.com&sz=128',
    url: 'https://www.onshape.com/',
  },
  {
    name: 'GitHub',
    purpose: 'Code, version control and collaboration',
    icon: GitBranch,
    logo: 'https://cdn.simpleicons.org/github',
    invertOnDark: true,
    url: 'https://github.com/',
  },
  {
    name: 'Vercel',
    purpose: 'Website hosting',
    icon: Triangle,
    logo: 'https://cdn.simpleicons.org/vercel',
    invertOnDark: true,
    url: 'https://vercel.com/',
  },
  {
    name: 'Cloudflare',
    purpose: 'DNS, domains and security',
    icon: Cloud,
    logo: 'https://cdn.simpleicons.org/cloudflare',
    url: 'https://www.cloudflare.com/',
  },
  {
    name: 'Resend',
    purpose: 'Team email infrastructure',
    icon: Mail,
    logo: 'https://cdn.simpleicons.org/resend',
    invertOnDark: true,
    url: 'https://resend.com/',
  },
  {
    name: 'WhatsApp',
    purpose: 'Team communication',
    icon: MessageCircle,
    logo: 'https://cdn.simpleicons.org/whatsapp',
    url: 'https://www.whatsapp.com/',
  },
  {
    name: 'Blender',
    purpose: '3D modelling and visualisation',
    icon: Shapes,
    logo: 'https://cdn.simpleicons.org/blender',
    url: 'https://www.blender.org/',
  },
  {
    name: 'Sleep',
    purpose: 'Critical team hardware dependency',
    icon: MoonStar,
    legendary: true,
    videoSrc: '/videos/rickroll.mp4',
  },
];

function BrandIcon({ item }: { item: StackItem }) {
  const [failed, setFailed] = useState(false);
  if (!item.logo || failed) {
    const Icon = item.icon;
    return <Icon size={20} strokeWidth={1.5} aria-hidden="true" />;
  }
  return (
    <img
      src={item.logo}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`h-5 w-5 object-contain ${item.invertOnDark ? 'dark:invert' : ''}`}
    />
  );
}

function StackCard({ item, index, onPlayVideo }: { item: StackItem; index: number; onPlayVideo?: (src: string) => void }) {
  const cardClass = [
    'group relative flex items-start gap-4 rounded-2xl border bg-card/70 p-5 backdrop-blur-sm transition-all duration-300',
    'hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)]',
    item.legendary ? 'border-gold/50 bg-gold/10 hover:border-gold' : 'border-ink/10 hover:border-gold/50',
  ].join(' ');

  const content = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gold/30 text-gold transition-transform duration-300 group-hover:scale-110">
        <BrandIcon item={item} />
      </span>
      <span className="min-w-0">
        <h3 className={`font-mono text-sm uppercase tracking-[0.15em] ${item.legendary ? 'text-gold' : 'text-ink'}`}>
          {item.name}
        </h3>
        <p className="mt-1 font-mono text-xs leading-5 text-ink/55">{item.purpose}</p>
      </span>
      <span className="absolute right-4 top-4 font-mono text-[10px] tracking-widest text-ink/30">
        {String(index + 1).padStart(2, '0')}
      </span>
    </>
  );

  if (item.videoSrc) {
    return (
      <button
        type="button"
        className={cardClass}
        onClick={() => onPlayVideo?.(item.videoSrc!)}
        aria-label={`Play ${item.name}`}
      >
        {content}
      </button>
    );
  }

  if (item.url) {
    return (
      <a href={item.url} target="_blank" rel="noreferrer" aria-label={`${item.name} website`} className={cardClass}>
        {content}
      </a>
    );
  }

  return <article className={cardClass}>{content}</article>;
}

export default function TechStack() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  return (
    <section
      id="stack"
      className="relative scroll-mt-24 overflow-hidden border-t border-ink/10 bg-sand-deep/40 px-6 py-24 sm:py-32"
    >
      <RetroGrid
        className="inset-0"
        angle={65}
        cellSize={60}
        opacity={0.3}
        lightLineColor="#b45309"
        darkLineColor="#d4a02c"
      />

      <div className="relative mx-auto max-w-5xl">
        <p data-animate="fade-in" className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
          The arsenal
        </p>
        <h2 data-animate="blur" className="mt-3 font-display text-fluid-lg text-ink">
          Tech Stack
        </h2>
        <p data-animate="slide-up" className="mt-4 max-w-md font-mono text-sm leading-6 text-ink/60">
          Every tool in the chest — from the FTC SDK to the critical hardware dependency we call
          Sleep.
        </p>

        <div data-stagger className="relative mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STACK.map((item, i) => (
            <StackCard key={item.name} item={item} index={i} onPlayVideo={setVideoSrc} />
          ))}
        </div>
      </div>

      {videoSrc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Video player"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setVideoSrc(null)}
        >
          <video
            src={videoSrc}
            controls
            autoPlay
            className="max-h-[85vh] max-w-full border border-gold/30"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
