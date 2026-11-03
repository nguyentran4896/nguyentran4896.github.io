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

- **`app/page.tsx`** composes the home page: Hero (Ask) → QuickAccess → About → Experience → Works → Writing → Recognition → Footer, under `SiteHeader`.
- **`app/layout.tsx`** loads Instrument Serif, Geist and Geist Mono, and wraps everything in `AskProvider` (which receives the knowledge base built at build time by `lib/knowledge.ts`).
- **`app/globals.css`** holds the design tokens (CSS variables, light + dark) mapped to Tailwind via `@theme inline`. Keep in sync with `DESIGN.md`.
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
