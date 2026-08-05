import { useEffect, useRef, useState } from 'react';
import { Anchor, Menu, X } from 'lucide-react';

const LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '#about' },
  { label: 'Ship', href: '#ship' },
  { label: 'Robot', href: '#robot' },
  { label: 'Crew', href: '#crew' },
  { label: 'Journal', href: '#journal' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'History', href: '#history' },
  { label: 'Code', href: '#code' },
  { label: 'Location', href: '#location' },
  { label: 'FAQ', href: '/faq/' },
  { label: 'Contact', href: '/contact/' },
] as const;

interface NavbarProps {
  /** Logo for light surfaces (navbar). Falls back to the text brand. */
  logo?: string | null;
}

export default function Navbar({ logo = null }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('#home');
  const progressRef = useRef<HTMLSpanElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastYRef = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const update = () => {
      rafRef.current = null;
      if (progressRef.current) {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
        progressRef.current.style.transform = `scaleX(${p})`;
      }
    };

    const onScroll = () => {
      const y = window.scrollY;
      const goingDown = y > lastYRef.current;
      lastYRef.current = y;

      setScrolled(y > 24);
      // Slide away on scroll-down (past the hero), glide back on scroll-up.
      if (!reduceMotion) {
        setHidden(goingDown && y > 160 && !open);
      }
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(update);
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', onScroll);
    };
  }, [open]);

  useEffect(() => {
    const sections = LINKS.map((link) => link.href)
      .filter((href) => href.startsWith('#'))
      .map((href) => document.querySelector<HTMLElement>(href))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(`#${entry.target.id}`);
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${
        hidden ? '-translate-y-full' : ''
      } ${
        scrolled
          ? 'border-ink/10 bg-sand-light/90 shadow-[0_1px_0_rgba(28,25,23,0.05)] backdrop-blur-sm'
          : 'border-transparent bg-transparent'
      }`}
    >
      <span
        ref={progressRef}
        aria-hidden="true"
        className="absolute left-0 top-0 z-10 h-[2px] w-full origin-left bg-gold"
        style={{ transform: 'scaleX(0)' }}
      />

      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <a
          href="#home"
          className="flex shrink-0 items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-ink transition-colors hover:text-gold sm:text-sm"
        >
          {logo ? (
            <img
              src={logo}
              alt="The Round Eye Pirates"
              className="h-9 w-auto max-w-[10rem] object-contain"
            />
          ) : (
            <>
              <Anchor size={16} className="text-gold" strokeWidth={1.5} aria-hidden="true" />
              <span>REP·37060</span>
            </>
          )}
        </a>

        <ul className="hidden items-center gap-6 font-mono text-xs uppercase tracking-[0.25em] text-ink/70 lg:flex">
          {LINKS.map((link) => {
            const isActive =
              active === link.href || (link.href === '/' && active === '#home');
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={isActive ? 'true' : undefined}
                  className={`relative transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:bg-gold/60 after:transition-transform after:duration-300 after:ease-out after:content-[''] ${
                    isActive
                      ? 'text-gold after:scale-x-100'
                      : 'hover:text-gold hover:after:scale-x-100'
                  }`}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          className="flex items-center justify-center rounded-sm border border-ink/20 p-2 text-ink transition-colors hover:border-gold/50 hover:text-gold lg:hidden"
        >
          {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`grid transition-[grid-template-rows] duration-300 ease-out lg:hidden ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <ul
            className={`flex flex-col gap-1 border-t border-ink/10 bg-sand-light/95 px-6 py-4 backdrop-blur-sm transition-opacity duration-300 ${
              open ? 'opacity-100' : 'opacity-0'
            }`}
          >
          {LINKS.map((link) => {
            const isActive =
              active === link.href || (link.href === '/' && active === '#home');
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`block px-2 py-2 font-mono text-xs uppercase tracking-[0.25em] transition-colors ${
                    isActive ? 'text-gold' : 'text-ink/70 hover:text-gold'
                  }`}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
          </ul>
        </div>
      </div>
    </header>
  );
}
