# The Round Eye Pirates — FTC Team 37060

Official single-page website for FIRST Tech Challenge team **37060**, The Round Eye Pirates.
Founded July 26, 2026.

Built with **Astro 7**, **React 19 islands**, **TypeScript**, **Tailwind CSS 4**, **GSAP + ScrollTrigger**,
**Three.js**, and **Motion** (split-flap board). Static output, deploy-ready for Vercel. No backend.

## Stack

| Concern       | Tool                                        |
| ------------- | ------------------------------------------- |
| Framework     | [Astro](https://astro.build) 7.x (static)   |
| Islands       | [React](https://react.dev) 19 via `@astrojs/react` |
| Content       | Astro Content Collections (Content Layer API, `@astrojs/mdx`) |
| Styling       | Tailwind CSS 4 (CSS-first config)           |
| Animation     | GSAP 3 + ScrollTrigger, Motion (flip board) |
| 3D            | Three.js (hero compass rose)                |
| Icons         | lucide-react                                |
| Type checking | `astro check`                               |

## Project structure

```
.
├── astro.config.mjs            # Astro + React + MDX + Tailwind v4 Vite plugin
├── tsconfig.json               # strict, react-jsx
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── logos/
│       └── ftc.svg               # FIRST Tech Challenge logo (footer)
└── src/
    ├── content.config.ts       # Content Layer config: glob loaders + Zod schemas
    ├── content/
    │   ├── logs/
    │   │   └── robot-log.md    # "Captain's Log" entry with spec frontmatter
    │   └── timeline/
    │       └── team-founded.md # Timeline entry (order, date, title + body)
    ├── lib/
    │   └── utils.ts            # `cn` classname helper
    ├── styles/
    │   └── global.css          # Tailwind 4 @theme tokens, grain, prose, reveal CSS
    ├── components/
    │   ├── Animate.tsx         # GSAP scroll engine: reveals, stagger, parallax, hero-scrub, draw
    │   ├── Navbar.tsx          # Fixed nav + scroll progress bar
    │   ├── Hero.tsx            # FTC 37060 / team name / tagline / compass frame
    │   ├── CompassRose.tsx     # Three.js low-poly golden compass, pauses off-viewport
    │   ├── About.tsx           # Two-column crew section + ShipWheel3D figure
    │   ├── ShipWheel3D.tsx     # Three.js rotating golden ship's wheel
    │   ├── RobotLog.tsx        # Log card rendering collection frontmatter + body
    │   ├── Crew.tsx            # Ship's roster (crew + coaches)
    │   ├── Bulletin.tsx        # Split-flap board section
    │   ├── TextFlippingBoardDemo.tsx  # Scroll-driven rotating messages for the flip board
    │   ├── ui/
    │   │   └── text-flipping-board.tsx  # Split-flap component (ported from Aceternity)
    │   ├── History.astro       # Dotted timeline, driven by the timeline collection
    │   ├── Location.tsx        # Google Maps embed of Hawke's Bay, NZ
    │   ├── Anchor3D.tsx        # Three.js swaying golden anchor (footer)
    │   ├── Footer.tsx          # Contact, FIRST/FTC logos, trademark note
    │   └── ShipDivider.tsx     # Vintage section divider
    └── pages/
        ├── index.astro         # Single page wiring all islands + content collection
        └── 404.astro           # Themed "Lost at Sea" 404
```

> **Note on Tailwind:** v4 uses a CSS-first config — design tokens live in
> `@theme` inside `src/styles/global.css`, so no `tailwind.config.mjs` is needed.
> To add a legacy JS config later, load it with `@config` in `global.css`.

> **Note on React:** this is an Astro site, so `"use client"` is not needed — islands hydrate via
> `client:visible` / `client:load` directives instead.

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:4321`.

## Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start the dev server                 |
| `npm run build`    | Static build into `dist/`            |
| `npm run preview`  | Preview the production build         |
| `npm run check`    | Type-check with `astro check`        |

## Editing the robot log

The "Captain's Log" card is driven by `src/content/logs/robot-log.md`, loaded by the `glob` loader in
`src/content.config.ts`. Frontmatter is validated by the Zod schema there (adding a field will be
enforced on build). The markdown body is rendered through `render(entry)` and passed to the
`RobotLog` island as its children.

```markdown
---
season: "2026-2027"
drive: "Mecanum"
motors: 6
servos: 2
controlSystem: "REV Control Hub"
status: "Operational"
---

Your narrative here (rendered as the log entry body).
```

### Timeline entries

The "Ship's Log" timeline is driven by markdown files in `src/content/timeline/`.
Add a new file to add an entry — entries are sorted by `order`, lowest first:

```markdown
---
order: 2
date: August 4, 2026
title: First Scrimmage
---

Our first taste of competition — three matches, three lessons.
```

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel — the **Astro** preset is auto-detected.
3. Deploy. `npm run build` produces static files served from `dist/`.

No environment variables or server functions are required.

## Design notes

- Palette: aged parchment `#f5f0e6`, charcoal `#1c1917`, weathered navy `#1e3a5f`,
  antique gold `#b45309`, plus a subtle CSS grain overlay.
- Type: Courier Prime (display), IBM Plex Mono (mono accents), Inter (body).
- Every section fades up (`y: 40 → 0`, `opacity: 0 → 1`, `power3.out`, 1s) via
  `data-animate` attributes driven by GSAP ScrollTrigger.
- The navbar gains `backdrop-blur-sm` + parchment/90 once you scroll past the hero, with a
  scroll-spy active link state and a mobile menu.
- The hero compass rose is a single Three.js scene that pauses its render loop when
  off-viewport or the tab is hidden.
- Accessibility: skip-to-content link, `:focus-visible` outlines, `aria-current`/`aria-expanded`
  states, and full `prefers-reduced-motion` support (reveals become static, rotation stops).
- Also includes a themed 404 page and JSON-LD structured data.
