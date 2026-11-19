# MOTION.md: smoothness spec

Companion to DESIGN.md. DESIGN.md wins on conflict. Rules here are distilled from the principles behind emilkowalski/skills (incl. apple-design), kylezantos/design-motion-principles and owl-listener animation-principles. They were taken from search-snippet-level info, not from reading the repos, so verify against the SKILL.md files before treating them as quotes.

---

## 1. Tokens (add to `:root`, use everywhere)

```css
--ease: cubic-bezier(0.22, 1, 0.36, 1);
--dur-press: 120ms;   /* press / active feedback */
--dur-hover: 200ms;   /* hover, color, small shifts */
--dur-reveal: 300ms;  /* entrance */
--dur-theme: 600ms;   /* theme switch only */
--stagger: 40ms;      /* per item, max 4 items */
```

Rule: no raw `ease`, no raw ms values in components. Tiers only.

## 2. Known fixes in the current code

- [x] `a`, `.nav-link`, `.theme-toggle`, `.contact-link` use `0.2s ease`. `.row` uses `transform 0.2s ease`. DESIGN.md says one easing. Replace with `var(--dur-hover) var(--ease)`.
- [x] `.reveal` starts at `opacity: 0` with no JS guard. If JS fails, content is invisible. Add `<html class="js">` in the head init script and scope: `.js .reveal { opacity: 0; transform: translateY(8px); }`.
- [x] Hover rules fire on touch and stick. Wrap in `@media (hover: hover) { ... }`.
- [x] `.theme-toggle:hover svg` scale and the light/dark `svg` transform rules overlap heavily. Collapse to one rule set driven by a CSS variable (`--toggle-rot`) to stop transition fights.
- [x] Avatar pops in when the image loads. Fade `opacity` 0 to 1 on `load`.

## 3. Smooth things to implement (in priority order)

1. **Press feedback.** `.theme-toggle:active { transform: scale(0.94); }` at `--dur-press`. Same for nav links (`translateY(1px)`). Instant response is most of what "fluid" feels like.
2. **Staggered reveal, capped.** Set `style="--i:n"` per element in a section, `transition-delay: calc(var(--i) * var(--stagger))`, max 4. Beyond that, no delay.
3. **Sliding nav marker.** One 4px accent dot (`transform: translateX`, `--dur-reveal`, `--ease`) centered 6px below the active nav number instead of a color flip. Numbers stay `--color-secondary` (hover still shifts to accent); the dot snaps on load, resize, and font load, glides on scroll, and locks to a clicked link until `scrollend` (with timeout fallback). Uses transform only.
4. **Interruptible by default.** Use transitions, not keyframes, for hover and press, so reversing mid-motion eases back instead of snapping.
5. **Font loading without shift.** Preload Newsreader 400/500, and add a fallback `@font-face` with `size-adjust` / `ascent-override` so swap does not move the layout.
6. **Scroll feel.** Native only: `scroll-behavior: smooth`, `scroll-padding-top`, `overscroll-behavior: none` on body. No scroll-hijack libraries.
7. **Magnetic toggle.** The toggle drifts max 4px toward the pointer when within about 60px, with a lerp in rAF, running only while the pointer is near. Off on touch and reduced motion. Needs a DESIGN.md Motion note.
8. **Reveal on route change** (later, when more pages exist): View Transitions for navigation, same 300ms and `--ease`.

## 4. Frequency gate

Animate in proportion to how rarely it happens. Theme switch: rare, so 600ms and dramatic. Hover and nav change: constant, so subtle and under 200ms. Never animate anything the user triggers repeatedly beyond 200ms.

## 5. Performance rules

- Animate only `transform`, `opacity`, `clip-path`. Color may transition for hover/active only.
- `will-change` only during an active animation, removed after. Never permanent.
- No `transition: all`.
- Layout-shifting properties (`width`, `height`, `top`, `margin`) are never animated.

## 6. Reduced motion

`prefers-reduced-motion: reduce`: no movement, no stagger, no magnetic drift. Opacity-only or instant.

## 7. Ban list (review checklist)

- Hover scale on everything
- Bounce / overshoot easing
- Stagger over 4 items or over 50ms per step
- Looping or pulsing indicators
- Parallax, cursor trails, scroll hijacking
- Durations over 300ms outside the theme switch
- Different easing curves in different components

Exemptions (per DESIGN.md): the hero load entrance (150ms stagger) and the GitHub contribution heatmap's diagonal opacity wave (8ms step across the grid).

## 8. Review pass (run before every commit that touches motion)

1. Grep for `ease`, `ease-in`, `ease-out`, `transition: all`, raw `ms`/`s` values outside tokens.
2. Toggle OS reduced motion and click everything.
3. Throttle CPU 4x in DevTools and switch the theme.
4. Tab through with keyboard and check focus rings still animate cleanly.
5. Test on a touch device for sticky hover.