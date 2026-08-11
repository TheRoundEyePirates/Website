# The Round Eye Pirates — Docs

The map to the ship. This is the home port of documentation for the team website
([the code](https://github.com/TheRoundEyePirates/Website)).

## Index

| Doc                                        | What it covers |
| ------------------------------------------ | -------------- |
| [Architecture](architecture.md)            | How the code is wired together: pages, islands, `src/lib/`, the animation engine, 3D, theming. |
| [Content](content.md)                      | Every way to add or edit content — crew, robot log, timeline, sponsors, journal, code snippets, media — without touching code. |
| [Components](components.md)                | A reference for every component aboard, island and `.astro` alike. |

## Quick facts

- **Framework:** Astro 7 (static output), React 19 islands via `@astrojs/react`.
- **Styling:** Tailwind CSS 4, CSS-first config inside `src/styles/global.css` (no
  `tailwind.config.mjs`).
- **Content:** Astro Content Collections (Content Layer API) with Zod-validated frontmatter,
  plus `import.meta.glob` scans for anything that isn't a markdown collection.
- **Animations:** GSAP 3 + ScrollTrigger (`data-animate` attributes) and Motion.
- **3D:** Three.js, shared lifecycle via `useThreeScene`.
- **Type checking:** `npm run check` (Astro's bundled `astro check`).

Start with [Architecture](architecture.md) for the big picture, then jump to
[Content](content.md) the moment you need to change words or photos.
