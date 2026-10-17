# Identity

**Name:** Shreyas I Sutrave
**Title:** Reverse Engineer | CSE
**Page title:** Shreyas | Portfolio (exact, do not rewrite)
**Tone:** Dry, concrete, no adjectives about myself, quiet confidence with no ego, minimal and uncluttered, curiosity gap (proof visible, a sense that more exists).

---

# Copy (exact, do not rewrite)

**Statement** *(italic)*: "I read systems the way I read people: for what they're not saying." Line breaks are fixed to its meaning across three block lines: "I read systems the way" / "I read people:" / "for what they're not saying." (formatting rather than a copy change).

**Contact line** *(italic)*: "Curious about how things think, whether they're running on silicon or not."

**Education metadata** (in `.sidebar-bottom` above the avatar, with 1px hairline border):
- B.Tech CSE-IoT
- Cybersecurity
- REVA University · 2029

Sections are numbers only for now: 01, 02, 03, 04 Contact. Proof rows are removed for now. Mimo Kiosk is excluded for now.

**Contribution grid (01)**: metadata line "N contributions, past year" (singular "contribution" for 1), legend "less" / "more", tooltip "N contributions · Mon DD, YYYY" (e.g. "12 contributions · Oct 07, 2026").

---

# Color tokens

CSS variables only, never hard-coded in components.

| Token | Light | Dark |
|---|---|---|
| `--color-bg` | `#F7F4ED` | `#0F0E0E` |
| `--color-divider` | `#E6E1D5` | `#282624` |
| `--color-secondary` | `#6B665B` | `#8F8B82` |
| `--color-text` | `#1A1815` | `#ECE8DF` |
| `--color-accent` | `#2F6F62` | `#5FB3A0` |

Accent is used only on: hover, the active nav item, and `::selection`. Default to system preference via `prefers-color-scheme`, with a persisted toggle. `color-scheme` follows the active theme so scrollbars, form controls, and overscroll match.

**Known exceptions (hex outside CSS variables):** only where variables can't reach. The two `<meta name="theme-color">` tags in `index.html`, which mirror `--color-bg` for light and dark (the browser chrome color; JS reuses them on first paint and reads `--color-bg` on toggle). Change them together with the tokens.

---

# Typography

Newsreader for all text (italic only for the statement and contact line); JetBrains Mono only for metadata and small labels. Title: Newsreader 400, 20px (`--size-title`), two-tone (primary "Reverse Engineer" in `--color-text`, secondary "| CSE" in `--color-secondary`, pipe spacing via margin). Sizes: name 30px, title 20px, statement 18px, body 16px, metadata 13px. Body line-height 1.6. Weights 400 and 500 only.

**Loading:** self-hosted woff2, Latin subset, in `assets/fonts/` (Newsreader roman variable 400–500, Newsreader italic 400, JetBrains Mono 400). Above-the-fold faces are preloaded. `font-display: swap` with metric-matched local fallbacks (Times New Roman / Courier New, via `size-adjust` and metric overrides derived from the font files) so the swap doesn't shift layout. If a new weight or style is used, add its file and fallback face.

**Wrapping:** `text-wrap: balance` on the name, statement, and contact line; `text-wrap: pretty` on body text. Never on mono metadata or nav.

---

# Spacing

8px base. Steps: 8 / 16 / 24 / 48 / 96. 96px between sections on desktop, 64px on mobile, 16px between rows.

---

# Layout

Desktop: fixed left column (~280px) with name, title, statement, nav, and the hairline footer with education metadata and avatar at the bottom; right column scrolls, max-width ~640px. Mobile: single column; header row with name on the left and avatar top-right (48px, circular, full color), title and naturally wrapping statement below, nav row, and hairline education block below. Rows not cards; no shadows, gradients, or decorative icons; everything left-aligned to one edge.

**Avatar:** circular (`border-radius: 50%`), always full color, no grayscale. 72px desktop (in hairline footer), 48px mobile (in header row top-right).

**Theme toggle:** fixed top-right of the viewport on desktop (24px offsets); on mobile, docked at the bottom-right in the thumb zone (24px offsets, safe-area-inset-bottom aware). 44px hit area, always visible, icon-only, no background or border. Hover scales the icon slightly and shifts it to the accent color. Circular reveal originates from the toggle's actual center.

