# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Design system — read this first for any UI work

This repo has an opinionated visual identity. **Before changing anything visual, read `DESIGN.md` and `AGENTS.md` at the repo root.**

- `DESIGN.md` is a [Google Labs `design.md`](https://github.com/google-labs-code/design.md)–format spec: YAML token front matter (colors, typography, rounded, spacing, components) plus prose rationale (Overview, Colors, Typography, Layout, Elevation, Shapes, Components, Motion, Do's/Don'ts). It is the **source of truth** for the "Midnight Editorial" aesthetic — Playfair Display italics + Geist Mono micro-labels on near-black `#1A1A1A`, single `#3B5CFF` accent, hairline dividers, pill outlined buttons, flat (no shadows/glassmorphism), `noise-overlay` global texture.
- `AGENTS.md` summarizes the rules an agent must follow: reuse tokens (don't hard-code values), every section opens with mono eyebrow + italic Playfair heading, two fonts only, one accent per viewport, flat surfaces only.
- If the code drifts from `DESIGN.md`, fix the code — don't update `DESIGN.md` to ratify drift unless the user explicitly approves.
- Validate spec changes: `npx @google/design.md lint DESIGN.md`.

## Commands

- `pnpm dev` — Next.js dev server.
- `pnpm build` — static export build (`output: "export"` in `next.config.mjs`; emits `out/`).
- `pnpm start` — serve a non-export production build.
- `pnpm lint` — ESLint.

There is no test suite configured. `next.config.mjs` sets `typescript.ignoreBuildErrors: true` and `images.unoptimized: true` because the site builds as a fully static export.

## Architecture

Single-page Next.js 16 (App Router) personal portfolio that builds to a static site.

- **`app/page.tsx`** is the entire page: a vertical stack of section components inside `<SmoothScroll>` with a global `<CustomCursor>` and `<Navbar>`. Section order — Hero → SectionBlend → About → Experience → Stats → Works → Recognition → TechMarquee → Footer — defines the page's editorial rhythm and should not be reordered without a design reason.
- **`app/layout.tsx`** loads two fonts via `next/font/google` and exposes them as CSS variables: `Playfair Display` → `--font-playfair` (used as `font-sans` by design), `Geist Mono` → `--font-geist-mono` (`font-mono`). The global `.noise-overlay` div lives here and is intentionally always rendered.
- **`app/globals.css`** is the design-token layer. Tailwind v4 `@theme inline` block maps CSS variables (`--background`, `--foreground`, `--accent`, `--muted-foreground`, `--radius`, etc., all in `oklch`) to Tailwind utility names. The values here must stay in sync with `DESIGN.md`'s YAML tokens. Custom keyframes (`marquee-left`, `marquee-right`) and the `noise-overlay` rule also live here.
- **`lib/content.ts`** is the single source of all page copy — hero labels, about statements, experience roles, stats, works, recognition entries, footer text. Edit this file rather than hard-coding strings into components. Components import named exports (`hero`, `about`, `experience`, …) and render them.
- **`components/`** contains one file per page section plus cross-cutting pieces: `smooth-scroll.tsx` (Lenis-based smooth scroll wrapper), `custom-cursor.tsx` (bespoke pointer required on desktop, must respect `prefers-reduced-motion` and touch), `section-blend.tsx` (decorative transition between hero and About), and `mdx-components.tsx` (MDX renderers for blog posts).
- **`components/sentient-sphere.tsx`** uses `@react-three/fiber` + `three` for the hero's animated 3D element.

Path alias `@/*` resolves to the repo root (see `tsconfig.json`), so `@/components/...`, `@/lib/content`, `@/hooks/...` are the conventional imports.

## Editing patterns

- **Adding or changing copy** → edit `lib/content.ts`. Keep the mono eyebrow format (`"01 — ENGINEERING"`, uppercase, em-dash, numeric prefix).
- **Adding a new section** → new component in `components/`, new export object in `lib/content.ts`, slot it into the stack in `app/page.tsx`. Follow the section rhythm from `DESIGN.md` (mono eyebrow → Playfair italic heading → asymmetric content → hairline divider).
- **Color, type, spacing, radius changes** → update `app/globals.css` *and* the YAML front matter in `DESIGN.md` together. Re-run the lint command above.
- **Static export caveat** → because `output: "export"`, anything requiring a Node server at runtime (route handlers, dynamic `revalidate`, `next/image` optimization, middleware) will not work. Keep everything client- or build-time only.

## Chat widget + worker

The "Ask about Nguyen" chat widget (`components/chat-widget.tsx`, `hooks/use-chat.ts`) talks to a Cloudflare Worker in `worker/` (separate deploy, see `worker/README.md`). Worker runs Groq + a Durable Object that debounces 2 min of inactivity and sends the transcript to Telegram.

- **Bio sync invariant**: `worker/src/bio.ts` is a hand-maintained snapshot of the chat-relevant facts in `lib/content.ts`. When meaningful bio facts change in `lib/content.ts` (experience, recognition, projects, contact), update `worker/src/bio.ts` in the same change. The chatbot answers from this file — drift here means the bot lies.
- **Two CI pipelines**: `.github/workflows/deploy.yml` rebuilds the static site on any push (and bakes the `NEXT_PUBLIC_CHAT_ENDPOINT` repo variable into the bundle). `.github/workflows/deploy-worker.yml` redeploys the worker only when `worker/**` changes, syncing secrets from GitHub to Cloudflare each time.
- **Removal**: delete `worker/`, the chat widget files, the `<ChatWidget />` mount in `app/layout.tsx`, and `deploy-worker.yml`. The repo variable + secrets can stay; they're inert without consumers.
