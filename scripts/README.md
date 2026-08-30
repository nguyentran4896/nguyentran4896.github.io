# Generated visual assets

Two committed image sets are rendered from HTML templates in this folder using a
headless browser, so they use the *real* Playfair Display + Geist Mono webfonts
and match the "Midnight Editorial" identity exactly (Satori/`next/og` can't
render the variable Playfair italic faithfully, which is why these are
pre-rendered and committed rather than generated at build time).

Both templates are plain static HTML — serve this folder over HTTP and screenshot
the sized element. Any headless browser works; the sizes below are the source of
truth.

## PWA icons — `icon-render.html`

Renders the `N.` monogram at 512×512. Two modes via `?mode=`:

- `?mode=any` → screenshot `#stage` → `public/icon-512.png`, then downscale to
  `public/icon-192.png`.
- `?mode=maskable` → screenshot `#stage` → `public/icon-maskable-512.png`, then
  downscale to `public/icon-maskable-192.png` (extra padding for the maskable
  safe zone).

Downscale with `sips -z 192 192 <file>` (macOS) or any image tool. Keep
`public/manifest.webmanifest` in sync with the produced files.

## Blog OG cards — `og-render.html`

Renders a 1200×630 social card. Driven by query params:

`?title=<post title>&tags=<comma,separated>&date=<Month D, YYYY>`

Screenshot `#card` → `public/articles/<slug>/og.png`. `generateMetadata` in
`app/blog/[slug]/page.tsx` picks up `public/articles/<slug>/og.png` automatically
and falls back to the site-wide `app/opengraph-image.png` when a post has no
card, so this step is optional per post (add a card for posts you want a bespoke
share image for).
