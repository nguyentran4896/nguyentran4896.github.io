# Agent Rules — Portfolio

This is a Next.js + Tailwind v4 personal portfolio. The design is opinionated; consistency matters more than novelty.

## Read this first

**`DESIGN.md` at the repo root is the source of truth for all visual decisions.** It follows the [Google Labs `design.md`](https://github.com/google-labs-code/design.md) format — YAML token front matter plus prose rationale. Before touching any UI, read it.

When making UI changes:

1. **Read `DESIGN.md` first.** Identify which tokens, components, and rules apply to the change you're about to make.
2. **Reuse tokens, don't invent values.** Colors, type scales, spacing, and radii live in `app/globals.css` (`@theme inline` + CSS variables) and are documented in `DESIGN.md`. Do not hard-code hex values, font sizes, or spacings that aren't in the system.
3. **Honor the section rhythm.** Every section opens with a mono `label-caps` eyebrow, then a Playfair italic heading. New sections must follow this pattern.
4. **Two fonts only.** Playfair Display (`font-sans` in this project, intentionally) and Geist Mono (`font-mono`). Do not add Inter, Roboto, system-ui, or any other family.
5. **One accent.** Electric blue (`--accent`, `#3B5CFF`) appears at most once or twice per viewport. If you're tempted to use it for emphasis, use italics, size, or whitespace instead.
6. **Flat, not elevated.** No drop shadows, no glassmorphism panels, no neon glows. Depth comes from the noise overlay, hairline borders, and `backdrop-blur-sm` on the navbar/buttons only.

## When you're about to:

- **Add a new section** → mono eyebrow + Playfair italic heading + `section` (160px) vertical padding + hairline divider above. Mirror the asymmetric two-column pattern used in `components/hero.tsx` and `components/about.tsx` where it makes sense.
- **Add a button** → outlined pill with `backdrop-blur-sm`, mono uppercase wide-tracked label, hover fills to white. See the existing CTA in `components/hero.tsx`.
- **Add a card or surface** → square or `rounded-lg` max, hairline border, no shadow.
- **Add motion** → staggered fade/translate on load, 300–500ms color/opacity on hover. Respect `prefers-reduced-motion`.
- **Add a color** → don't. Open `DESIGN.md`, justify why the existing palette can't carry the meaning, and propose the addition before implementing.

## When `DESIGN.md` and the code disagree

The code is authoritative for what currently *ships*; `DESIGN.md` is authoritative for what *should* ship. If you find drift, fix the code to match `DESIGN.md` — don't update `DESIGN.md` to ratify the drift unless the drift was an intentional design decision the user explicitly approved.

## Validating

The Google Labs CLI can lint and diff `DESIGN.md`:

```bash
npx @google/design.md lint DESIGN.md
npx @google/design.md diff DESIGN.md DESIGN.md   # baseline vs. proposed change
```

Run `lint` after meaningful edits to `DESIGN.md` to catch broken token references and contrast regressions.
