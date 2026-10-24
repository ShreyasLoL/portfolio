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

Accent is used for hover, active navigation and work tabs, the theme toggle focus indicator, and `::selection`. Default to system preference via `prefers-color-scheme`, with a persisted toggle. `color-scheme` follows the active theme so scrollbars, form controls, and overscroll match.

**Known exceptions (hex outside CSS variables):** the three `<meta name="theme-color">` values in `index.html`, which mirror `--color-bg` for light and dark. The theme initialization script uses these values for the browser chrome.

---

# Typography

Newsreader for all text; Newsreader italic only for the statement and contact line. JetBrains Mono for metadata and small labels. Hero name: Newsreader 500, `--size-hero-name: clamp(44px, 7vw, 72px)`. Hero quote: Newsreader italic 400, `--size-hero-quote: clamp(18px, 2vw, 24px)`. Hero title: JetBrains Mono 400, `--size-hero-title: clamp(14px, 1.4vw, 16px)`, secondary color, 0.08em letter spacing. Body: 16px. Metadata: 13px. Weights: 400 and 500 only.

**Loading:** self-hosted woff2, Latin subset, in `assets/fonts/` (Newsreader roman variable 400–500, Newsreader italic 400, JetBrains Mono 400). Above-the-fold faces are preloaded. `font-display: swap` with metric-matched local fallbacks (Times New Roman / Courier New) so the swap does not shift layout.

**Wrapping:** `text-wrap: balance` on the name and statement; `text-wrap: pretty` on body text. Never on mono metadata or navigation.

---

# Spacing

8px base. Steps: 8 / 16 / 24 / 48 / 96. Use the existing steps for spacing. Sections are 96px apart on desktop and 64px apart on mobile.

---

# Layout

One page with a centered, left-aligned content column, `--width-column: 880px`. Side margins remain empty. No sidebar. The fixed top bar is `--height-topbar: 80px`, with a 3-column `1fr auto 1fr` layout: separate small name link at left, navigation centered in the viewport, and space for the fixed top-right theme toggle. The navigation remains in normal flow and each link has a 44px minimum hit height. It fades in over `--p` 0.60–0.85 and ignores pointer input before 0.60; keyboard focus reveals it at any scroll position. A solid top-bar background layer and divider fade in over `--p` 0.50–0.85. The toggle stays fixed at the top-right, 24px from the right edge and vertically centered in the bar, with pointer events enabled. The hero is 82svh high at all widths; content sits around 45% viewport height and contains only name, title, and statement. The first section begins 48px below the hero. Work reveals once, when it reaches the viewport area above the bottom 20%, with a 300ms opacity and 8px upward entrance; it remains visible without JavaScript or under reduced motion. Work, Proof, and Contact appear in that order as 01, 02, and 03.

The document scrollbar is hidden while wheel, touch, keyboard, and anchor scrolling remain available.

Below Contact, one quiet row aligned to the content column's left edge holds the education metadata and a circular, 48px, full-color avatar. The divider-colored circle remains visible if the image fails to load.

**Theme toggle:** fixed top-right of the viewport (24px right offset; vertically centered in the 80px top bar), 44px hit area, always visible, icon-only, no background or border. Hover scales the icon slightly and shifts it to the accent color. Circular reveal originates from the toggle's actual center. Theme init and View Transition behavior remain unchanged.

---

# Sections

Work has five tabs: three project placeholders labeled Project A, Project B, and Project C, followed by two redacted tabs shown as short bars with the accessible name “Redacted.” The tablist follows the horizontal ARIA tabs pattern, supports arrow keys and Home/End, and uses a 2px transform underline. Without JavaScript, every panel remains visible in a stack. Project panels contain a title, two-line summary, one `type · year · status` metadata line, and optional `[github]` / `[site]` links that appear only when their `data-url` value is set. Redacted panels show divider-colored bars; hover or focus reveals `in progress` with a clip-path wipe. Each tab carries an empty `data-repo` hook, and `highlightRepo(repo)` is a no-op.

The existing GitHub contribution renderer and GraphQL-shaped data file are reused at the end of Work. The monochrome intensity ramp uses divider for zero and text at 25%, 45%, 70%, and 100% opacity. The graph has an opacity-only diagonal entrance wave, keyboard navigation, a `date · N commits` readout, and a `N contributions, past year` caption. `data/contributions.json` is a snapshot from the public GitHub profile dated 2026-10-23: 148 contributions across 2025-10-19 through 2026-10-23.

Proof uses three unboxed rows. Two rows are placeholders; the CyberX row shows the supplied `2026 · RNSIT` details, placeholder metadata, and `[redacted]` for the withheld result. Row hover and focus shift 2px.

Contact uses the supplied italic line and the existing GitHub and LinkedIn links. The email link points to `your-email@example.com` until replaced.

---

# Motion

On load, the name, title, and statement fade up 8px over 300ms, staggered by 150ms. One passive, animation-frame-throttled scroll listener sets `--p` from 0 to 1 across the hero and toggles `is-past-hero` at 0.60 (0.50 with reduced motion). CSS disperses the in-flow hero quote (opacity 1→0 over p 0–0.35, drift −8px), title (0–0.50, −16px), and name (0.10–0.65, −24px) using only opacity and transform. The separate top-bar name and nav fade in over p 0.60–0.85; focus within the nav reveals it immediately. The solid top-bar background and divider fade in over 0.50–0.85. Under reduced motion, drift is removed and opacity switches at p 0.5 with no transition.

The active section in the numbered navigation follows section entry and uses `aria-current="location"`. Tabs, rows, the contribution cells, and the redacted reveal use the same `cubic-bezier(0.22, 1, 0.36, 1)` easing. Theme changes retain the directional circular reveal and sun/moon icon morph, both 600ms with that easing. Under `prefers-reduced-motion`, transitions and anchor scrolling are instant; scroll-linked transforms and entrance motion are disabled, and the top-bar name appears with opacity at p 0.5. No blur is used. Motion, when enabled, uses transform, opacity, and clip-path only; layout properties are not animated.

---

# Design choices

- **Type:** Newsreader + JetBrains Mono. Serif for voice, mono for metadata.
- **Light background:** warm marble-toward-sand (`#F7F4ED`).
- **Accent:** verdigris, used sparingly.
- **Toggle:** icon-only sun/moon morph, placed at the fixed top-right.
- **Avatar:** small, circular, full color. It reads as a person, not a decoration.
- **Favicon:** the avatar, square.
- **Theme direction:** light radiates from the toggle and dark collapses back into it. The asymmetry is intentional.
- **Work/Proof:** no cards; project details live in a restrained tab panel and proof lives in rows.
- **Contribution graph:** monochrome, with opacity defining intensity and the source snapshot dated in the data file.

---

# Do not add

Skill bars, tech-stack lists, testimonials, emojis, stock icons, extra sections or pages, or copy not provided in DESIGN.md. Do not implement the maximalist form; it is parked in `docs/MAXIMAL.md`.

---

# Open items

- Replace the marked project and proof placeholders, add any real project URLs, and replace the placeholder email address. See `PLACEHOLDERS.md`.
- First Writeup entry
- Domain and hosting
- Open Graph image
- Refresh the dated GitHub contribution snapshot when needed.

---

# Working rules for AI agents

Read DESIGN.md before making any change. Do not introduce colors, fonts, sizes, or spacing outside these tokens. If a requested change alters a design decision, update the relevant section of DESIGN.md in the same change. There is no decisions log; this file always describes the current state.
