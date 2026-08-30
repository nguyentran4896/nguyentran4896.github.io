import type { MetadataRoute } from "next"
import { getAllArticles } from "@/lib/articles"

export const dynamic = "force-static"

const SITE_URL = "https://nguyentran4896.github.io"

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles()

  // Derive lastModified from real content dates so the home / blog / tokens
  // entries don't churn on every deploy (which makes lastmod less trustworthy
  // to crawlers). Fall back to the build date only when there are no articles.
  const dates = articles
    .map((a) => (a.date ? new Date(a.date).getTime() : 0))
    .filter(Boolean)
  const lastModified = dates.length ? new Date(Math.max(...dates)) : new Date()

  // URLs use trailing slashes to match what the static export actually serves
  // (next.config.mjs `trailingSlash: true`); the non-slash forms 301-redirect
  // on GitHub Pages. Hash fragments are omitted — crawlers ignore them.
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/blog/`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/tokens/`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    ...articles.map((a) => ({
      url: `${SITE_URL}/blog/${a.slug}/`,
      lastModified: a.date ? new Date(a.date) : lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]
}
