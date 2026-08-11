import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { AnimatedThemeToggler } from './ui/animated-theme-toggler';

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
  /** Logo for dark surfaces (the nav track). Falls back to a text brand. */
  logo?: string | null;
  logoAlt?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
}

export default function NavBar({
  logo = null,
  logoAlt = 'The Round Eye Pirates',
  ease = 'power3.easeOut',
  baseColor = '#0f0e12',
  pillColor = 'var(--color-gold)',
  hoveredPillTextColor = 'var(--color-parchment)',
  pillTextColor,
  onMobileMenuClick,
}: NavBarProps) {
  const resolvedPillTextColor = pillTextColor ?? 'var(--color-sand)';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [activeHref, setActiveHref] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/',
  );
  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRefs = useRef<(gsap.core.Timeline | null)[]>([]);
  const activeTweenRefs = useRef<(gsap.core.Tween | null)[]>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);
  const progressRef = useRef<HTMLSpanElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector('.nav-label');
        const white = pill.querySelector('.nav-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1 });
    }

    if (!reduceMotion) {
      const logoEl = logoRef.current;
      const navItems = navItemsRef.current;

      if (logoEl) {
        gsap.set(logoEl, { scale: 0 });
        gsap.to(logoEl, { scale: 1, duration: 0.6, ease });
      }

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: 'hidden' });
        gsap.to(navItems, { width: 'auto', duration: 0.6, ease });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [ease]);

  // Thin gold scroll progress bar + active-section tracking.
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
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });

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
    };
  }, []);

  // Close the dropdown when clicking/tapping outside the nav or pressing Escape.
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

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto',
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto',
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, { rotate: 360, duration: 0.2, ease, overwrite: 'auto' });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    setOpenGroup(null);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      lines[0] &&
        gsap.to(lines[0], { rotation: newState ? 45 : 0, y: newState ? 3 : 0, duration: 0.3, ease });
      lines[1] &&
        gsap.to(lines[1], { rotation: newState ? -45 : 0, y: newState ? -3 : 0, duration: 0.3, ease });
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          { opacity: 1, y: 0, scaleY: 1, duration: 0.3, ease, transformOrigin: 'top center' },
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: 'top center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' });
          },
        });
      }
    }

    onMobileMenuClick?.();
  };

  const cssVars = {
    '--base': baseColor,
    '--nav-bg': pillColor,
    '--hover-text': hoveredPillTextColor,
    '--nav-text': resolvedPillTextColor,
  } as React.CSSProperties;

  return (
    <div className="nav-bar-container">
      <span
        ref={progressRef}
        aria-hidden="true"
        className="nav-progress"
        style={{ transform: 'scaleX(0)' }}
      />
      <nav className="nav-bar" aria-label="Primary" style={cssVars}>
        <a
          className="nav-logo"
          href="/"
          aria-label="Home"
          onMouseEnter={handleLogoEnter}
          ref={logoRef}
        >
          {logo ? (
            <img src={logo} alt={logoAlt} ref={logoImgRef} />
          ) : (
            <span className="nav-logo-text">REP</span>
          )}
        </a>

        <div className="nav-items desktop-only" ref={navItemsRef}>
          <ul className="nav-list">
            {NAV.map((entry, i) => {
              const active = entryActive(entry, activeHref);
              const groupOpen = isGroup(entry) && openGroup === entry.label;
              return (
                <li
                  key={entry.label}
                  className="nav-list-item"
                  onMouseEnter={() => {
                    handleEnter(i);
                    if (isGroup(entry)) setOpenGroup(entry.label);
                  }}
                  onMouseLeave={() => {
                    handleLeave(i);
                    if (isGroup(entry)) setOpenGroup(null);
                  }}
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
                        <span
                          className="nav-hover-circle"
                          aria-hidden="true"
                          ref={(el) => {
                            circleRefs.current[i] = el;
                          }}
                        />
                        <span className="label-stack">
                          <span className="nav-label">{entry.label}</span>
                          <span className="nav-label-hover" aria-hidden="true">
                            {entry.label}
                          </span>
                        </span>
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
                      <span
                        className="nav-hover-circle"
                        aria-hidden="true"
                        ref={(el) => {
                          circleRefs.current[i] = el;
                        }}
                      />
                      <span className="label-stack">
                        <span className="nav-label">{entry.label}</span>
                        <span className="nav-label-hover" aria-hidden="true">
                          {entry.label}
                        </span>
                      </span>
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
            className="mobile-menu-button mobile-only"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            ref={hamburgerRef}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </nav>

      <div className="mobile-menu-popover mobile-only" ref={mobileMenuRef} style={cssVars}>
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
                    onClick={() => setIsMobileMenuOpen(false)}
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
                  onClick={() => setIsMobileMenuOpen(false)}
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
