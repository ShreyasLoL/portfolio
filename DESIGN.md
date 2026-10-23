# Identity

**Name:** Shreyas
**Title:** Reverse Engineer | CSE
**Page title:** Shreyas | Portfolio (exact, do not rewrite)
**Tone:** Dry, concrete, no adjectives about myself, quiet confidence with no ego, minimal and uncluttered.

---

# Copy (exact, do not rewrite)

**Statement** *(italic)*: "I read systems the way I read people: for what they're not saying." Line breaks are fixed to its meaning across three block lines: "I read systems the way" / "I read people:" / "for what they're not saying."

**Education metadata:** "B.Tech CSE-IoT · Cybersecurity · REVA University · 2029"

**Sections:** Work, Proof, Contact. Section numbers are generated from order. Writeups is a commented-out section and navigation link between Proof and Contact; enabling both inserts it as 03 and moves Contact to 04.

**Contact line** *(italic)*: "Curious about how things think, whether they're running on silicon or not."

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

Accent is used only for hover, the active navigation item, and `::selection`. Default to system preference via `prefers-color-scheme`, with a persisted toggle. `color-scheme` follows the active theme so scrollbars, form controls, and overscroll match.

**Known exceptions (hex outside CSS variables):** the three `<meta name="theme-color">` values in `index.html`, which mirror `--color-bg` for light and dark. The theme initialization script uses these values for the browser chrome.

---

# Typography

Newsreader for all text; Newsreader italic only for the statement and contact line. JetBrains Mono for metadata and small labels. Hero name: Newsreader 500, `--size-hero-name: clamp(44px, 7vw, 72px)`. Hero quote: Newsreader italic 400, `--size-hero-quote: clamp(18px, 2vw, 24px)`. Hero title: JetBrains Mono 400, `--size-meta`, secondary color. Body: 16px. Metadata: 13px. Weights: 400 and 500 only.

**Loading:** self-hosted woff2, Latin subset, in `assets/fonts/` (Newsreader roman variable 400–500, Newsreader italic 400, JetBrains Mono 400). Above-the-fold faces are preloaded. `font-display: swap` with metric-matched local fallbacks (Times New Roman / Courier New) so the swap does not shift layout.

**Wrapping:** `text-wrap: balance` on the name and statement; `text-wrap: pretty` on body text. Never on mono metadata or navigation.

---

# Spacing

8px base. Steps: 8 / 16 / 24 / 48 / 96. Use the existing steps for spacing. Sections are 96px apart on desktop and 64px apart on mobile.

---

# Layout

One page with a centered, left-aligned content column, `--width-column: 880px`. Side margins remain empty. No sidebar. The fixed top bar is `--height-topbar: 72px`, transparent over the hero, with the name at the left, a single-row numbered navigation, and the theme toggle fixed at the top-right. The navigation reserves the toggle's 44px hit area plus one 16px spacing step. A divider fades in as the hero is left. The hero is centered, 88svh high on desktop and 100svh on mobile. The 01 Work, 02 Proof, and 03 Contact shells follow in that order.

The avatar is circular, 48px, full color, beside the education metadata. The divider-colored circle remains visible if the image fails to load.

**Theme toggle:** fixed top-right of the viewport (24px offsets), 44px hit area, always visible, icon-only, no background or border. Hover scales the icon slightly and shifts it to the accent color. Circular reveal originates from the toggle's actual center. Theme init and View Transition behavior remain unchanged.

---

# Motion

On load, the name, title, statement, and education line fade up 8px over 300ms, staggered by 150ms. One passive, animation-frame-throttled scroll listener sets `--p` from 0 to 1 across the hero. It drives the same H1 from its centered position into the top-bar name slot with transform only. The statement fades to 18% opacity and drifts up 4px; the title and education line fade out. The top-bar divider fades in. Handoff geometry is recalculated on resize and font load.

The active section in the numbered navigation follows section entry and uses `aria-current="location"`. Theme changes retain the directional circular reveal and sun/moon icon morph, both 600ms with `cubic-bezier(0.22, 1, 0.36, 1)`. Under `prefers-reduced-motion`, transitions and anchor scrolling are instant; scroll-linked transforms and entrance motion are disabled, and the top-bar name swaps in with opacity. Motion, when enabled, uses transform, opacity, and clip-path only.

---

# Design choices

- **Type:** Newsreader + JetBrains Mono. Serif for voice, mono for metadata.
- **Light background:** warm marble-toward-sand (`#F7F4ED`).
- **Accent:** verdigris, used sparingly.
- **Toggle:** icon-only sun/moon morph, placed at the fixed top-right.
- **Avatar:** small, circular, full color. It reads as a person, not a decoration.
- **Favicon:** the avatar, square.
- **Theme direction:** light radiates from the toggle and dark collapses back into it. The asymmetry is intentional.

---

# Do not add

Skill bars, tech-stack lists, testimonials, emojis, stock icons, extra sections or pages, or copy not provided in DESIGN.md. Do not implement the maximalist form; it is parked in `docs/MAXIMAL.md`.

---

# Open items

- Work and Proof content
- First Writeup entry
- Domain and hosting
- Open Graph image
- 404 page

---

# Working rules for AI agents

Read DESIGN.md before making any change. Do not introduce colors, fonts, sizes, or spacing outside these tokens. If a requested change alters a design decision, update the relevant section of DESIGN.md in the same change. There is no decisions log; this file always describes the current state.
