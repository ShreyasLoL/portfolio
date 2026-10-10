# Identity

**Name:** Shreyas I Sutrave
**Title:** Reverse Engineer | CSE
**Tone:** Dry, concrete, no adjectives about myself, quiet confidence with no ego, minimal and uncluttered, curiosity gap (proof visible, a sense that more exists).

---

# Copy (exact, do not rewrite)

**Statement** *(italic)*: "I read systems the way I read people: for what they're not saying."

**Contact line** *(italic)*: "Curious about how things think, whether they're running on silicon or not."

Sections are numbers only for now: 01, 02, 03, 04 Contact. Proof rows are removed for now. Mimo Kiosk is excluded for now.

---

# Color tokens

CSS variables only, never hard-coded in components.

| Token | Light | Dark |
|---|---|---|
| `--color-bg` | `#EFEBE3` | `#131210` |
| `--color-divider` | `#DDD8CD` | `#26241F` |
| `--color-secondary` | `#6A665C` | `#8F8B82` |
| `--color-text` | `#1F1D19` | `#ECE8DF` |
| `--color-accent` | `#2F6F62` | `#5FB3A0` |

Accent is used only on: hover, the active nav item, `::selection`, and the favicon. Default to system preference via `prefers-color-scheme`, with a persisted toggle. `color-scheme` follows the active theme so scrollbars, form controls, and overscroll match.

**Known exceptions (hex outside CSS variables):** only where variables can't reach. The favicon data URI, and the two `<meta name="theme-color">` tags in `index.html`, which mirror `--color-bg` for light and dark (the browser chrome color; JS reuses them on first paint and reads `--color-bg` on toggle). Change them together with the tokens.

---

# Typography

Newsreader for all text (italic only for the statement and contact line); JetBrains Mono only for metadata and small labels. Sizes: name 30px, statement 20px, body 16px, metadata 13px. Body line-height 1.6. Weights 400 and 500 only.

**Loading:** self-hosted woff2, Latin subset, in `assets/fonts/` (Newsreader roman variable 400–500, Newsreader italic 400, JetBrains Mono 400). Above-the-fold faces are preloaded. `font-display: swap` with metric-matched local fallbacks (Times New Roman / Courier New, via `size-adjust` and metric overrides derived from the font files) so the swap doesn't shift layout. If a new weight or style is used, add its file and fallback face.

**Wrapping:** `text-wrap: balance` on the name, statement, and contact line; `text-wrap: pretty` on body text. Never on mono metadata or nav.

---

# Spacing

8px base. Steps: 8 / 16 / 24 / 48 / 96. 96px between sections on desktop, 64px on mobile, 16px between rows.

---

# Layout

Desktop: fixed left column (~280px) with name, title, statement, nav, and the avatar at the bottom; right column scrolls, max-width ~640px. Mobile: single column, identity on top, nav row, avatar below. Rows not cards; no shadows, gradients, or decorative icons; everything left-aligned to one edge.

**Avatar:** circular (`border-radius: 50%`), always full color, no grayscale. 72px desktop, 48px mobile.

**Theme toggle:** fixed top-right of the viewport (24px offsets, same on mobile), 44px hit area, always visible, icon-only, no background or border. Hover scales the icon slightly and shifts it to the accent color.

---

# Motion

One easing curve everywhere: `cubic-bezier(0.22, 1, 0.36, 1)`. Animate only `transform`, `opacity`, and `clip-path`. Respect `prefers-reduced-motion` (instant, no movement).

- **Entrance:** content fades up 8px on entering the viewport, 300ms.
- **Hover:** rows shift 2px.
- **Avatar load:** the placeholder circle (`--color-divider`) holds the space until the photo has loaded, then the photo fades in, opacity only, 300ms. If the photo is missing, the placeholder stays.
- **Theme transition:** directional circular reveal anchored at the toggle, 600ms. Light radiates out from the toggle and covers the page. Dark collapses back into the toggle. No flash of the wrong theme at any point. Other transitions are paused while it runs.
- **Toggle icon morph:** 600ms, in sync with the page reveal. To dark: sun rays retract into the core and rotate, the moon mask slides in, the core scales up so the crescent reads clearly. To light: rays extend back out from the core. Same easing, slight stagger (rays, then core, then mask).

---

# Design choices

- **Type:** Newsreader + JetBrains Mono, chosen over Geist and Plex pairings. Serif for voice, mono for metadata.
- **Light background:** warm marble-toward-sand (`#EFEBE3`), chosen over a cooler marble.
- **Accent:** verdigris, the single accent, used sparingly.
- **Toggle:** icon-only sun/moon morph, placed where it is obvious instead of buried in the sidebar.
- **Avatar:** small, circular, full color. It reads as a person, not a decoration.
- **Theme direction:** light is emitted from a point, dark is absorbed back into it. The asymmetry is intentional.
- **Proof rows:** removed pending a decision on presentation.

---

# Do not add

Skill bars, tech-stack lists, testimonials, hero animations, emojis, stock icons, extra sections or pages, or any copy not provided in DESIGN.md.

---

# Open items

- How proof (hackathon and CTF results) is presented
- First Work entry
- First Writeup entry
- Domain and hosting
- Favicon and Open Graph image
- 404 page

---

# Working rules for AI agents

Read DESIGN.md before making any change. Do not introduce colors, fonts, sizes, or spacing outside these tokens. If a requested change alters a design decision, update the relevant section of DESIGN.md in the same change. There is no decisions log; this file always describes the current state.