---
version: alpha
name: Midnight Editorial
description: A dark, editorial portfolio aesthetic — Playfair Display italics over near-black, with mono micro-labels and a single electric-blue accent. Restraint, contrast, and typographic gravitas over decoration.
colors:
  background: "#1A1A1A"
  foreground: "#FAFAFA"
  card: "#1A1A1A"
  card-foreground: "#FAFAFA"
  muted: "#353535"
  muted-foreground: "#A3A3A3"
  border: "#353535"
  ring: "#6F6F6F"
  primary: "#FAFAFA"
  primary-foreground: "#262626"
  secondary: "#353535"
  secondary-foreground: "#FAFAFA"
  accent: "#3B5CFF"
  accent-foreground: "#FAFAFA"
  destructive: "#7A2A2A"
  on-dark: "#FAFAFA"
  on-light: "#1A1A1A"
  hairline: "rgba(250,250,250,0.20)"
  hairline-soft: "rgba(250,250,250,0.10)"
typography:
  display-xl:
    fontFamily: Playfair Display
    fontSize: 6rem
    fontWeight: 300
    lineHeight: 1.0
    letterSpacing: "-0.02em"
  display-lg:
    fontFamily: Playfair Display
    fontSize: 4.5rem
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  display-italic:
    fontFamily: Playfair Display
    fontSize: 3rem
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "-0.01em"
    fontStyle: italic
  h1:
    fontFamily: Playfair Display
    fontSize: 3rem
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Playfair Display
    fontSize: 2.25rem
    fontWeight: 300
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  body-lg:
    fontFamily: Playfair Display
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Playfair Display
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.65
  label-caps:
    fontFamily: Geist Mono
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: "0.3em"
  label-micro:
    fontFamily: Geist Mono
    fontSize: 0.625rem
    fontWeight: 400
    letterSpacing: "0.2em"
  mono-ui:
    fontFamily: Geist Mono
    fontSize: 0.875rem
    fontWeight: 400
    letterSpacing: "0.1em"
rounded:
  none: 0px
  sm: 6px
  md: 8px
  lg: 10px
  pill: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  3xl: 96px
  section: 160px
components:
  button-primary:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.pill}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.on-light}"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.pill}"
    padding: "16px 32px"
  eyebrow-label:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label-caps}"
  section-heading:
    textColor: "{colors.foreground}"
    typography: "{typography.display-italic}"
  card-default:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "24px"
  hairline-rule:
    backgroundColor: "{colors.hairline}"
    height: "1px"
---

## Overview

**Midnight Editorial** is a dark, magazine-grade aesthetic for a senior engineer's portfolio. The voice is restrained and considered — closer to a printed monograph than a marketing site. Three forces are in tension and must stay in tension:

1. **Playfair Display italics** carry emotional weight and personality.
2. **Geist Mono in wide tracking** acts as the technical voice — captions, labels, coordinates.
3. **Near-black canvas with a single electric-blue accent** keeps the page quiet so the typography can speak.

The page is not decorated — it is *composed*. White space is a feature. A noise overlay (3% opacity) and a custom cursor give the surface a tactile quality. Motion is slow, deliberate, and used sparingly.

If a change makes the page louder, busier, or more "modern SaaS," it is wrong. If it makes the page feel more like a well-set book, it is right.

## Colors

The palette is intentionally narrow: an inked background, a paper-white foreground, two greys, and one accent. Do not introduce new hues. Do not use gradients except as low-opacity atmospheric effects.

- **Background `#1A1A1A`** — Near-black, never pure `#000`. The page's ink.
- **Foreground `#FAFAFA`** — Warm paper white. All primary text.
- **Muted `#353535`** — Borders, dividers, secondary surfaces. Never used for text on background.
- **Muted-foreground `#A3A3A3`** — Captions, metadata, mono labels, body copy when de-emphasized.
- **Accent `#3B5CFF`** — Electric blue. Reserved for: text selection, focus rings, and at most one deliberate moment per section (a hovered link, a single highlighted word). If the accent appears more than twice in one viewport, remove one.
- **Hairline `rgba(250,250,250,0.20)`** — Outlined buttons, section dividers, decorative rules. Prefer hairlines over filled surfaces.

**Contrast rules.** Body copy uses `foreground` on `background`. `muted-foreground` is acceptable for labels and captions but never for paragraph text. Do not place `muted-foreground` text on `muted` surfaces.

## Typography

Two families, used with discipline:

- **Playfair Display** — Display, headings, and body. Light weight (300) for headlines, regular (400) for body. **Italic is the signature** — every section heading should use `display-italic`. Headlines are tight (`tracking-tight`, `-0.02em`). Body copy is loose (`leading-relaxed`, ~1.65).
- **Geist Mono** — Eyebrows, captions, navigation, button labels, numeric stats, scroll cues. **Always uppercase. Always wide-tracked** (`0.2em`–`0.3em`). Always small (10–14px). Mono is the technical counter-voice to Playfair's emotion; if mono ever appears at body size, it is wrong.

