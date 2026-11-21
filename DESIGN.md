# Identity

**Name:** Shreyas
**Title:** Reverse Engineer | CSE
**Page title:** Shreyas | Portfolio (exact, do not rewrite)
**Tone:** Dry, concrete, no adjectives about myself, quiet confidence with no ego, minimal and uncluttered.

---

# Copy (exact, do not rewrite)

**Statement** *(italic)*: "I read systems the way I read people: for what they're not saying." Line breaks are fixed to its meaning across three block lines: "I read systems the way" / "I read people:" / "for what they're not saying."

**Education metadata:** "B.Tech CSE-IoT · Cybersecurity · REVA University · 2029"

**Sections:** Work, Proof, Connect. Section numbers are generated from order. Writeups is a commented-out section and navigation link between Proof and Connect; enabling both inserts it as 03 and moves Connect to 04.

---

# Color tokens

CSS variables only, never hard-coded in components.

| Token | Light | Dark |
|---|---|---|
| `--color-bg` | `#F5F4F1` | `#0B0B0B` |
| `--color-divider` | `#E0DFDA` | `#1C1C1C` |
| `--color-secondary` | `#5E5D59` | `#8A8A87` |
| `--color-text` | `#111110` | `#F0EFEC` |
| `--color-accent` | `#2F6F62` | `#5FB3A0` |

Accent is used for hover, the active navigation dot, active work tabs, the theme toggle focus indicator, and `::selection`. Default to system preference via `prefers-color-scheme`, with a persisted toggle. `color-scheme` follows the active theme so scrollbars, form controls, and overscroll match.

**Known exceptions (hex outside CSS variables):** the three `<meta name="theme-color">` values in `index.html`, which mirror `--color-bg` for light and dark. The theme initialization script uses these values for the browser chrome.

---

# Typography

Newsreader for all text; Newsreader italic only for the statement. JetBrains Mono for metadata and small labels. Hero name: Newsreader 500, `--size-hero-name: clamp(44px, 7vw, 72px)`. Hero quote: Newsreader italic 400, `--size-hero-quote: clamp(18px, 2vw, 24px)`. Hero title: JetBrains Mono 400, `--size-hero-title: clamp(14px, 1.4vw, 16px)`, secondary color, 0.08em letter spacing. Body: 16px. Metadata: 13px. Weights: 400 and 500 only.

**Loading:** self-hosted woff2, Latin subset, in `assets/fonts/` (Newsreader roman variable 400–500, Newsreader italic 400, JetBrains Mono 400). Above-the-fold faces are preloaded. `font-display: swap` with metric-matched local fallbacks (Times New Roman / Courier New) so the swap does not shift layout.

**Wrapping:** `text-wrap: balance` on the name and statement; `text-wrap: pretty` on body text. Never on mono metadata or navigation.

---

# Spacing

8px base. Steps: 8 / 16 / 24 / 48 / 96. Use the existing steps for spacing. Sections are 96px apart on desktop and 64px apart on mobile.

---

# Layout

One page with a centered, left-aligned content column, `--width-column: 880px`. Side margins remain empty. No sidebar. The fixed top bar is `--height-topbar: 80px`, with a 3-column `1fr auto 1fr` layout: separate small name link at left, navigation centered in the viewport, and space for the fixed top-right theme toggle. The navigation remains in normal flow and each link has a 44px minimum hit height. It fades in over `--p` 0.60–0.85 and ignores pointer input before 0.60; keyboard focus reveals it at any scroll position. A solid top-bar background layer and divider fade in over `--p` 0.50–0.85. The toggle stays fixed at the top-right, 24px from the right edge and vertically centered in the bar, with pointer events enabled. The hero is 100svh high at all widths; sticky `.hero-content` stays centered around 45% viewport height until `#work` rises to 48px below it, and contains only name, title, and statement. The first section begins 48px below the hero. Hero-to-Work progress travel is capped to at most one viewport height; scroll snap is disabled in favor of smooth free scrolling and the eased `--p` transition. Work's label, tabs, and panel wrapper rise 16px and fade in continuously as `--w` goes from 0 to 1 between hero progress 0.08 and 0.55. Tall sections remain freely scrollable. Without JavaScript, content remains visible. Work, Proof, and Connect appear in that order as 01, 02, and 03.

