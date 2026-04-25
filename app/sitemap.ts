import type { MetadataRoute } from "next"

export const dynamic = "force-static"

const SITE_URL = "https://nguyentran4896.github.io"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/#about`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/#experience`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/#works`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/#recognition`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/#contact`, lastModified, changeFrequency: "monthly", priority: 0.6 },
  ]
}
