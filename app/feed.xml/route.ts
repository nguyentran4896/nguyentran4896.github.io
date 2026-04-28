import { getAllArticles } from "@/lib/articles"
import { site } from "@/lib/content"

export const dynamic = "force-static"

const SITE_URL = "https://nguyentran4896.github.io"

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export function GET() {
  const articles = getAllArticles().filter((a) => !a.draft)
  const updated = articles[0]?.date
    ? new Date(articles[0].date).toUTCString()
    : new Date().toUTCString()

  const items = articles
    .map((a) => {
      const url = `${SITE_URL}/blog/${a.slug}`
      const pubDate = a.date ? new Date(a.date).toUTCString() : updated
      return `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(a.excerpt)}</description>
      ${a.tags.map((t) => `<category>${escapeXml(t)}</category>`).join("")}
    </item>`
    })
    .join("")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.title)}</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(site.description)}</description>
    <language>en</language>
    <lastBuildDate>${updated}</lastBuildDate>${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  })
}