The document scrollbar is hidden while wheel, touch, keyboard, and anchor scrolling remain available.

Below Connect, one quiet row aligned to the content column's left edge holds the education metadata and a circular, 48px, full-color avatar. The divider-colored circle remains visible if the image fails to load.

**Theme toggle:** fixed top-right of the viewport (24px right offset; vertically centered in the 80px top bar), 44px hit area, always visible, icon-only, no background or border. Hover scales the icon slightly and shifts it to the accent color. Circular reveal originates from the toggle's actual center. Theme init and View Transition behavior remain unchanged.

---

# Sections

Work has five tabs: three project placeholders labeled Project A, Project B, and Project C, followed by two redacted tabs shown as short bars with the accessible name “Redacted.” The tablist follows the horizontal ARIA tabs pattern, supports arrow keys and Home/End (centering overflowed tabs smoothly, or instantly under reduced motion), contains horizontal overscroll alongside the contribution scroller, and uses a 2px transform underline that snaps on initial layout and resize and glides on tab switches. Without JavaScript, every panel remains visible in a stack. With JavaScript, all panels share one CSS grid cell so panel height stays fixed across tab switches; inactive panels hide via opacity and delayed `visibility` instead of collapsing layout, and panels cross-slide 4px horizontally in the direction of tab selection. Project panels contain a title, two-line summary, one `type · year · status` metadata line, and optional `[github]` / `[site]` links that appear only when their `data-url` value is set. Redacted panels fill the panel height with six divider-colored bars; hover, keyboard focus, or tap on touch devices reveals `in progress` with a clip-path wipe. Each tab carries an empty `data-repo` hook, and `highlightRepo(repo)` is a no-op.

Below the tab panels and before the contribution graph, a `Minor` projects list uses the `.section-label` styling without a section counter prefix and holds three placeholder rows separated by 1px `--color-divider` rules with 16px vertical padding. Each row pairs a left-aligned title with right-aligned `stack · year` metadata (`--size-meta`, `--color-secondary`), stacking the title above metadata on mobile (`<720px`). When a row has a URL, the whole row renders as an external anchor (`target="_blank" rel="noopener noreferrer"`) with a trailing `↗`; without a URL, it renders plain with no arrow. Hover and keyboard focus shift the row 2px and set the title to `--color-accent`. The label and rows enter with staggered `.reveal` fade-ups and respect `prefers-reduced-motion`.

The existing GitHub contribution renderer and GraphQL-shaped data file are reused at the end of Work. Before `data/contributions.json` loads, the graph reserves its final grid and month-row height with a static divider-colored skeleton so sections below never shift. The monochrome intensity ramp uses divider for zero and text at 25%, 45%, 70%, and 100% opacity. The graph has an opacity-only diagonal entrance wave, keyboard navigation, a `date · N commits` readout, and a `N contributions, past year` caption. `data/contributions.json` is a snapshot from the public GitHub profile dated 2026-11-19: 230 contributions across 2025-11-16 through 2026-11-19.

Proof uses three unboxed rows. Two rows are placeholders; the CyberX row shows the supplied `2026 · RNSIT` details, placeholder metadata, and `[redacted]` for the withheld result. Row hover and keyboard focus shift 2px.

Connect uses three left-aligned inline SVG icon links (GitHub, LinkedIn, Email) in a 24px viewBox matching the theme-toggle icon's 2px stroke with round caps and joins, each in a 44px hit area spaced by `--space-3` with the first item offset by `-10px` so the visible icon aligns flush with the section label's left edge. Icons use `--color-secondary`, shift to `--color-accent` and lift `translateY(-2px)` on hover (`@media (hover: hover)`) or `:focus-visible` over `--dur-hover`, and depress `scale: 0.94` on `:active` over `--dur-press`. Each link carries an `aria-label` (`GitHub`, `LinkedIn`, `Email`) with no tooltip; the email link points to `your-email@example.com` until replaced. Without JavaScript, the icons remain visible and clickable.

---

# Motion

Motion tokens in `:root` govern all timing: `--ease: cubic-bezier(0.22, 1, 0.36, 1)`, `--dur-press: 120ms`, `--dur-hover: 200ms`, `--dur-reveal: 300ms`, `--dur-theme: 600ms`, and `--stagger: 40ms`.

