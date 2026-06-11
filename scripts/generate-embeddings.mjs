/**
 * Embedding Atlas — build script
 *
 * Generates lib/embeddings.json: a flat array of 2D-projected text snippets
 * with precomputed nearest-neighbour indices, ready for the browser to render
 * as a scatter plot. No vectors are emitted to JSON — all similarity math
 * runs here at build time.
 *
 * Corpus sources:
 *  1. content/articles/*.mdx — each body paragraph (blank-line-split, MDX
 *     markup stripped, frontmatter excluded via gray-matter, drafts skipped,
 *     min length 120 chars).
 *  2. works titles + descriptions — extracted inline from lib/content.ts via
 *     a light regex pass over the raw source (pragmatic; avoids Node ESM
 *     gymnastics with a TypeScript file that has type assertions).
 *  3. about statements — same regex approach over lib/content.ts.
 *
 * Dimensionality reduction: hand-rolled PCA to 2D (mean-centred, covariance
 * matrix via dot products, power-iteration for top 2 eigenvectors).
 * Coordinates are normalised to [0,1]. No runtime umap-js.
 *
 * Run: node scripts/generate-embeddings.mjs
 *
 * HARD CONSTRAINT: @huggingface/transformers is only imported here.
 * The browser receives plain JSON — no ONNX/transformers code in the bundle.
 */

import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import { pipeline, env } from "@huggingface/transformers"

const require = createRequire(import.meta.url)
const matter = require("gray-matter")

// ─── Paths ────────────────────────────────────────────────────────────────────

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..")
const ARTICLES_DIR = path.join(ROOT, "content", "articles")
const CONTENT_TS = path.join(ROOT, "lib", "content.ts")
const OUT = path.join(ROOT, "lib", "embeddings.json")

// ─── Configure HF cache (local .hf-cache to avoid polluting the home dir) ────

env.cacheDir = path.join(ROOT, ".hf-cache")

// ─── 1. Corpus extraction ─────────────────────────────────────────────────────

/**
 * Strip MDX / Markdown markup from a string:
 * - JSX / HTML tags
 * - Code fences and inline code
 * - Markdown link syntax
 * - ATX headings
 * - Leading list markers
 */
