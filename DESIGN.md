---
version: alpha
name: Concierge
description: A warm, light-first portfolio built around a conversational front door. A serif greeting, one prominent "Ask" prompt, soft tinted tiles and hairline structure. Calm, confident and legible, with automatic dark mode.
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
    fontSize: 3.75rem
    fontWeight: 400
    lineHeight: 1.05
  answer:
    fontFamily: Instrument Serif
    fontSize: 1.75rem
    fontWeight: 400
    lineHeight: 1.3
  body:
    fontFamily: Geist
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  eyebrow:
    fontFamily: Geist Mono
    fontSize: 0.6875rem
    fontWeight: 400
    letterSpacing: "0.18em"
rounded:
  pill: 9999px
  tile: 1.5rem
  dialog: 1.75rem
spacing:
  gutter: 1.25rem
  section: 7rem
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
  tile:
    backgroundColor: "{colors.tint-sand}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.tile}"
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

Warm paper background, ink text, one vermilion accent. Use `accent` for the submit button, status dot, bullets and focus-free emphasis; use `accent-text` for small accent-coloured text (AA on paper). Dark mode follows `prefers-color-scheme` and swaps every token. The four `tint-*` colours are for glyph tiles and one highlight card only, never for text or buttons.

## Typography

Three families, each with a job: **Instrument Serif** for greeting, headings and answers; **Geist** for body and UI; **Geist Mono** for eyebrow labels and metadata only. Headings are regular weight, tight, `text-balance`. Eyebrows are uppercase mono at `0.18em`.

## Layout

One centred column, `max-w-6xl`, 20px gutters on mobile and 32px from `sm`. Sections use generous vertical padding and open with an eyebrow plus serif heading, separated by a hairline. Order: Hero (Ask) → Quick access tiles → About → Experience → Selected work → Writing → Recognition → Contact.

## Elevation

Flat. Structure comes from hairline borders, tint fills and the blurred sticky header and dock. No drop shadows.

## Shapes

Pills for inputs, buttons and chips. `1.5rem` tiles for cards, images and tint blocks. `1.75rem` for the Ask dialog.

## Components

- **Tile**: tinted rounded square, large outline glyph top left, arrow top right, serif label and one-line blurb bottom. Lifts 4px on hover.
- **Chip**: pill with hairline border, muted text; hover inverts or darkens the border.
- **Role row**: mono period left, serif role, accent company, bullets and stack chips right.
- **Project card**: hairline card with cover image, year, serif title, optional highlight pill.

## Motion

Entrance: a 14px rise, staggered by 80ms. Below the fold: CSS scroll-driven reveal where supported, plain visible content otherwise. Hover transitions 300ms. All motion is disabled under `prefers-reduced-motion`.

## Do's and Don'ts

- Do keep the Ask first. Do add new facts to `lib/content.ts` so the Ask can answer them.
- Do reuse tokens from `app/globals.css`; do keep `DESIGN.md` in sync.
- Don't add shadows, gradients or a second accent colour.
- Don't claim AI. The Ask is retrieval over this site, and the UI says so.
- Don't use tint colours for text.
