# Architecture

How the site is put together, from source file to rendered page.

## Big picture

This is a **static Astro site**. Astro renders every page to plain HTML at build time.
Interactive pieces ("islands") are React components hydrated on top of that HTML using
`client:*` directives. There is no backend, no server functions, and no environment
variables — the output in `dist/` is just files.

Three things power every page:

1. **Content Collections** (`src/content.config.ts`) — markdown with Zod-validated
   frontmatter, loaded at build time.
2. **Build-time helpers** (`src/lib/`) — functions that read collections and glob the
   file system via `import.meta.glob`.
3. **Components** (`src/components/`) — React islands for interactivity and `.astro`
   components for static sections.

## Directory map

```
src/
├── content.config.ts      # defines the collections + their Zod schemas
├── layouts/
│   └── BaseLayout.astro   # shared <head>, fonts, theme script, boot loader
├── pages/                 # one file per route (file-based routing)
│   ├── index.astro        # the single-page experience
│   ├── 404.astro          # themed "Lost at Sea"
│   ├── code.astro         # /code — working snippets
│   ├── code/broken.astro  # /code/broken — snippets to fix
│   ├── crew/[key].astro   # /crew/<key> — one page per pirate
│   ├── contact.astro      # /contact
│   ├── faq.astro          # /faq
│   ├── sponsor.astro      # /sponsor
│   └── what-is-ftc.astro  # /what-is-ftc
├── lib/                   # build-time helpers
│   ├── scan.ts            # shared glob helpers (extension regexes, toUrl)
│   ├── brand.ts           # ship photo + logo lookups
│   ├── crew.ts            # crew collection + photo globbing
│   ├── code.ts            # code snippet discovery
│   ├── media.ts           # gallery scanning
│   ├── utils.ts           # `cn` classname helper
│   └── useThreeScene.ts   # shared Three.js scene lifecycle hook
├── components/            # React islands + .astro sections (see components.md)
├── content/               # the words and media (see content.md)
└── styles/
    └── global.css         # Tailwind v4 @theme tokens, prose, animations
```

## Routing

Astro uses file-based routing, so a file's path is its URL:

| File                        | Route               |
| --------------------------- | ------------------- |
| `pages/index.astro`         | `/`                 |
| `pages/code.astro`          | `/code`             |
| `pages/code/broken.astro`   | `/code/broken`      |
| `pages/crew/[key].astro`    | `/crew/lihan`, etc. |
| `pages/404.astro`           | any unknown route   |

The `[key]` in `crew/[key].astro` is a dynamic segment. The page calls
`getStaticPaths()` (which calls `getCrewCollection()`) so Astro generates one page per
crew member at build time.

## Content pipeline

### Collections (markdown, validated)

`src/content.config.ts` defines five collections using glob loaders + Zod schemas:

| Collection | Folder                       | Used by                          |
| ---------- | ---------------------------- | -------------------------------- |
| `logs`     | `src/content/logs/`          | `RobotLog` island (spec + countdown) |
| `timeline` | `src/content/timeline/`      | `History.astro` timeline         |
| `crew`     | `src/content/crew/`          | `Crew` roster, `crew/[key].astro` |
| `sponsors` | `src/content/sponsors/`      | `sponsor.astro` tiers            |
| `journal`  | `src/content/journal/`       | `JournalSection.astro`           |

Snippets of frontmatter are Zod-schema'd, so an invalid value fails the build with a
helpful message rather than rendering garbage.

### File globs (non-markdown content)

Anything that is a folder of images/videos/models rather than a markdown collection is
discovered with `import.meta.glob(..., { eager: true })`:

- **`src/content/MEDIA/`** → `lib/media.ts::getMedia()` feeds the gallery. Drop a file
  in and it appears on the next build.
- **`src/content/crew/<crew|officers>/<key>/`** → `lib/crew.ts::getCrewPhotos()` globs
  photos for each member's page.
- **`src/content/ship/`** → `lib/brand.ts::getShipPhoto()` picks the first image.
- **`src/content/logos/light|dark/`** → `lib/brand.ts::getLogo()` picks the first image
  in each folder.
