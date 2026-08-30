"use client"

import { FOOTPRINT_SVG, FOOTPRINT_CITIES } from "@/components/footprint-map-data"

import { footprint as FOOTPRINT_COPY } from "@/lib/content"

/**
 * The SVG string with CSS class `fp-pin` injected onto the two accent-blue
 * circles so the scoped @keyframes can animate them.
 *
 * Evaluated once at module initialisation — the result is a static string,
 * no JS loop runs in the browser on re-renders.
 */
const PATCHED_SVG = FOOTPRINT_SVG.replace(
  /(<circle[^>]+fill="#3B5CFF"[^>]*)(\/?>)/g,
  (match, prefix, end) =>
    prefix.includes('class="') ? match : `${prefix} class="fp-pin"${end}`,
)

export function FootprintMap() {
  return (
    <figure className="relative w-full">
      {/* Scoped pulse keyframes — disabled under prefers-reduced-motion via media query */}
      <style>{`
        @keyframes fp-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
        .fp-pin {
          animation: fp-pulse 2.4s ease-in-out infinite;
        }
        .fp-pin:last-of-type {
          animation-delay: 1.2s;
        }
        @media (prefers-reduced-motion: reduce) {
          .fp-pin {
            animation: none;
          }
        }
      `}</style>

      {/* Map wrapper — hairline border, square corners (DESIGN.md: flat, no radius) */}
      <div
        className="relative w-full overflow-hidden border border-border/40"
        aria-hidden="true"
      >
        {/* Inline SVG — zero map JS, pure static markup */}
        <div
          className="w-full [&>svg]:w-full [&>svg]:h-auto"
          // Safe: SVG is 100% build-time generated from dotted-map; no user input.
          dangerouslySetInnerHTML={{ __html: PATCHED_SVG }}
        />
      </div>

      {/* City coordinate captions — Geist Mono micro-labels */}
      <figcaption className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
        {FOOTPRINT_CITIES.map((city) => (
          <span key={city.id} className="flex items-center gap-2">
            {/* Accent dot indicator — hex value is a canvas/SVG uniform, per design law */}
            <span
              className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: "#3B5CFF" }}
            />
            <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
              {city.name}
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              {city.coords}
            </span>
          </span>
        ))}
      </figcaption>
    </figure>
  )
}

