# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Design system — read this first for any UI work

The visual identity is "Concierge" (warm paper, serif greeting, one accent, an on-site Ask). **Before changing anything visual, read `DESIGN.md` and `AGENTS.md` at the repo root.** `DESIGN.md` is the source of truth (Google Labs `design.md` format). If the code drifts from it, fix the code. Validate spec changes with `npx @google/design.md lint DESIGN.md`.

## Commands

- `pnpm dev` — Next.js dev server.
- `pnpm build` — static export build (`output: "export"`; emits `out/`).
- `pnpm lint` — ESLint.

No test suite. `next.config.mjs` sets `typescript.ignoreBuildErrors: true` and `images.unoptimized: true` because the site is a static export.

## Architecture

Next.js 16 (App Router) static portfolio.

- **`app/page.tsx`** composes the home page: Hero (wireframe sphere backdrop, offer, Email CTA, Ask, proof strip) → About → Works → Experience → Writing → Footer (Contact), under `SiteHeader`.
- **`app/layout.tsx`** loads Instrument Serif, Geist and Geist Mono, and wraps everything in `AskProvider` (which receives the knowledge base built at build time by `lib/knowledge.ts`).
- **`app/globals.css`** holds the design tokens (CSS variables, light + dark) mapped to Tailwind via `@theme inline`. Keep in sync with `DESIGN.md`.
- **`components/swarm.tsx`** + **`public/crew.js`** + the "Swarm build" block at the end of `app/globals.css` — a crew of cursors that builds each section as it is read (after Joel Califa's Swarm; `crew.js` is written anew by the `swarm-build` skill). Keep `public/crew.js` byte for byte equal to `~/.claude/skills/swarm-build/assets/crew.js` (`cmp` them). Markup contract: `data-swarm` on a section (the host), `data-swt` on plain-text elements to type, `data-swt="cta"` on buttons, `data-swarm-list` on a list whose children are the units, `data-sw-hold` on what the hero holds back, `data-swarm-box` on what the crew only boxes (the hero's lead and Ask). The hero types nothing: typed text is new paint, so the largest paint of the first screen (LCP) became the line typed last, 2-3.5 s in. Only type static plain text; never text React rewrites later. Never put the crew on a class with its own `animation` on `opacity` (`.rise`, `.reveal`): type or hide a child instead. The hero is held back before the first paint by the head script in `app/layout.tsx` (`html.has-crew`, once per visit).
- **`lib/content.ts`** is the single source of page copy, including `facts` (hand-written answers for the Ask). Edit it rather than hard-coding strings in components.
- **`lib/ask.ts`** is the on-device BM25-style retrieval; **`lib/knowledge.ts`** merges `facts`, `works.projects` and blog articles into the corpus.
- **`components/ask-box.tsx`**, **`ask-provider.tsx`**, **`ask-context.ts`** implement the prompt, the global dialog/dock/shortcuts and the context hook.
- **`app/blog/**`** renders MDX articles from `content/articles` (`lib/articles.ts`).

Path alias `@/*` resolves to the repo root.

## Editing patterns

- **Copy** → `lib/content.ts`. New facts the Ask should know → add to `facts`. New blog posts are picked up automatically.
- **New section** → component in `components/` using `<Section>`, export in `lib/content.ts`, slot into `app/page.tsx`.
- **Tokens** → `app/globals.css` and `DESIGN.md` together.
- **Static export** → no server runtime features (route handlers with dynamic data, middleware, image optimisation).

## CI

A single `.github/workflows/deploy.yml` pipeline builds and deploys the static site.