- **`src/content/code/<working|broken>/<id>/`** → `lib/code.ts::getCodeSnippets()`
  pairs each `meta.json` with its sibling `code.m` (loaded raw).

`src/lib/scan.ts` is the shared glue: `IMAGE_EXT` / `VIDEO_EXT` regexes, `toUrl()` (an
Astro glob can hand back a string or an `{ src, width, height }` object), and
`firstImage()`. It also exports `toResponsiveImage()`, which runs every photo through
Astro's image service (`getImage`) at build time — outputting WebP plus a responsive
`srcset`/`sizes` so the browser never downloads a full-res JPEG/PNG for a small
thumbnail. The photo helpers (`getMedia`, `getCrewPhotos`, `getShipPhoto`, `getLogo`)
are async and return `ResponsiveImage` objects because of this.

## The animation engine

`src/components/Animate.tsx` is a single global React island rendered once on the
homepage (`index.astro`) that registers GSAP ScrollTrigger and scans the DOM for
special attributes:

| Attribute        | Behaviour                                                        |
| ---------------- | ---------------------------------------------------------------- |
| `data-animate`   | Entrance reveal; value picks a variant (e.g. `slide-right`).     |
| `data-stagger`   | Animates the element's **direct children** in a wave.            |
| `data-parallax`  | Drifts the element vertically against the scroll direction.      |
| `data-draw`      | Grows a vertical line as you scroll (timeline rule).             |

`data-animate` supports optional `data-y`, `data-x`, `data-delay`, `data-duration`, and
`data-ease` overrides. Available variants live in the `VARIANTS` map: `fade-up`,
`fade-in`, `slide-left`, `slide-right`, `scale`, `blur`, `tilt`, `pop`, `flip`, `swing`,
`rise`, `spin`, `flip-up`, `zoom`, `skew`, `bounce`. Everything respects
`prefers-reduced-motion` (reveals become static).

Other independent animation islands:

- **`CourseLine.tsx`** — the gold "course" line pinned to the left edge. Measures each
  section's scroll position, computes 0–1 progress, and labels the current landmark.
- **`Bulletin.tsx` / `ui/text-flipping-board.tsx`** — the split-flap "Tavern Tales"
  board, scroll-driven.
- **`Hero.tsx`** — Motion springs turn pointer position into a 3D tilt of the compass.

## 3D

`src/lib/useThreeScene.ts` is the shared lifecycle for every WebGL prop. It handles
renderer creation (graceful when WebGL is unavailable), an always-on-viewport loop that
pauses when the element scrolls out of view or the tab is hidden, a single static render
under `prefers-reduced-motion`, optional baked environment lighting for metals, and full
disposal on unmount.

Consumers pass `build(group)` (populate the scene once) and `animate(group, delta, elapsed)`
(per frame). They get back `mountRef` to attach the renderer:

- **`ShipModel3D.tsx`** — loads `/models/raging-heaven.glb` (the robot), rotates it, and
  includes a fallback for load failure.
- **`DeepSeaBackground.tsx`** — a particle field behind the ship section.
- **`Anchor3D.tsx`**, **`ShipWheel3D.tsx`** — smaller brass props.

The hero compass is **not** WebGL — it's the hand-crafted SVG `CompassRose.tsx`, which
keeps the hero fast.

## Theming

Tailwind CSS 4 is configured **in CSS**, not JS. All tokens live in
`src/styles/global.css` under `@theme` (colors like `--color-gold`, fonts like
`--font-display`, plus keyframes). There is no `tailwind.config.mjs`.

Dark mode toggles a `dark` class on `<html>` (the theme script in `BaseLayout.astro`
reads `localStorage` / system preference before paint to avoid a flash). The toggle is
`ui/animated-theme-toggler.tsx`, which uses the View Transitions API to clip-path a
shape (circle, star, hexagon…) across the viewport on switch.

## Conventions

- **Islands hydrate with `client:visible` / `client:load`** — this is an Astro site, so
  there is no `"use client"`.
- **Design tokens via utility classes** — `text-gold`, `border-ink/20`, `bg-sand`, etc.
  Never hardcode colors.
- **Content-driven sections** — add words to `src/content/`, not to components.
- **TypeScript strict** — `astro check` (which wraps `tsc`) runs in CI and on `npm run check`.