On load at `scrollY === 0`, the name, title, and statement fade up 8px over 300ms, staggered by 150ms (skipped if loaded mid-scroll). One passive scroll listener targets `--p` as `scrollY / snapDistance`, where `snapDistance` is cached from the Work section's top offset minus the top-bar height (capped to at most one viewport height and reachable scroll) and updated on resize and font load. The value eases toward its target with frame-rate-independent damping equivalent to 0.14 per 60Hz frame and stops within 0.001, snapping synchronously to its exact target on initial load, `scrollend`, `hashchange`, resize, and font load so anchor and hash landings rest at full opacity; reduced motion applies the target immediately. Progress is written only when changed, to `.hero`, `.topbar`, and Work's label, tablist, and panel wrapper (never `#work` itself). CSS disperses the sticky `.hero-content` name (opacity 1→0 over p 0.38–0.78, drift −24px over 0.20–0.78), title (0.44–0.84, −16px over 0.24–0.84), and quote (0.52–0.94, −8px over 0.28–0.94) using only opacity and transform, overlapping Work's entrance; `will-change` is scoped to `.hero.is-scrolling` only while the hero is mid-transition. The separate top-bar name and nav fade in over p 0.60–0.85; focus within the nav or on the top-bar name reveals them immediately. The solid top-bar background and divider fade in over 0.50–0.85. Work's label, tablist, and panel wrapper use `--w = clamp((p - 0.08) / 0.47, 0, 1)` for reversible opacity and upward translation. Under reduced motion, `.hero-content` is static, hero text and Work stay at full opacity with no scroll-linked drift or translation, and the top-bar name and nav switch opacity at p 0.5 with no transition.

The Minor list, Proof, and Connect enter via staggered `.reveal` fade-ups (8px over `--dur-reveal`, `--stagger` per item, capped at 4 items per section), scoped behind `html.js` (removed if `script.js` fails to load) so content stays visible without JavaScript. Interactive controls provide interruptible `:active` press feedback over `--dur-press` (`scale(0.94)` on the theme toggle and Connect icon links; `translateY(1px)` on nav, top-bar name, tabs, links, and linked Minor rows). All hover states are gated on `@media (hover: hover)`.

The active section in the numbered navigation follows section entry and sets `aria-current="location"` on the active link. Numbers keep `--color-secondary` whether active or not (shifting to `--color-accent` on hover); a single 4px `--color-accent` dot centered 6px below the active number (`transform: translateX`, `--dur-reveal`, `--ease`) indicates the active section, snapping on load, resize, and font load, gliding on scroll, and locking to the clicked target until smooth scroll completes (`scrollend` with timeout fallback). Without JavaScript, the dot is omitted. Tabs, rows, the contribution cells, and the redacted reveal use `--ease`. Theme changes retain the directional circular reveal and sun/moon icon morph over `--dur-theme` with `--ease`; the toggle's hover scale (`--dur-hover`) and icon rotation (`--dur-theme`) use separate transform properties so they do not interfere. Under `prefers-reduced-motion`, transitions, press/hover transforms, scroll-linked transforms, and entrance motion are disabled, anchor scrolling is instant, and the top-bar name appears with opacity at p 0.5. No blur is used. Motion, when enabled, uses transform, opacity, and clip-path only; layout properties are not animated. Color may transition for hover/active only.

---

# Design choices

- **Type:** Newsreader + JetBrains Mono. Serif for voice, mono for metadata.
- **Light background:** paper and ink, high contrast.
- **Accent:** verdigris, used sparingly.
- **Toggle:** icon-only sun/moon morph, placed at the fixed top-right.
- **Avatar:** small, circular, full color. It reads as a person, not a decoration.
- **Favicon:** the avatar, square.
- **Theme direction:** light radiates from the toggle and dark collapses back into it. The asymmetry is intentional.
- **Work/Proof:** no cards; major project details live in a restrained tab panel, minor projects and proof live in rows.
- **Contribution graph:** monochrome, with opacity defining intensity and the source snapshot dated in the data file.

---

# Do not add

Skill bars, tech-stack lists, testimonials, emojis, stock icons, extra sections or pages, or copy not provided in DESIGN.md. Exception: only the three functional inline SVG link icons (GitHub, LinkedIn, Email) in Connect are allowed. Do not implement the maximalist form; it is parked in `docs/MAXIMAL.md`.

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