function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, "") // fenced code blocks
    .replace(/`[^`]+`/g, "") // inline code
    .replace(/<[^>]+>/g, " ") // JSX / HTML tags
    .replace(/!\[.*?\]\(.*?\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → label
    .replace(/^#{1,6}\s+/gm, "") // ATX headings
    .replace(/^[-*+]\s+/gm, "") // list markers
    .replace(/^>\s*/gm, "") // blockquotes
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1") // bold / italic
    .replace(/_{1,2}([^_]+)_{1,2}/g, "$1") // underscore bold / italic
    .replace(/\s{2,}/g, " ") // collapse whitespace
    .trim()
}

/** Collect text snippets from MDX articles. */
function collectArticleSnippets() {
  const snippets = []
  if (!fs.existsSync(ARTICLES_DIR)) {
    console.warn("[embeddings] articles dir not found, skipping")
    return snippets
  }
  const files = fs.readdirSync(ARTICLES_DIR).filter((f) => /\.mdx?$/.test(f))
  for (const file of files) {
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), "utf8")
    const { data, content } = matter(raw)
    if (data.draft === true) continue
    const slug = file.replace(/\.mdx?$/, "")
    const href = `/blog/${slug}`

    // Split on one or more blank lines to get logical paragraphs.
    const paragraphs = content.split(/\n{2,}/)
    for (const para of paragraphs) {
      const cleaned = stripMarkdown(para)
      if (cleaned.length < 120) continue
      snippets.push({
        kind: "post-para",
        href,
        excerpt: cleaned.slice(0, 180) + (cleaned.length > 180 ? "…" : ""),
        text: cleaned,
      })
    }
  }
  console.log(`[embeddings] articles → ${snippets.length} paragraphs`)
  return snippets
}

/**
 * Pragmatic extraction of works and about data from lib/content.ts source.
 * We read the raw TS source as text and use simple regex patterns to pull
 * string literals from well-known keys. This avoids ts-node / esm complexity
 * while staying correct for the current file structure.
 */
function extractFromContentTs() {
  const src = fs.readFileSync(CONTENT_TS, "utf8")
  const snippets = []

  // ── Works: title + summary ──────────────────────────────────────────────────
  // Extract the works block from lib/content.ts and pull title/summary pairs.
  // We find the `export const works` block and only operate within it.
  const worksMatch = src.match(/export const works\s*=\s*\{([\s\S]+?)^\} as const|export const works\s*=\s*\{([\s\S]+?)^}/)
  const worksBlock = worksMatch ? (worksMatch[1] || worksMatch[2] || "") : ""

  if (worksBlock) {
    // Extract individual project objects: find { title: "...", ... summary: "..." } blocks
    const projectRe = /\{\s*title:\s*"([^"]+)"[\s\S]+?summary:\s*\n?\s*"([^"]+)"/g
    let m
    while ((m = projectRe.exec(worksBlock)) !== null) {
      const [, projectTitle, projectSummary] = m
      const text = `${projectTitle}: ${projectSummary}`
      snippets.push({
        kind: "work",
        href: "/#works",
        excerpt: text.slice(0, 180) + (text.length > 180 ? "…" : ""),
        text,
      })
    }
  }

  if (snippets.filter(s => s.kind === "work").length === 0) {
    // Fallback: extract title + summary pairs from the projects block via simpler patterns
    const projectsMatch = src.match(/projects:\s*\[([\s\S]+?)\]\s*satisfies/)
    if (projectsMatch) {
      const projectsBlock = projectsMatch[1]
      const titleRe2 = /title:\s*"([^"]+)"/g
      const summaryRe2 = /summary:\s*\n?\s*"([^"]+)"/g
      const titles = []; const sums = []
      let m2
      while ((m2 = titleRe2.exec(projectsBlock)) !== null) titles.push(m2[1])
      while ((m2 = summaryRe2.exec(projectsBlock)) !== null) sums.push(m2[1])
      for (let i = 0; i < Math.min(titles.length, sums.length); i++) {
        const text = `${titles[i]}: ${sums[i]}`
        snippets.push({ kind: "work", href: "/#works", excerpt: text.slice(0, 180) + (text.length > 180 ? "…" : ""), text })
      }
    }
  }

  // ── About statements ────────────────────────────────────────────────────────
  // Extract the statements array from the about export.
  const aboutBlock = src.match(/export const about\s*=\s*\{[\s\S]+?^\}/m)
  if (aboutBlock) {
    const statRe = /"([^"]{20,})"/g
    let ma
    while ((ma = statRe.exec(aboutBlock[0])) !== null) {
      const text = ma[1]
      // Exclude things that look like keys or labels (contain no spaces → skip)
      if (!text.includes(" ")) continue
      // Exclude sectionLabel and sectionTitle values (short labels, not statements)
      if (!text.startsWith("I ") && !text.startsWith("AI ") && !text.startsWith("Published") && !text.startsWith("I'")) continue
      snippets.push({
        kind: "about",
        href: "/#about",
        excerpt: text,
        text,
      })
    }
  }

  console.log(`[embeddings] content.ts → ${snippets.length} snippets (works + about)`)
  return snippets
}

// ─── 2. Embedding ─────────────────────────────────────────────────────────────

async function embedTexts(texts) {
  console.log(`[embeddings] Loading Xenova/all-MiniLM-L6-v2 (q8)…`)
  const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
    dtype: "q8",
  })

  const BATCH = 8
  const allVecs = []
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH)
    const output = await extractor(batch, { pooling: "mean", normalize: true })
    // output.tolist() → Array<number[]>
    const vecs = output.tolist()
    allVecs.push(...vecs)
    console.log(`[embeddings] Embedded ${Math.min(i + BATCH, texts.length)}/${texts.length}`)
  }
  return allVecs // already L2-normalised (normalize: true)
}

// ─── 3. Hand-rolled PCA to 2D ─────────────────────────────────────────────────

/**
 * Dot product of two equal-length vectors.
 */
function dot(a, b) {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i] * b[i]
  return s
}

/**
 * Scale a vector in-place by scalar k.
 */
function scale(v, k) {
  return v.map((x) => x * k)
}

/**
 * Add two vectors element-wise.
 */
function add(a, b) {
  return a.map((x, i) => x + b[i])
}

/**
 * Subtract two vectors element-wise.
 */
function sub(a, b) {
  return a.map((x, i) => x - b[i])
}

/**
 * L2-normalise a vector in-place.
 */
function normalize(v) {
  const len = Math.sqrt(dot(v, v))
  return len < 1e-12 ? v : v.map((x) => x / len)
}

/**
 * PCA: project N×D matrix of embeddings to N×2.
 *
 * Algorithm:
 *  1. Mean-centre the rows.
 *  2. Find top 2 eigenvectors via power iteration on the covariance matrix
 *     (X^T X / N), with deflation for the second component.
 *  3. Project: coords = X_centred × [e1, e2]
 *
 * ~30 lines of math, no dependencies.
 */
function pca2d(vecs) {
  const N = vecs.length
  const D = vecs[0].length

  // 1. Mean-centre
  const mean = new Array(D).fill(0)
  for (const v of vecs) for (let d = 0; d < D; d++) mean[d] += v[d] / N
  const centred = vecs.map((v) => sub(v, mean))

  // 2. Power iteration for top 2 eigenvectors
  const ITERS = 200

  function powerIter(matrix, iters) {
    // Start from a random-ish unit vector (deterministic seed)
    let ev = normalize(matrix[0].map((_, i) => Math.sin(i + 1)))
    for (let it = 0; it < iters; it++) {
      // Multiply: Xᵀ(Xv) — more numerically stable than computing XᵀX directly
      const Xv = matrix.map((row) => dot(row, ev)) // N-vector
      const XtXv = new Array(D).fill(0)
      for (let n = 0; n < N; n++) for (let d = 0; d < D; d++) XtXv[d] += matrix[n][d] * Xv[n]
      ev = normalize(XtXv)
    }
    return ev
  }

  const e1 = powerIter(centred, ITERS)

  // Deflate: remove e1 component from centred
  const deflated = centred.map((v) => {
    const proj = dot(v, e1)
    return sub(v, scale(e1, proj))
  })
  const e2 = powerIter(deflated, ITERS)

  // 3. Project
  const coords = centred.map((v) => [dot(v, e1), dot(v, e2)])
  return coords
}

/**
 * Normalise a 1D array of numbers to [0,1].
 */
function normalizeRange(arr) {
  const min = Math.min(...arr)
  const max = Math.max(...arr)
  const range = max - min
  return range < 1e-12 ? arr.map(() => 0.5) : arr.map((v) => (v - min) / range)
}

// ─── 4. Nearest neighbours (cosine — vectors already L2-normalised) ───────────

/**
 * For each entry, find its k nearest neighbours by cosine similarity
 * (dot product, since vectors are normalised).
 */
function computeNeighbors(vecs, k = 3) {
  const N = vecs.length
  return vecs.map((v, i) => {
    const sims = vecs
      .map((u, j) => ({ j, sim: j === i ? -Infinity : dot(v, u) }))
      .sort((a, b) => b.sim - a.sim)
    return sims.slice(0, k).map((s) => s.j)
  })
}

// ─── 5. Main ──────────────────────────────────────────────────────────────────

async function main() {
  const articleSnippets = collectArticleSnippets()
  const contentSnippets = extractFromContentTs()
  const all = [...articleSnippets, ...contentSnippets]

  if (all.length === 0) {
    console.error("[embeddings] No corpus entries found — aborting.")
    process.exit(1)
  }

  console.log(`[embeddings] Total corpus: ${all.length} entries`)

  const texts = all.map((s) => s.text)
  const vecs = await embedTexts(texts)

  console.log("[embeddings] Running PCA → 2D…")
  const coords2d = pca2d(vecs)

  const xs = normalizeRange(coords2d.map((c) => c[0]))
  const ys = normalizeRange(coords2d.map((c) => c[1]))

  console.log("[embeddings] Computing nearest neighbours…")
  const neighbors = computeNeighbors(vecs, 3)

  const entries = all.map((s, i) => ({
    id: `${s.kind}-${i}`,
    kind: s.kind,
    href: s.href,
    excerpt: s.excerpt,
    x: Math.round(xs[i] * 10000) / 10000,
    y: Math.round(ys[i] * 10000) / 10000,
    neighbors: neighbors[i],
  }))

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(entries, null, 2))
  console.log(`[embeddings] Wrote ${entries.length} entries → ${OUT}`)
}

main().catch((err) => {
  console.error("[embeddings] FATAL:", err)
  process.exit(1)
})
