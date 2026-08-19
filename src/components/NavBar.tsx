import { useEffect, useRef, useState } from 'react';
import { AnimatedThemeToggler } from './ui/animated-theme-toggler';
import type { ResponsiveImage } from '../lib/scan';

interface NavLink {
  label: string;
  href: string;
}

interface NavGroup {
  label: string;
  children: NavLink[];
}

type NavEntry = NavLink | NavGroup;

const NAV: NavEntry[] = [
  { label: 'Home', href: '/' },
  {
    label: 'The Ship',
    children: [
      { label: 'About', href: '/#about' },
      { label: 'Ship', href: '/#ship' },
      { label: 'Robot', href: '/#robot' },
      { label: 'Crew', href: '/#crew' },
      { label: 'Journal', href: '/#journal' },
      { label: 'Gallery', href: '/#gallery' },
      { label: 'History', href: '/#history' },
    ],
  },
  {
    label: 'Resources',
    children: [
      { label: 'Code', href: '/code/' },
      { label: 'Broken Code', href: '/code/broken/' },
      { label: 'What is FTC?', href: '/what-is-ftc/' },
      { label: 'FAQ', href: '/faq/' },
    ],
  },
  { label: 'Sponsor', href: '/sponsor/' },
  { label: 'Socials', href: '/socials/' },
  { label: 'Contact', href: '/contact/' },
];

function isGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry;
}

function allHrefs(entries: NavEntry[]): string[] {
  return entries.flatMap((entry) =>
    isGroup(entry) ? entry.children.map((c) => c.href) : [entry.href],
  );
}

/** Strip the leading path so `/#about` and `#about` both compare as `#about`. */
function anchorOf(href: string): string | null {
  const i = href.indexOf('#');
  return i >= 0 ? href.slice(i) : null;
}

function hrefActive(href: string, activeHref: string): boolean {
  return (
    activeHref === href ||
    (anchorOf(href) !== null && activeHref === anchorOf(href)) ||
    (href === '/' && activeHref === '#home')
  );
}

function entryActive(entry: NavEntry, activeHref: string): boolean {
  if (isGroup(entry)) return entry.children.some((c) => hrefActive(c.href, activeHref));
  return hrefActive(entry.href, activeHref);
}

interface NavBarProps {
  /** Logo for light surfaces (the nav bar). Falls back to a text brand. */
  logo?: ResponsiveImage | null;
  logoAlt?: string;
  onMobileMenuClick?: () => void;
}

