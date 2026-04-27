import type { MetadataRoute } from "next"
import { getAllArticles } from "@/lib/articles"

export const dynamic = "force-static"

const SITE_URL = "https://nguyentran4896.github.io"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  const articles = getAllArticles()

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/#about`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/#experience`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/#works`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/#recognition`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/#contact`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    ...articles.map((a) => ({
      url: `${SITE_URL}/blog/${a.slug}`,
      lastModified: a.date ? new Date(a.date) : lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]
}
