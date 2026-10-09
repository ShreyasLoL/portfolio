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

Accent is used only on: hover, the active nav item, `::selection`, and the favicon. Default to system preference via `prefers-color-scheme`, with a persisted toggle.

---

# Typography

Newsreader for all text (italic only for the statement and contact line); JetBrains Mono only for metadata and small labels. Sizes: name 30px, statement 20px, body 16px, metadata 13px. Body line-height 1.6. Weights 400 and 500 only.

---

# Spacing

8px base. Steps: 8 / 16 / 24 / 48 / 96. 96px between sections on desktop, 64px on mobile, 16px between rows.

---

# Layout

Desktop: fixed left column (~280px) with name, title, statement, nav; right column scrolls, max-width ~640px. Mobile: single column, identity on top, nav row. Rows not cards; no borders, shadows, gradients, or decorative icons; everything left-aligned to one edge. Avatar block at the sidebar bottom (72px desktop, 48px mobile, circular, full color). Theme toggle is fixed top-right of the viewport, 44px hit area, always visible.

---

# Motion

Content fades up 8px on entering the viewport, 300ms. Rows shift 2px on hover. Toggle morph 500ms. Page theme transition as a circular reveal from the toggle. One easing curve everywhere: `cubic-bezier(0.22, 1, 0.36, 1)`. Animate only `transform`, `opacity`, and `clip-path`. Respect `prefers-reduced-motion`.

---

# Do not add

Skill bars, tech-stack lists, testimonials, hero animations, emojis, stock icons, extra sections or pages, or any copy not provided in DESIGN.md.

---

# Decisions log

- **2026-10-04:** Newsreader + JetBrains Mono chosen over Geist and Plex pairings. Warm marble-toward-sand light background (#EFEBE3) chosen over cooler marble. Verdigris chosen as the single accent. Icon-only sun/moon toggle with morph. Avatar is a full-color rounded square. Proof rows removed pending a decision on presentation.
- **2026-10-05:** Updated avatar to be smaller (48px / 36px), circular (`border-radius: 50%`), and always in full color (removed grayscale). Moved theme toggle button to the sidebar bottom section next to the avatar for clear visibility, with smooth transition morphing.
- **2026-10-10:** Avatar enlarged to 72px/48px, full color always. Toggle moved to a fixed top-right position for visibility. Sun/moon morph reworked: core scale, ray retract and rotate, mask slide, icon rotation, all 500ms on the shared easing.

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

Read DESIGN.md before making any change. Do not introduce colors, fonts, sizes, or spacing outside these tokens. If a requested change alters a design decision, update DESIGN.md in the same change and add a dated line to the decisions log.
