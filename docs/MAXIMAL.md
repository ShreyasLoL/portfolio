# Maximalist Form Specification

> **Status:** Parked specification. Do not implement until Phase minimal has completed and explicit go-ahead is granted.

---

## 1. Thesis

One single underlying DOM supports two distinct presentation forms toggled via `data-form="minimal|maximal"` on the root `<html>` element, completely orthogonal to and independent of `data-theme`.

- **Minimal Form (`data-form="minimal"`):** The compiled surface. The current design as codified in `DESIGN.md`, clean, uncluttered, and untouched.
- **Maximal Form (`data-form="maximal"`):** The decompiled substrate—"what they're not saying". A full-viewport reverse-engineering workbench featuring basic blocks, hex dumps, memory offsets, and telemetry HUD overlays, executed at the absolute peak of modern web visual capability (WebGL2 heightfield shaders, true 3D spatial depth, kinetic typography, spring-damped magnetic cursor, and scroll-linked choreography).

**Audience & Ambition:** When a senior frontend engineer or systems programmer views the site, the intended reaction is: *"wtf, how."*

---

## 2. Guardrails

Despite the expansive visual ambition of the maximalist form, strict architectural and aesthetic guardrails prevent arbitrary design drift:

1. **Color Tokens:** Strictly limited to the 5 existing palette tokens (`--color-bg`, `--color-divider`, `--color-secondary`, `--color-text`, `--color-accent`). Additional intermediary tones, overlays, and glows are derived dynamically using CSS `color-mix()` against these 5 tokens.
2. **Typography:** Strict adherence to the self-hosted font pairing: **Newsreader** for voice / reading copy and **JetBrains Mono** for code, disassembly, offsets, and telemetry. No additional web fonts.
3. **Performance Target:** Smooth 60fps to 120fps execution with zero frame drops or input lag. Memory allocations inside render loops are minimized; garbage collection pressure must remain near zero.
4. **Accessibility & Motion Preferences:** Unconditional support for `prefers-reduced-motion`. In reduced-motion mode, all kinetic camera orbits, shader shifts, and scroll-linked spatial transforms are bypassed or replaced with static, instant states.
5. **Pointer Capabilities:** Dedicated alternatives for touch / coarse pointers (`@media (pointer: coarse)`), ensuring that features like the magnetic probe cursor degrade gracefully into intuitive direct-manipulation touch interactions.
6. **Background Inactivity:** All requestAnimationFrame (rAF) render loops, timers, and heavy shader computations pause immediately when the browser tab is hidden or inactive (`document.visibilityState === 'hidden'`).
7. **Editorial Tone:** Concrete, dry, and authentic. No invented metrics, no simulated vulnerabilities, no mock CTF scores, and no decorative placeholder cards.

---

## 3. Architecture

### Unified WebGL2 Context
- Exactly **ONE** shared full-viewport WebGL2 `<canvas>` element (`position: fixed; inset: 0; pointer-events: none; z-index: ...`) drives the substrate graphics.
- Controlled by a single centralized render loop. Never create multiple canvas contexts across individual components.

### Code Splitting & Preloading
- `maximal.js` and associated shader programs are **never** loaded during the initial minimal page paint to protect minimal performance metrics.
- Preloading is triggered lazily upon user interaction: hovering or focusing the form toggle button, or scheduled during idle browser cycles via `requestIdleCallback`. This guarantees seamless, zero-stutter activation on first click.

### Teardown & Lifecycle Cleanup
- Switching back from maximal to minimal executes a clean teardown.
- All requestAnimationFrame loops, resize observers, intersection observers, and interaction listeners are cleanly unbound and terminated using an `AbortController`.

### In-Place Form State & Routing
- Form switching occurs entirely in-place without hard page reloads or layout thrashing.
- State is synchronized to the URL via `history.pushState` with query param `?form=maximal`.
- Cold navigation directly to `?form=maximal` is fully supported, but the default state on any bare URL is always `minimal`.

### Transition Mutex & Coordination
- Theme transitions (circular radial reveal) and form transitions share a single synchronization mutex (`isSwitching`).
- The theme toggle retains its signature circular reveal.
- The form toggle uses a distinct structural transition: a scanline split / CRT decompile sweep.

### View Transitions Integrity
- Native View Transitions (`document.startViewTransition`) distort typography when warping layouts.
- During form switching, `view-transition-name` is strictly scoped to `.avatar` and the structural section frames.
- All typography and text nodes are cross-faded at a constant 1:1 scale to eliminate glyph distortion.

---

## 4. The 5 Flex Ideas

### 1. Hero: 3D Topographical GitHub Contribution Terrain
- **Description:** A 3D topographical heightfield mesh rendered via the shared WebGL2 canvas representing GitHub activity, styled like a reverse-engineering memory or entropy map.
- **Shader Technique:** WebGL2 heightfield with `fwidth()` screen-space derivative iso-contour elevation lines, damped mouse orbit inertia, scroll-linked pitch adjustments, and a raycasted cross-sectional slice on hover.
- **Density Correction:** A single 52×7 commit grid is too narrow and planar for expressive 3D perspective; the terrain incorporates multiple years of historical commits blended with a deterministic seeded coherent noise octave.
- **Data Pipeline:** Commit telemetry is fetched at build time or via a scheduled background cron job and saved as a static JSON payload. Zero API tokens or client-side fetch secrets in the browser.
- **Minimal Form Parity:** In minimal mode, this activity data renders strictly as a silent, flat metadata row.

