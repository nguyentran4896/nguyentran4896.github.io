// Build-time fetch of the GitHub contribution calendar.
//
// No token, no secret: GitHub serves the public contribution graph as HTML at
// https://github.com/users/<user>/contributions. We parse it into
// lib/contributions.json. This reflects PUBLIC contributions only — which for
// this account is already a full graph (thousands/year).
//
// Robustness: every failure path (network down, HTTP error, markup changed)
// logs and returns without touching the file, so the build keeps whatever
// snapshot is committed. An empty snapshot makes the section hide itself, so
// the site never shows a broken or fake calendar.
//
// Run manually:  node scripts/fetch-contributions.mjs   (or: pnpm contributions)

import fs from "node:fs"
import path from "node:path"

const USERNAME = "nguyentran4896"
const OUT = path.join(process.cwd(), "lib", "contributions.json")
const URL = `https://github.com/users/${USERNAME}/contributions`

// Parse the contributions HTML into { total, weeks }. Each day cell is a
// <td ... data-date data-level id="contribution-day-component-{row}-{col}"> and
// carries a sibling <tool-tip for="…{row}-{col}">N contributions on …</tool-tip>
// with the exact count. We key counts to cells by that shared id, then rebuild
// the week columns from the {row, col} encoded in the id.
function parse(html) {
  // Authoritative total from the heading text ("4,866 contributions in the last year").
  const totalText = html.match(/([\d,]+)\s+contributions?\s+in\s+the\s+last\s+year/i)
  const headingTotal = totalText ? Number(totalText[1].replace(/,/g, "")) : null

  // id -> count, from tool-tip text. "No contributions …" -> 0.
  const counts = new Map()
  const ttRe = /<tool-tip\b[^>]*\bfor="(contribution-day-component-\d+-\d+)"[^>]*>([^<]*)<\/tool-tip>/g
  for (const m of html.matchAll(ttRe)) {
    const n = parseInt(m[2], 10)
    counts.set(m[1], Number.isNaN(n) ? 0 : n)
  }

  // id "...-{row}-{col}" -> { date, level, count } for each populated day cell.
  const cols = new Map() // col -> Map(row -> day)
  const cellRe = /<td\b[^>]*class="ContributionCalendar-day"[^>]*>/g
  for (const m of html.matchAll(cellRe)) {
    const tag = m[0]
    const date = tag.match(/data-date="([^"]+)"/)?.[1]
    const idm = tag.match(/id="(contribution-day-component-(\d+)-(\d+))"/)
    if (!date || !idm) continue // leading/trailing filler cells have no date
    const id = idm[1]
    const row = Number(idm[2])
    const col = Number(idm[3])
    const level = Number(tag.match(/data-level="(\d)"/)?.[1] ?? 0)
    const day = { date, count: counts.get(id) ?? 0, level }
    if (!cols.has(col)) cols.set(col, new Map())
    cols.get(col).set(row, day)
  }

  if (cols.size === 0) return null

  const weeks = [...cols.keys()]
    .sort((a, b) => a - b)
    .map((col) => ({
      days: [...cols.get(col).entries()].sort((a, b) => a[0] - b[0]).map(([, d]) => d),
    }))

  const summed = weeks.reduce((s, w) => s + w.days.reduce((d, x) => d + x.count, 0), 0)
  return { total: headingTotal ?? summed, weeks }
}

async function main() {
  let html
  try {
    const res = await fetch(URL, {
      headers: {
        "User-Agent": "portfolio-contributions-fetch",
        "X-Requested-With": "XMLHttpRequest",
      },
    })
    if (!res.ok) {
      console.error(`[contributions] HTTP ${res.status} from GitHub — keeping existing snapshot.`)
      return
    }
    html = await res.text()
  } catch (e) {
    console.error(`[contributions] Network error (${e.message}) — keeping existing snapshot.`)
    return
  }

  const parsed = parse(html)
  if (!parsed || !parsed.weeks.length) {
    console.error("[contributions] Could not parse calendar markup — keeping existing snapshot.")
    return
  }

  const out = {
    username: USERNAME,
    total: parsed.total,
    generatedAt: new Date().toISOString(),
    weeks: parsed.weeks,
  }

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n")
  console.log(`[contributions] Wrote ${parsed.weeks.length} weeks · ${parsed.total} total contributions.`)
}

main().catch((e) => {
  // Never fail the build over the calendar.
  console.error("[contributions] Failed:", e.message)
})
