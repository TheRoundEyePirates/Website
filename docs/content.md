# Content

Everything the site says and shows. Most updates here need **zero code changes** — add a
file (or edit frontmatter) and the next build picks it up.

> Where does content live? Markdown collections in `src/content/` are defined in
> `src/content.config.ts`. Photos/videos/models live in plain folders inside
> `src/content/` and are picked up by `import.meta.glob` scans (see architecture.md).

---

## 1. The Ship's Log (robot spec + event countdown)

**File:** `src/content/logs/robot-log.md`

Frontmatter drives the spec card and the homepage countdown:

```markdown
---
season: "2026-2027"
drive: "TBD"
motors: 0
servos: 0
controlSystem: "TBC"
status: "In Build"            # Operational | In Build | Retired
nextEvent: "2026-12-12T08:00:00+13:00"   # ISO datetime the countdown targets
nextEventLabel: "National Championship"
nextEventDates: "12–13 December 2026"    # human-readable, shown on the card
nextEventLocation: "Hastings, New Zealand"
---

**Ship's Log — Day 3, August 11, 2026.**

The rumors have company…
```

The markdown body is the log narrative; it renders inside the `RobotLog` island. The
`nextEvent*` fields are optional — omit them to hide the countdown.

---

## 2. The Crew

**Folder:** `src/content/crew/<crew|officers>/<key>/`

One folder per person. The folder's first segment decides the roster column:

| Folder       | Role shown        |
| ------------ | ----------------- |
| `crew/`      | crew member       |
| `officers/`  | coach/mentor      |

Inside each `<key>` folder (the key must be a unique slug, e.g. `lihan`):

- `bio.md` — the person's data + story
- any images — auto-globbed into that person's photo gallery (`CrewPhotoGallery`)

### `bio.md` frontmatter

```markdown
---
first: "Lihan"
last: "Boyle"
title: ""                  # optional honorific
nickname: "Le Pur Et Dur"  # optional, shown between first and last
showEmail: true            # show nickname@theroundeyepirates.com on the page
order: 1                   # roster position within the column, lowest first
role: "crew"               # optional; overrides the folder-derived role
hidden: false              # hide from roster + person pages
api:                       # optional live FTC Scout data panel
  team: 30841
  season: 2025             # optional; defaults to the API's season
live:                      # optional list of iframe embeds (e.g. live stream)
  - label: "Live Stream"
    url: "https://…"
    aspect: "16 / 9"       # default
---

The person's story, rendered on their page at /crew/<key>.
```

Notes:

- The `api` block powers `TeamStatsPanel`, which fetches
  `https://api.ftcscout.org/rest/v1`. If a team has no record there, the panel shows a
  graceful "no data" state.
- `hidden: true` members still exist in the collection but never render.

---

## 3. Timeline (Ship's Log)

**Folder:** `src/content/timeline/` — one markdown file per entry.

```markdown
---
order: 2            # page order, lowest first
date: "August 4, 2026"
title: "First Scrimmage"
---

Our first taste of competition — three matches, three lessons.
```

`History.astro` renders the collection into the dotted timeline, newest (lowest order)
first.

---

## 4. Sponsors

**Folder:** `src/content/sponsors/` — one markdown file per tier.

```markdown
---
tier: "Fleet Sponsor"
price: "$2,500+ per season"
tagline: "The flag we sail under"
color: "#f59e0b"         # card accent, default #fbbf24
featured: true           # highlighted tier (badge + gold card)
order: 5
perks:
  - "Everything in Captain"
  - "Major recognition across team branding, website, social media and events"
---
```

Optional body copy.

Current tiers: **Crewmate** ($100+), **Deckhand** ($250+), **Navigator** ($500+),
**Captain** ($1,000+), **Fleet Sponsor** ($2,500+, featured). The `/sponsor/` page
renders these into the "Choose Your Level Of Support" grid, sorted by `order`.

---

## 5. Journal

**Folder:** `src/content/journal/` — one markdown file per entry.

```markdown
---
date: "August 5, 2026"
entry: "001"           # shown as "No. 001", default "001"
---

Today we…
```

`JournalSection.astro` renders the most recent entry.

---

## 6. Code snippets

**Folder:** `src/content/code/<working|broken>/<id>/`

Each snippet is a pair of files:

```
src/content/code/working/constants-pods/
├── code.m          # the raw source
└── meta.json       # metadata
```

```json
{
  "title": "Constants & Pods",
  "description": "A one-line blurb.",
  "language": "java",
  "order": 1
}
```

The top-level folder decides the page: `working/` → `/code`, `broken/` → `/code/broken`.
`lib/code.ts` pairs each `meta.json` with its `code.m` and `code.astro` renders them with
Shiki (nord theme). Any folder outside `working|broken` is skipped with a warning.

**Easiest way to add one:** run `npm run add-code` and answer the prompts — it scaffolds
both files for you.

---

## 7. Gallery (Ship's Album)

**Folder:** `src/content/MEDIA/`

Drop any supported file in and it appears in the gallery on the next build:

- Images: `jpg, jpeg, png, gif, webp, avif, bmp, svg`
- Videos: `mp4, webm, ogg, mov, m4v`

Subfolders are scanned too. Captions come from the filename (dashes/underscores become
spaces). Sorted alphabetically. Click a photo to open the keyboard-friendly lightbox.

---

## 8. Ship photo & logos

| What            | Folder                      | How the first file wins |
| --------------- | --------------------------- | ----------------------- |
| Robot photo     | `src/content/ship/`         | first image found       |
| Light-theme logo| `src/content/logos/light/`  | shown in the navbar     |
| Dark-theme logo | `src/content/logos/dark/`   | shown in the footer     |

---

## 9. FAQs, "What is FTC", contact

These live as plain pages with inline content:

- `src/pages/faq.astro` — the FAQ accordion (`Glossary` is a separate component; both are
  edited in these files).
- `src/pages/what-is-ftc.astro` — the explainer page.
- `src/pages/contact.astro` — contact details.
- The crew email format used across the site is `nickname@theroundeyepirates.com`.

---

## Editing checklist

1. Edit/add a file under `src/content/…`.
2. Run `npm run check` — the Zod schemas validate your frontmatter and globs validate
   your folders.
3. `npm run build` to confirm it renders, then `npm run dev` to look at it.
4. Commit and push — Vercel deploys `main` automatically.
