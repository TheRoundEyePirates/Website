import { useEffect, useRef, useState } from 'react';
import { Anchor, Menu, X } from 'lucide-react';

const LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Robot', href: '#robot' },
  { label: 'Crew', href: '#crew' },
  { label: 'History', href: '#history' },
  { label: 'Location', href: '#location' },
  { label: 'Contact', href: '#contact' },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('#home');
  const progressRef = useRef<HTMLSpanElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
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
      setScrolled(window.scrollY > 24);
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
  }, []);

  useEffect(() => {
    const sections = LINKS.map((link) => document.querySelector<HTMLElement>(link.href)).filter(
      (el): el is HTMLElement => el !== null,
    );

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
        scrolled
          ? 'border-ink/10 bg-[#f5f0e6]/90 shadow-[0_1px_0_rgba(28,25,23,0.05)] backdrop-blur-sm'
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
          <Anchor size={16} className="text-gold" strokeWidth={1.5} aria-hidden="true" />
          <span>REP·37060</span>
        </a>

        <ul className="hidden items-center gap-7 font-mono text-xs uppercase tracking-[0.25em] text-ink/70 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                aria-current={active === link.href ? 'true' : undefined}
                className={`relative transition-colors ${
                  active === link.href
                    ? 'text-gold after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:bg-gold/60'
                    : 'hover:text-gold'
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          className="flex items-center justify-center rounded-sm border border-ink/20 p-2 text-ink transition-colors hover:border-gold/50 hover:text-gold md:hidden"
        >
          {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`md:hidden ${open ? 'block' : 'hidden'}`}
      >
        <ul className="flex flex-col gap-1 border-t border-ink/10 bg-[#f5f0e6]/95 px-6 py-4 backdrop-blur-sm">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={active === link.href ? 'true' : undefined}
                className={`block px-2 py-2 font-mono text-xs uppercase tracking-[0.25em] transition-colors ${
                  active === link.href ? 'text-gold' : 'text-ink/70 hover:text-gold'
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
