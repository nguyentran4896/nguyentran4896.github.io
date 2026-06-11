/**
 * Build-time dotted world map generator.
 *
 * Uses the `dotted-map` devDependency (zero runtime JS — pure SVG output).
 * Emits `components/footprint-map-data.ts` which exports the SVG string
 * as a TypeScript constant — imported at build time, inlined into the bundle.
 *
 * Pins:
 *   - Ho Chi Minh City  10.8231°N  106.6297°E
 *   - Sydney           -33.8688°S  151.2093°E
 *
 * Run: node scripts/generate-footprint-map.mjs
 */

import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const dm = require("dotted-map")
const DottedMap = dm.default

// ── City definitions ──────────────────────────────────────────────────────────
const CITIES = [
  {
    id: "hcmc",
    name: "Ho Chi Minh City",
    lat: 10.8231,
    lng: 106.6297,
    coords: "10°49′N 106°37′E",
  },
  {
    id: "sydney",
    name: "Sydney",
    lat: -33.8688,
    lng: 151.2093,
    coords: "33°52′S 151°12′E",
  },
]

// ── Map generation ─────────────────────────────────────────────────────────────
const map = new DottedMap({ height: 60, grid: "diagonal" })

for (const city of CITIES) {
  map.addPin({
    lat: city.lat,
    lng: city.lng,
    // Accent blue dots for the two cities; slightly larger radius for legibility
    svgOptions: { color: "#3B5CFF", radius: 0.5 },
  })
}

const svgString = map.getSVG({
  radius: 0.22,
  color: "#353535",
  shape: "circle",
  backgroundColor: "transparent",
})

// ── Emit TypeScript data file ─────────────────────────────────────────────────
const OUT = path.join(process.cwd(), "components", "footprint-map-data.ts")

const ts = `// AUTO-GENERATED — do not edit by hand.
// Re-generate with: node scripts/generate-footprint-map.mjs
//
// Zero runtime JS: this file is imported at build time and inlined into the
// component as a static SVG string. No map library ships to the browser.

export const FOOTPRINT_SVG = ${JSON.stringify(svgString)}

// copy — consolidate into lib/content.ts — a later integration agent migrates it
export const FOOTPRINT_CITIES = ${JSON.stringify(CITIES, null, 2)} as const
`

fs.writeFileSync(OUT, ts)
console.log(`[footprint-map] Wrote ${svgString.length} chars → ${OUT}`)
console.log(`[footprint-map] Accent pins: ${CITIES.map((c) => c.name).join(", ")}`)
