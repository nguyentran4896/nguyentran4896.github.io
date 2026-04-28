import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

const ARTICLES_DIR = path.join(process.cwd(), "content/articles")

export type Article = {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  draft: boolean
  content: string
}

function readArticleFile(filename: string): Article {
  const filePath = path.join(ARTICLES_DIR, filename)
  const raw = fs.readFileSync(filePath, "utf8")
  const { data, content } = matter(raw)
  const fallbackSlug = filename.replace(/\.mdx?$/, "")
  return {
    slug: typeof data.slug === "string" && data.slug.length > 0 ? data.slug : fallbackSlug,
    title: data.title ?? fallbackSlug,
    date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? ""),
    excerpt: data.excerpt ?? "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    draft: Boolean(data.draft),
    content,
  }
}

export function getAllArticles(): Article[] {
  if (!fs.existsSync(ARTICLES_DIR)) return []
  const files = fs.readdirSync(ARTICLES_DIR).filter((f) => /\.mdx?$/.test(f))
  const includeDrafts = process.env.NODE_ENV !== "production"
  return files
    .map(readArticleFile)
    .filter((a) => includeDrafts || !a.draft)
    .sort((a, b) => {
      const ta = a.date ? Date.parse(a.date) : 0
      const tb = b.date ? Date.parse(b.date) : 0
      return tb - ta
    })
}

export function getArticleBySlug(slug: string): Article | undefined {
  return getAllArticles().find((a) => a.slug === slug)
}

export function getRelatedArticles(slug: string, limit = 3): Article[] {
  const all = getAllArticles()
  const current = all.find((a) => a.slug === slug)
  if (!current) return []
  const others = all.filter((a) => a.slug !== slug && !a.draft)
  return others
    .map((a) => ({
      article: a,
      score: a.tags.filter((t) => current.tags.includes(t)).length,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      const ta = a.article.date ? Date.parse(a.article.date) : 0
      const tb = b.article.date ? Date.parse(b.article.date) : 0
      return tb - ta
    })
    .slice(0, limit)
    .map((s) => s.article)
}
