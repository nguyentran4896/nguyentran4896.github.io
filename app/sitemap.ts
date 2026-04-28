import type { MetadataRoute } from "next"
import { getAllArticles } from "@/lib/articles"

export const dynamic = "force-static"

const SITE_URL = "https://nguyentran4896.github.io"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  const articles = getAllArticles()

  // Note: hash fragments are ignored by search crawlers and shouldn't appear
  // in sitemaps. Only list canonical, crawlable URLs here.
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    ...articles.map((a) => ({
      url: `${SITE_URL}/blog/${a.slug}`,
      lastModified: a.date ? new Date(a.date) : lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]
}