export default function NavBar({ logo = null, logoAlt = 'The Round Eye Pirates', onMobileMenuClick }: NavBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [activeHref, setActiveHref] = useState<string>('/');
  const navBarRef = useRef<HTMLElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLSpanElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Set the initial active link from the address bar only after mount so the
  // server-rendered markup matches the first client render.
  useEffect(() => {
    setActiveHref(window.location.pathname);
  }, []);

  // Entrance animation via CSS.
  useEffect(() => {
    const bar = navBarRef.current;
    if (bar) {
      bar.classList.add('nav-bar-enter');
    }
  }, []);

  // Thin gold scroll progress bar + active-section tracking.
  useEffect(() => {
    // Cache the page height so the per-frame handler never forces a reflow
    // by reading `scrollHeight` mid-scroll. Refresh it on resize / load.
    let max = 0;
    const refreshMax = () => {
      max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    };

    const update = () => {
      rafRef.current = null;
      if (progressRef.current) {
        const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
        progressRef.current.style.transform = `scaleX(${p})`;
      }
    };

    const onScroll = () => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(update);
      }
    };

    refreshMax();
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', refreshMax);
    window.addEventListener('load', refreshMax);

    const sections = allHrefs(NAV)
      .map((href) => anchorOf(href))
      .filter((hash): hash is string => hash !== null)
      .map((hash) => document.querySelector<HTMLElement>(hash))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHref(`#${entry.target.id}`);
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => {
      observer.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', refreshMax);
      window.removeEventListener('load', refreshMax);
    };
  }, []);

  // Close the dropdown when clicking outside the bar or pressing Escape.
  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (navItemsRef.current && !navItemsRef.current.contains(event.target as Node)) {
        setOpenGroup(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenGroup(null);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  /** Close the mobile menu (CSS transitions handle the animation). */
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenGroup(null);
    onMobileMenuClick?.();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    setOpenGroup(null);
    onMobileMenuClick?.();
  };

  return (
    <div className="nav-bar-container">
      <span
        ref={progressRef}
        aria-hidden="true"
        className="nav-progress"
        style={{ transform: 'scaleX(0)' }}
      />
      <nav className="nav-bar" aria-label="Primary" ref={navBarRef}>
        <a className="nav-logo" href="/" aria-label="Home">
          {logo ? (
            <img
              src={logo.src}
              srcSet={logo.srcSet}
              sizes={logo.sizes}
              width={logo.width}
              height={logo.height}
              alt={logoAlt}
              decoding="async"
            />
          ) : (
            <span className="nav-logo-text">REP</span>
          )}
        </a>

        <div className="nav-items desktop-only" ref={navItemsRef}>
          <ul className="nav-list">
            {NAV.map((entry) => {
              const active = entryActive(entry, activeHref);
              const groupOpen = isGroup(entry) && openGroup === entry.label;
              return (
                <li
                  key={entry.label}
                  className="nav-list-item"
                  onMouseEnter={() => isGroup(entry) && setOpenGroup(entry.label)}
                  onMouseLeave={() => isGroup(entry) && setOpenGroup(null)}
                >
                  {isGroup(entry) ? (
                    <>
                      <button
                        type="button"
                        className={`nav-item${active ? ' is-active' : ''}`}
                        aria-haspopup="true"
                        aria-expanded={groupOpen}
                        onClick={() => setOpenGroup(groupOpen ? null : entry.label)}
                      >
                        {entry.label}
                        <svg
                          className={`nav-caret${groupOpen ? ' is-open' : ''}`}
                          viewBox="0 0 16 16"
                          width="10"
                          height="10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M3 6l5 5 5-5" />
                        </svg>
                      </button>
                      <div className={`nav-dropdown${groupOpen ? ' is-open' : ''}`} role="menu">
                        {entry.children.map((child) => (
                          <a
                            key={child.href}
                            href={child.href}
                            role="menuitem"
                            className={`nav-dropdown-item${
                              hrefActive(child.href, activeHref) ? ' is-active' : ''
                            }`}
                            onClick={() => setOpenGroup(null)}
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    </>
                  ) : (
                    <a
                      href={entry.href}
                      className={`nav-item${active ? ' is-active' : ''}`}
                      aria-label={entry.label}
                      aria-current={active ? 'true' : undefined}
                    >
                      {entry.label}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="nav-actions">
          <AnimatedThemeToggler
            variant="star"
            duration={600}
            className="nav-toggler"
            aria-label="Toggle theme"
          />
          <button
            className={`mobile-menu-button mobile-only${isMobileMenuOpen ? ' is-open' : ''}`}
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu-popover mobile-only${isMobileMenuOpen ? ' is-open' : ''}`}>
        <ul className="mobile-menu-list">
          {NAV.map((entry) =>
            isGroup(entry) ? (
              <li key={entry.label} className="mobile-menu-group">
                <span className="mobile-menu-group-label">{entry.label}</span>
                {entry.children.map((child) => (
                  <a
                    key={child.href}
                    href={child.href}
                    className={`mobile-menu-link${
                      hrefActive(child.href, activeHref) ? ' is-active' : ''
                    }`}
                    onClick={closeMobileMenu}
                  >
                    {child.label}
                  </a>
                ))}
              </li>
            ) : (
              <li key={entry.href}>
                <a
                  href={entry.href}
                  className={`mobile-menu-link${
                    hrefActive(entry.href, activeHref) ? ' is-active' : ''
                  }`}
                  onClick={closeMobileMenu}
                >
                  {entry.label}
                </a>
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  );
}