**Contribution grid:** in section 01, below the divider (24px). 7 rows (Sun–Sat) by one column per week (53), square 9px cells, 3px gap, 2px radius, no borders or shadows; 633px wide, left-aligned in the 640px column. Height is reserved before data loads (no layout shift). On narrow screens the grid scrolls horizontally inside its box (scrollbar hidden, no page overflow), starting at the most recent weeks. Five levels from existing tokens only: level 0 = `--color-divider`; levels 1–4 = `color-mix(in srgb, var(--color-text) 25% / 45% / 70% / 100%, var(--color-divider))`; thresholds are quartiles of non-zero days, computed in JS. Tooltip on hover and keyboard focus: mono 13px, `--color-bg` on `--color-text`, centered above the cell, clamped to the column edges, flips below if the viewport top would cut it. Keyboard: one tab stop, arrow keys move by day/week, Home/End jump to first/last, monochrome `--color-text` focus ring on the cell. Container is `role="img"` with an aria-label giving the total. Metadata line below (16px), mono 13px, `--color-secondary`: total plus a five-swatch legend. Entrance: cells fade up 4px, 300ms, staggered 10ms per column (520ms stagger) when the grid enters the viewport; instant under `prefers-reduced-motion`. If the data fails to load, nothing renders. Data: `data/contributions.json` in the GitHub GraphQL `contributionCalendar` shape; phase 1 is MOCK data (`"mock": true`, generated by `scripts/mock-contributions.mjs`); phase 2 replaces the file only.

---

# Motion

One easing curve everywhere: `cubic-bezier(0.22, 1, 0.36, 1)`. Animate only `transform`, `opacity`, and `clip-path`. Respect `prefers-reduced-motion` (instant, no movement).

- **Entrance:** content fades up 8px on entering the viewport, 300ms. On mobile, avatar and name fade up together (8px, 300ms).
- **Hover:** rows shift 2px. Hover styles are gated behind `@media (hover: hover)` to prevent sticky states on touch devices. On desktop coarse pointers (`@media (pointer: coarse) and (min-width: 721px)`), nav links and contact links provide 44px tap targets with `.nav-list` gap set to 0. On mobile, nav items have 24px gap and 44px tap targets.
- **Avatar load:** the placeholder circle (`--color-divider`) holds the space until the photo has loaded, then the photo fades in, opacity only, 300ms. If the photo is missing, the placeholder stays.
- **Theme transition:** directional circular reveal anchored at the toggle, 600ms. Light radiates out from the toggle and covers the page. Dark collapses back into the toggle. No flash of the wrong theme at any point. Other transitions are paused while it runs.
- **Toggle icon morph:** 600ms, in sync with the page reveal. To dark: sun rays retract into the core and rotate, the moon mask slides in, the core scales up so the crescent reads clearly. To light: rays extend back out from the core. Same easing, slight stagger (rays, then core, then mask).

---

# Design choices

- **Type:** Newsreader + JetBrains Mono, chosen over Geist and Plex pairings. Serif for voice, mono for metadata.
- **Light background:** warm marble-toward-sand (`#F7F4ED`), chosen over a cooler marble.
- **Accent:** verdigris, the single accent, used sparingly.
- **Toggle:** icon-only sun/moon morph, placed where it is obvious instead of buried in the sidebar.
- **Avatar:** small, circular, full color. It reads as a person, not a decoration.
- **Favicon:** the avatar, square.
- **Theme direction:** light is emitted from a point, dark is absorbed back into it. The asymmetry is intentional.
- **Proof rows:** removed pending a decision on presentation.
- **Contribution grid:** monochrome ramp built from existing tokens (divider to text), no accent and no new colors, so it reads as texture, not decoration. Lives in 01. Phase 1 uses mock data; real GitHub data comes in phase 2 as a drop-in file replacement.

---

# Do not add

Skill bars, tech-stack lists, testimonials, hero animations, emojis, stock icons, extra sections or pages, or any copy not provided in DESIGN.md.

---

# Open items

- How proof (hackathon and CTF results) is presented
- First Work entry
- First Writeup entry
- Domain and hosting
- Open Graph image
- 404 page

---

# Working rules for AI agents

Read DESIGN.md before making any change. Do not introduce colors, fonts, sizes, or spacing outside these tokens. If a requested change alters a design decision, update the relevant section of DESIGN.md in the same change. There is no decisions log; this file always describes the current state.
A maximalist form is planned, see docs/MAXIMAL.md. Do not implement.