**Rhythm.** Every section opens the same way: a mono `label-caps` eyebrow, then a Playfair `display-italic` heading, then breathing room, then content. Do not break this rhythm without reason.

**Numerals.** Stats and large figures use Playfair light at `display-lg` or larger. Pair them with a `label-micro` mono caption underneath.

## Layout

The grid is a 12-column container with generous gutters, but the *interesting* layouts break it:

- **Asymmetric pairs.** Hero and section headers split into two halves where one half is right-aligned (`self-end text-right`). Mirror this pattern when introducing new sections.
- **Vertical rhythm.** Section padding is `section` (160px) on desktop, scaling down to `2xl` (64px) on mobile. Do not use uniform padding — let sections breathe differently.
- **Hairline dividers.** Sections are separated by full-width 1px `hairline` rules, not by background color shifts. The whole page is one continuous dark sheet.
- **Max content width.** Prose blocks cap at ~65ch. Display headlines extend wider, sometimes to the viewport edge. Headlines may bleed; body never does.
- **Overlap and offset.** Encouraged for decorative elements (large numerals behind text, mono coordinates floating in margins). Forbidden for interactive elements.

## Elevation & Depth

This is a flat design. There are no drop shadows, no elevated cards, no glassmorphism panels. Depth comes from three sources only:

1. **The noise overlay** (`.noise-overlay`, 3% opacity, fixed, `z-index: 9999`, `pointer-events: none`). It is global. Do not remove it. Do not increase it past 5%.
2. **Hairline borders** at 10–20% white opacity.
3. **Backdrop blur** on the navbar and outlined buttons (`backdrop-blur-sm`) — used sparingly, never on content surfaces.

If a component needs a shadow to read, the layout is wrong. Fix the layout.

## Shapes

- **Buttons:** pill (`rounded-full`). Always.
- **Cards / surfaces:** `rounded-lg` (10px) maximum. Many surfaces are square (`rounded-none`) — embrace this.
- **Images:** square or `rounded-md`. Never circular except for avatars.
- **Dividers:** 1px hairlines, never thicker.

Sharp corners are a feature here, not an oversight.

## Components

### Eyebrow label
Mono, uppercase, `0.3em` tracking, `muted-foreground`, sits above every section heading. Width is intrinsic; never centered unless the heading below is also centered.

### Section heading
Playfair Display, light, italic, `3rem`–`5rem` depending on hierarchy. Always paired with an eyebrow above. Never bold, never roman for top-level section titles — italic is the signature.

### Outlined button (primary CTA)
Transparent fill, 1px white/20% border, pill, mono uppercase label with wide tracking, `backdrop-blur-sm`. On hover: fills to white, text goes to `on-light`, transition `500ms` ease. No scale, no shadow, no glow.

### Mono coordinates / metadata
Tiny mono labels (`label-micro`, 10px, `0.2em` tracking) used for scroll cues, image captions, section numbers (`01 / 06`), and timestamps. They are the page's marginalia — present but quiet.

### Marquee
Horizontal infinite scroll for the tech stack, 50s duration, linear, infinite. Two directions (`marquee-left`, `marquee-right`) used together create a counter-rotating band. Do not speed this up — slowness is the point.

### Navigation
Fixed top, transparent until scroll, `backdrop-blur-sm` when active. Links are mono, uppercase, wide-tracked. No underlines; hover state is opacity.

### Custom cursor
A bespoke cursor element follows the pointer with a slight delay. Required on desktop, disabled on touch. Do not replace with default cursor pointers on hover; instead, scale or invert the custom cursor.

## Motion

- **Page load:** staggered reveals using `animation-delay` increments of 80–120ms. Translate-up + fade. Duration 600–900ms. `ease-out`.
- **Hover:** color and opacity transitions only, 300–500ms. Never scale text. Never bounce.
- **Scroll:** parallax permitted on the hero sphere and large numerals only. Body content does not parallax.
- **Marquee:** 50s linear infinite. Never pause on hover (it breaks the meditative rhythm).
- **Reduced motion:** `prefers-reduced-motion` must disable parallax, marquee, and the custom cursor, and reduce all transitions to ≤100ms.

## Do's and Don'ts

**Do**
- Open every section with a mono eyebrow + italic Playfair heading.
- Trust whitespace. When in doubt, add more.
- Use the accent blue once per section, deliberately.
- Keep mono small and wide-tracked; keep Playfair large and tight-tracked.
- Use hairline rules instead of background fills to separate regions.

**Don't**
- Don't introduce new fonts. Playfair Display + Geist Mono is the entire system.
- Don't introduce new colors. If you need emphasis, use italic, size, or whitespace — not hue.
- Don't use gradients on text or buttons. Atmospheric background gradients at <10% opacity are acceptable.
- Don't use drop shadows, glassmorphism, or neon glows.
- Don't center long-form content. Left-align with deliberate asymmetric counterweights.
- Don't use emoji as UI. Use mono labels or numerals instead.
- Don't animate on every interaction — motion should feel rare and earned.
- Don't use `Inter`, `Roboto`, `system-ui`, or any sans-serif fallback as a primary face. Playfair is the body face here, by design.
