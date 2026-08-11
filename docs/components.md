# Components

A reference to everything in `src/components/`. React islands hydrate on top of the
server-rendered HTML (via `client:visible` / `client:load` in the pages); `.astro`
components are fully server-rendered static sections.

## Islands (`.tsx`) — layout & navigation

| Component | What it does |
| --------- | ------------ |
| `NavBar.tsx` | Fixed top nav with dropdown groups, scroll-spy active states, scroll-progress bar, mobile menu, and the theme toggle. |
| `CourseLine.tsx` | The gold "course" line pinned to the left edge that fills as you scroll and labels the current section. |
| `Footer.tsx` | Dark-navy footer: anchor, logo, quick links, GitHub handle, FTC/FIRST attribution. |
| `TreasureChest.tsx` | The `arrr` easter egg — listens for secret words, opens the chest with coins + sparks, fires the `rept:treasure` event, tracks hauls in `localStorage`. |

## Islands — hero & ship

| Component | What it does |
| --------- | ------------ |
| `Hero.tsx` | Full-screen intro: compass, team name, tagline (丸い目の海賊団), scroll cue. Pointer moves a Motion spring into a 3D tilt. |
| `CompassRose.tsx` | Hand-crafted SVG brass compass (no WebGL) — animated rose + swaying needle; spins up when the treasure event fires. |
| `ShipSection.astro` | Static ship section wiring in the 3D model and photo. |
| `ShipModel3D.tsx` | Three.js loader for `/models/raging-heaven.glb` (the robot) with OrbitControls, sail animation, and a fallback. |
| `DeepSeaBackground.tsx` | Three.js particle field behind the ship. |
| `ShipDivider.tsx` | Vintage section divider used between sections. |
| `About.tsx` | Two-column crew/manifest section. |

## Islands — robot, crew & data

| Component | What it does |
| --------- | ------------ |
| `RobotLog.tsx` | Renders `logs/robot-log.md`: spec table + the event countdown. |
| `Countdown.tsx` | The countdown cells — days/hours/minutes/seconds to `nextEvent`. |
| `Crew.tsx` | The roster, split into crew and coach columns from the `crew` collection. |
| `CrewPhotoGallery.tsx` | Per-member photo grid with a keyboard-friendly lightbox (arrows / Esc). |
| `TypewriterBio.tsx` | Types out a crew bio; renders inline links from markdown via `marked`. |
| `TeamStatsPanel.tsx` | Fetches `https://api.ftcscout.org/rest/v1` for a member's `api.team` and shows their record, with a graceful no-data state. |

## Islands — media & extras

| Component | What it does |
| --------- | ------------ |
| `MediaGallerySection.astro` | Static section that calls `getMedia()` and passes the items to the gallery island. |
| `MediaGallery.tsx` | Photo/video grid with a lightbox (arrow keys, Esc). |
| `Bulletin.tsx` | The "Tavern Tales" split-flap board — scroll-driven messages. |
| `TextFlippingBoardDemo.tsx` | Wires rotating messages into the flip board. |
| `ui/text-flipping-board.tsx` | The split-flap cell component itself (ported from Aceternity). |
| `QuoteTicker.tsx` | Rotating quote band. |
| `JournalSection.astro` | Renders the latest `journal` entry. |
| `History.astro` | Dotted timeline from the `timeline` collection. |
| `CodeBlock.tsx` | Copy-to-clipboard button wrapper for Shiki code output. |
| `Location.tsx` | Google Maps embed of Hawke's Bay, NZ. |
| `Glossary.tsx` | The glossary of FTC/pirate terms (accordion). |
| `TechStack.tsx` | The tools the team uses (Android Studio, FTC SDK, Pedro Pathing, Onshape…). |
| `GitHubRepos.tsx` | Links to the org (`TheRoundEyePirates`) and user (`the-round-eye-pirates`) GitHub accounts. |
| `Anchor3D.tsx` | Three.js swaying golden anchor. |
| `ShipWheel3D.tsx` | Three.js rotating ship's wheel. |

## System islands

| Component | What it does |
| --------- | ------------ |
| `Animate.tsx` | The global GSAP scroll engine. Scans for `data-animate`, `data-stagger`, `data-parallax`, `data-draw` and runs the reveal/parallax/draw tweens. See architecture.md. |
| `ui/animated-theme-toggler.tsx` | Light/dark toggle with a shape-clipped View Transitions animation (circle, star, hexagon, …). |
| `ui/retro-grid.tsx` | WebGL shader grid background used on select pages. |

## Pages & layout

| File | What it does |
| ---- | ------------ |
| `layouts/BaseLayout.astro` | Shared `<head>`: fonts (Pirata One, Courier Prime, IBM Plex Mono, Inter), meta, theme script, and the boot loader. Most pages use it. |
| `pages/index.astro` | The single-page voyage — wires all sections and content collections, plus `Animate`, `NavBar`, `Footer`, `TreasureChest`, and the JSON-LD structured data. |
| `pages/code.astro` / `pages/code/broken.astro` | Shiki-rendered working / broken snippets from `lib/code.ts`. |
| `pages/crew/[key].astro` | One page per crew member (photo gallery, bio, live embeds, TeamStatsPanel). |
| `pages/404.astro` | Themed "Lost at Sea" page. |

## How to read a component

- **Islands receive props** from their parent `.astro` page. Example: the crew photo
  grid gets `photos` and `name` from the person page, which got them from
  `lib/crew.ts::getCrewPhotos()`.
- **`Animate` and `CourseLine` are global** — they read the DOM directly, so pages just
  sprinkle `data-animate="fade-up"` attributes and get animations for free.
- **Shared constants** live at the top of each file (e.g. `TREASURE_EVENT` in both
  `TreasureChest.tsx` and `CompassRose.tsx`).