### 2. Avatar: 8×8 Ordered Bayer Dither Canvas & Inspection Lens
- **Description:** Shreyas's portrait presented as a crisp, retro-computational ordered Bayer dithered image that responds to interactive inspection.
- **Primary Implementation:** Real-time 8×8 ordered Bayer dithering matrix rendered on a dedicated canvas, accompanied by a spring-damped cursor lens that reveals the true-color source pixels and displays a dynamic hexadecimal/RGB pixel telemetry readout.
- **Correction Applied:** Luminance-extruded 3D bas-relief geometry on human faces often produces an uncanny, unsettling appearance. Mesh extrusion is demoted to an optional, very subtle depth tilt; the Bayer dither inspection lens serves as the primary visual focus.

### 3. Statement: Velocity-Driven Scanline Shear with UTF-8 Hex Gap
- **Description:** High-speed scrolling or mouse sweeps induce an instantaneous horizontal scanline displacement across the statement block.
- **Mechanics:** The displacement shear opens a momentary fissure between scanlines, exposing the raw underlying UTF-8 hexadecimal byte sequence of the text.
- **DOM & Accessibility:** The true DOM text elements remain selectable, accessible, and intact in their exact flow positions.
- **Rendering Choice:** Rendered as a transient 2D canvas overlay using standard Canvas 2D `fillText`. Multi-channel signed distance fields (MSDF) are avoided to eliminate complex external asset generation pipelines and build steps.

### 4. Z-Stack: CSS 3D Perspective Explode
- **Description:** The sequential sections (01, 02, 03, 04) decouple from the planar layout and explode outward along the Z-axis in response to viewport depth controls.
- **Implementation:** Realized using standard CSS 3D transforms (`perspective`, `transform-style: preserve-3d`, `translateZ`) with 1px SVG/CSS drop-pins visually tethering the floating planes back to baseline coordinates.
- **Accessibility:** Because this leverages standard DOM nodes rather than WebGL rasterization, keyboard navigation, tab ordering, and screen-reader accessibility remain fully functional.

### 5. Magnetic Probe Cursor & Canvas Loupe
- **Description:** A custom pointer utility functioning as an engineering probe crosshair.
- **Crosshair Behavior:** Physics-backed spring crosshair that snaps magnetically to 4 target corner brackets when hovering interactive links, buttons, and sections.
- **Magnifier Loupe:** A press-and-hold magnifying loupe tool that samples pixels strictly from the shared WebGL2 canvas (the 3D contribution terrain and dithered avatar), deliberately avoiding rasterization of standard DOM typography to ensure crisp visual separation.

---

## 5. Proposed HUD Microcopy

The maximalist telemetry HUD displays live status indicators around the viewport periphery. Microcopy is kept austere, technical, and dry:

| Key / Identifier | Proposed String | Context / Purpose |
|---|---|---|
| Toggle form action | `Toggle form` | Accessibility label / button title for switching forms |
| Active form indicator | `FORM // MAXIMAL` | Viewport header status HUD |
| Memory offset label | `ADDR // 0x00401000` | Section base address telemetry indicator |
| Coordinate readouts | `VEC // X:0000 Y:0000` | Real-time normalized pointer vector coords |
| Performance counter | `FPS // 60` | Hardware rendering performance monitor |
| Depth view control | `[Z-STACK]` | Toggle trigger for exploding CSS 3D perspective layers |
| Canvas viewport controls | `[drag: orbit] · [scroll: pitch] · [reset]` | Instruction footer for interacting with the 3D terrain |

*(Note: Pending user approval per Global Rule 5).*

---

## 6. Implementation Build Order

When development of the maximalist form commences, features must be constructed strictly in this sequence:

1. **Kernel & Preloader:** Core state manager, `data-form` toggle hook, and `requestIdleCallback` / hover preloading infrastructure.
2. **Transition Engine:** CRT scanline split animation integrated with the existing View Transitions API and mutex lock shared with the circular theme reveal.
3. **Workbench Grid & HUD:** Fixed-position peripheral telemetry HUD frames, coordinate monitors, and mono labels.
4. **Z-Stack Engine:** CSS 3D perspective transforms and layered drop-pins.
5. **Shared WebGL2 Canvas & Terrain:** Context setup, shader compilation, and the 3D contribution heightfield.
6. **Avatar Inspection Lens & Probe Cursor:** 8×8 Bayer matrix pipeline, spring-driven magnetic crosshairs, and loupe sampler.
7. **Statement Shear:** Velocity-driven scanline displacement overlay canvas (Canvas 2D fillText; highest visual risk, placed last among graphics).
8. **Maximal 404:** Specialized decompilation failure state for the 404 page.
9. **DESIGN.md Synchronization:** Align all finalized architectural details back into `DESIGN.md`.
10. **Optional Audio Synthesis:** Synthesized mechanical / CRT clicks (Web Audio API; off by default, non-intrusive, absolute last).

*Lighthouse Auditing Rule:* Performance measurements in the maximalist form are purely "run and report" metrics to guide optimization, never an arbitrary pass/fail development gate.
