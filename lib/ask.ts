import type { Fact } from "@/lib/content"

/**
 * Tiny on-device retrieval for the on-site "Ask". No model, no network: it
 * ranks the site's own facts against the question with a BM25-style score and
 * returns the best matches, so every answer is traceable to a section.
 */

const STOP = new Set(
  "a an and are as at be by can could do does did for from has have how i if in is it its me my of on or please s so tell that the their them there these this to us was were what when where which who why will with would you your about more".split(
    " ",
  ),
)

function stem(w: string): string {
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y"
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3)
  if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2)
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1)
  return w
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^[.-]+|[.-]+$/g, ""))
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map(stem)
}

export type Hit = { fact: Fact; score: number }

export type Index = {
  docs: { fact: Fact; tf: Map<string, number>; len: number }[]
  idf: Map<string, number>
  avg: number
}

export function buildIndex(facts: Fact[]): Index {
  const docs = facts.map((fact) => {
    const tf = new Map<string, number>()
    const add = (text: string, weight: number) => {
      for (const t of tokenize(text)) tf.set(t, (tf.get(t) ?? 0) + weight)
    }
    add(fact.title, 3)
    add(fact.keywords, 2)
    add(fact.answer, 1)
    let len = 0
    tf.forEach((v) => (len += v))
    return { fact, tf, len }
  })
  const df = new Map<string, number>()
  docs.forEach((d) => d.tf.forEach((_, t) => df.set(t, (df.get(t) ?? 0) + 1)))
  const n = docs.length
  const idf = new Map<string, number>()
  df.forEach((c, t) => idf.set(t, Math.log(1 + (n - c + 0.5) / (c + 0.5))))
  const avg = docs.reduce((s, d) => s + d.len, 0) / Math.max(1, n)
  return { docs, idf, avg }
}

export function search(index: Index, query: string, limit = 3): Hit[] {
  const q = tokenize(query)
  if (q.length === 0) return []
  const k1 = 1.4
  const b = 0.6
  const hits: Hit[] = []
  for (const d of index.docs) {
    let score = 0
    for (const t of q) {
      const f = d.tf.get(t)
      if (!f) continue
      const idf = index.idf.get(t) ?? 0
      score += (idf * (f * (k1 + 1))) / (f + k1 * (1 - b + (b * d.len) / index.avg))
    }
    if (score > 0) hits.push({ fact: d.fact, score })
  }
  hits.sort((a, b2) => b2.score - a.score)
  const top = hits[0]?.score ?? 0
  // Drop weak tails so the "related" list stays relevant.
  return hits.filter((h, i) => i === 0 || h.score >= top * 0.45).slice(0, limit)
}

/** Below this the best hit is treated as a miss rather than a guess. */
export const MIN_SCORE = 1.6
