# Agent Rules — Portfolio

Next.js + Tailwind v4 personal portfolio. **`DESIGN.md` is the source of truth for all visual decisions** (Google Labs `design.md` format). Read it before touching UI.

1. **Reuse tokens.** Colours, radii and fonts live in `app/globals.css` and `DESIGN.md`. Don't hard-code hex values or add families.
2. **Ask first.** The hero prompt is the primary action; keep it above the fold and keep every answer sourced. Add new facts to `lib/content.ts` (`facts`).
3. **Every section** opens with a mono eyebrow and a serif heading via `<Section>`.
4. **One accent**, flat surfaces (hairlines and tints, no shadows), pills for controls, `rounded-tile` for cards.
5. **Accessible by default**: AA contrast (`accent-text` for small accent text), visible focus, `prefers-reduced-motion`, semantic landmarks.
6. **Honest copy**: the Ask is retrieval over this site, not an AI model; never imply otherwise.

If `DESIGN.md` and the code disagree, fix the code. Validate with `npx @google/design.md lint DESIGN.md`.
