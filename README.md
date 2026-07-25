# BABLY — the dream studio

React + Vite + TypeScript + Tailwind CSS. A full-page, Lenis-smooth-
scroll, night-themed experience with 5 sections (Home, Studio, About,
Journal, Reach Us), each with a continuously looping video background,
parallax depth on scroll, a TV-screen glitch transition, and a glowing
firefly cursor trail.

## Setup

```bash
npm install
npm run dev
```

## What changed in this pass — real smooth scrolling (Lenis)

**Replaced the hand-rolled paged-scroll hook with Lenis** (industry
standard for smooth momentum scrolling in 2026, ~3KB gzipped, by
darkroom.engineering). The old `usePagedScroll` hook intercepted wheel
events and animated `scrollTop` with a fixed 850ms eased transition
regardless of how the user scrolled — that's why it read as a slideshow
of disconnected pages rather than one continuous site. Lenis instead
drives the browser's *real* scroll position via continuous physics
(lerp), so the feel responds proportionally to input.

**Why Lenis over alternatives:** it wraps native scroll instead of
replacing it (unlike Locomotive Scroll, which moves the DOM via CSS
transforms and breaks `position: sticky`/accessibility). That means our
existing parallax logic (which listens for native `scroll` events) and
IntersectionObserver-based active-section tracking both kept working
without modification.

**Section snapping** now uses `lenis/snap` — Lenis's own official plugin
— instead of CSS `scroll-snap` (which fights Lenis's smoothing) or manual
scroll-math. Each section has a `data-lenis-section` attribute; the hook
queries them and calls `snap.addElements(...)`.

**Anchor links** (navbar → section) now go through Lenis's built-in
`anchors: true` option — clicking `#studio` etc. just works, no custom
click-interception code needed anymore.

**Layout change:** switched from a custom `overflow-y-scroll` container
to natural document-flow scrolling (Lenis's "root" mode scrolls
`<html>`), since that's Lenis's most robust, best-supported mode.

New file: `src/hooks/useLenisScroll.ts` (replaces the deleted
`usePagedScroll.ts`).

## Everything else is unchanged from previous passes

- Continuous native video loop (no fade dips), only the active
  section's video plays
- Night/platinum theme, Platinum font for logo/headlines
- Parallax: video layer scaled 115%, drifts at 15% of scroll distance
- TV-screen glitch (RGB-fringe jitter, roll-bar sweep, static flicker) —
  masks the video loop seam and fires on section transitions
- Firefly cursor (sprite-based glow)

## Adding more of your own videos

Drop clips into `public/videos/` named to match `src/App.tsx`'s
`SECTIONS` array: `home.mp4`, `studio.mp4`, `about.mp4`, `journal.mp4`,
`reach-us.mp4`.

## Structure

- `src/App.tsx` — section data + layout, wires up `useLenisScroll`
- `src/hooks/useLenisScroll.ts` — Lenis + snap plugin + active-section
  IntersectionObserver
- `src/components/FireflyCursor.tsx` — glowing cursor-trail canvas
- `src/components/VideoSection.tsx` — fullscreen section: native-loop
  video, parallax shift, TV-screen glitch, dark vignette
- `src/components/SectionContent.tsx` — eyebrow / headline / description /
  optional CTA, platinum palette
- `src/components/Navbar.tsx` — fixed dark-glass nav, BABLY logo + tagline
- `src/styles/fonts.css` — Instrument Serif, Inter, Platinum imports
- `src/styles/theme.css` — fade-rise + TV-screen glitch keyframes

## Deploying

```bash
npm run deploy
```
Builds and publishes `dist/` to the `gh-pages` branch (requires the
`base` path in `vite.config.ts` to match your repo name, already set to
`/Bably_Dream/`).

## Bug fix — black bar during scroll transitions

The parallax effect scaled each section's video by only 1.15x while
shifting it by up to `viewportHeight * 0.15` during a scroll transition.
The math didn't hold up: covering a shift of `factor * vh` on each edge
needs a scale of at least `1 + 2*factor` (here, 1.30), but the video only
had half of that buffer. At the extremes of a scroll transition, the
video pulled away from the section edge and exposed the section's plain
black background underneath — the black bar visible between sections
mid-scroll. Fixed by bumping the scale to 1.4 (with margin above the
1.30 minimum).

## Scrolling effect — switched to sticky-stack (from Lenis + Snap)

Replaced the snap-to-section paged scroll with the classic
`position: sticky` stacking technique: each section is `sticky top-0
h-screen`, stacked in normal document flow. As you scroll, each section
pins to the top of the viewport until the next one's sticky top reaches
it and stacks on top, covering it — continuous motion, no jumps.

**Lenis is kept** for the smooth momentum feel on top of native scroll,
but `lenis/snap` was removed — snapping to exact section boundaries
would undercut the whole point of the continuous stacking effect.

**Active-section detection had to change.** With `IntersectionObserver`,
a pinned section still geometrically overlaps the viewport even after a
later section has visually covered it — so it can't tell which one is
actually on top. Replaced with direct `getBoundingClientRect()` checks
(rAF-throttled on scroll): the active section is the highest-index one
that has started sticking (`rect.top <= ~0`), since sections stack in
order and whichever most recently reached the top is the one currently
visible above the rest.

**The old custom parallax is gone entirely** — it was the actual source
of the earlier black-bar bug (translating the video further than its
oversized buffer could cover). The sticky-stack effect provides its own
sense of depth natively, so no per-section transform math is needed
anymore, and that whole class of bug goes away with it.
