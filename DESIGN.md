---
version: alpha
name: Concierge
description: A warm, light-first portfolio built around a conversational front door. A serif greeting, a one-line offer with an email CTA, one prominent "Ask" prompt and hairline structure. Calm, confident and legible, with automatic dark mode.
colors:
  background: "#F6F3EC"
  foreground: "#15130F"
  card: "#FFFDF8"
  muted: "#ECE7DC"
  muted-foreground: "#66615A"
  accent: "#E5481B"
  accent-foreground: "#FFFFFF"
  accent-text: "#B8340C"
  tint-sand: "#EDE4CF"
  tint-sage: "#DFE8D6"
  tint-sky: "#DCE7EE"
  tint-blush: "#F1DCD3"
  dark-background: "#12100D"
  dark-foreground: "#F3EFE6"
  dark-card: "#1B1814"
  dark-muted-foreground: "#A8A296"
  dark-accent: "#FF6A3D"
  dark-accent-text: "#FF8A63"
typography:
  display:
    fontFamily: Instrument Serif
    fontSize: 6rem
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Instrument Serif
    fontSize: 3rem
    fontWeight: 400
    lineHeight: 1.05
  answer:
    fontFamily: Instrument Serif
    fontSize: 1.75rem
    fontWeight: 400
    lineHeight: 1.3
  body:
    fontFamily: Geist
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.6
  eyebrow:
    fontFamily: Geist Mono
    fontSize: 0.75rem
    fontWeight: 400
    letterSpacing: "0.18em"
rounded:
  pill: 9999px
  tile: 1.5rem
  dialog: 1.75rem
spacing:
  gutter: 1.25rem
  section: 5rem
  max-width: 72rem
components:
  ask-prompt:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.pill}"
  ask-submit:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.pill}"
  answer-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.tile}"
  proof-strip:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.tile}"
  award-badge:
    backgroundColor: "{colors.tint-blush}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.pill}"
---

# Concierge

## Overview

The site opens like a concierge desk, not a brochure. A big serif greeting, one sentence of orientation and a single prompt box invite the visitor to ask for what they came for. Everything below is the same information laid out for people who would rather scroll.

Influences: **america.gov** (one front door, a "Hello" greeting, a central prompt with suggested questions, rounded glyph tiles, answers that cite their sources, and an honest "check the sources" disclaimer) and **ductran96.com** (a single page with anchored sections: About, Research, Publications, Awards, Contact).

## Ask (the core pattern)

- The hero prompt is the primary action. It is a pill input with a round accent submit button, three or four suggested questions beneath it, and a one-line honesty note.
- Answers are matched in the browser from the site's own content (`lib/content.ts` facts, projects and articles). There is no model and no network call. Say so in the UI.
- Every answer shows **Sources** chips linking to the section it came from. A miss says so plainly and offers email, never a guess.
- The same prompt is available everywhere: header button, floating dock (after the hero scrolls away), `⌘K` / `Ctrl+K` and `/`. It opens in a native `<dialog>` (focus trap and Esc for free).
- Answer text streams word by word unless `prefers-reduced-motion`.

## Colors

Warm paper background, ink text, one vermilion accent. Use `accent` for the submit button, status dot, bullets and focus-free emphasis; use `accent-text` for small accent-coloured text (AA on paper). Dark mode follows `prefers-color-scheme` and swaps every token. The `tint-*` colours are for badges only, never for text or buttons.

## Typography

Three families, each with a job: **Instrument Serif** for greeting, headings and answers; **Geist** for body and UI; **Geist Mono** for eyebrow labels and metadata only. Headings are regular weight, tight, `text-balance`. Eyebrows are uppercase mono at `0.18em`.

## Layout

One centred column, `max-w-6xl`, 20px gutters on mobile and 32px from `sm`. Sections use 64px (mobile) / 80px vertical padding and open with an eyebrow plus serif heading, separated by a hairline. Order: Hero (offer, Email CTA, Ask, proof strip) → About → Selected work → Experience → Writing → Contact. Five anchors, matching the nav. Each headline figure (years, businesses, award) appears once on the page, in the proof strip. Only the hero greeting is oversized; section headings stay at 3rem. Smallest text is 12px (eyebrows, metadata); muted body text is 14px or more.

## Elevation

Flat. Structure comes from hairline borders, tint fills and the blurred sticky header and dock. No drop shadows.

## Shapes

Pills for inputs, buttons and chips. `1.5rem` tiles for cards, images and tint blocks. `1.75rem` for the Ask dialog.

## Components

- **Proof strip**: one hairline-bordered row of three figures under the hero, serif value and one muted line.
- **Award badge**: blush pill with an award glyph, on the project it belongs to.
- **Chip**: pill with hairline border, muted text; hover inverts or darkens the border.
- **Role row**: mono period left; serif role and accent company on one line, one-sentence outcome. Only the current role gets bullets (two at most). Tools are one quiet line under the list, not chips.
- **Project card**: hairline card with cover image, year, serif title, optional award badge, then Problem / What I built / Result in one line each.

## Motion

Hero backdrop: the noise-displaced wireframe sphere (`components/sentient-sphere.tsx`, three.js) sits behind the greeting at low opacity: ink lines with `accent` on the crests, alpha about 0.1 on paper and 0.13 in dark, lighter and coarser below 640px. It tilts toward the pointer, fades and shrinks to 80% over the first 60% of a screen of scroll, pauses off screen, and shows a single still frame under `prefers-reduced-motion`. It is decorative only (`aria-hidden`, pointer-events none); copy must stay readable over it. Entrance: a 14px rise, staggered by 80ms. Below the fold: CSS scroll-driven reveal where supported, plain visible content otherwise. Hover transitions 300ms. All motion is disabled under `prefers-reduced-motion`.

Swarm build: each part of the page is built once, in front of the reader, by a small crew of cursors (`components/swarm.tsx`, engine `public/crew.js`). The crew wears the one accent (`accent` for the cursors, `accent-text` for the boxes and labels) in light and dark, is flat (no shadow, pill size labels), comes out of and returns to the "N" badge in the header, and gives every section a move of its own: a guide and dragged boxes (hero), a layout grid (About), dragged cards (Work), a relay of links down the timeline (Experience), a pen-ruled list with a copied row (Writing), a button that floods from a click (Contact). It never builds headings, photos, figures, the hero sphere, or the hero's lead and Ask (they stay on screen from the first paint; the crew only boxes them). The hero is built once per visit; reduced motion, a `#hash` or a blocked script shows the page as written.

## Do's and Don'ts

- Do keep the Ask first. Do add new facts to `lib/content.ts` so the Ask can answer them.
- Do reuse tokens from `app/globals.css`; do keep `DESIGN.md` in sync.
- Don't add shadows, gradients or a second accent colour.
- Don't claim AI. The Ask is retrieval over this site, and the UI says so.
- Don't use tint colours for text.
