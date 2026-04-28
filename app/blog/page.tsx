import Link from "next/link"
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { SmoothScroll } from "@/components/smooth-scroll"
import { getAllArticles } from "@/lib/articles"

const SITE_URL = "https://nguyentran4896.github.io"

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes and essays by Nguyen Tran on software engineering at scale, medical AI, computer vision, and the discipline of building quiet software.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/blog`,
    siteName: "Nguyen Tran",
    title: "Writing — Nguyen Tran",
    description:
      "Notes and essays on software engineering at scale, medical AI, and computer vision.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Writing — Nguyen Tran",
    description:
      "Notes and essays on software engineering at scale, medical AI, and computer vision.",
    creator: "@nguyentran4896",
  },
}

function formatDate(d: string) {
  if (!d) return ""
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return d
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

export default function BlogIndexPage() {
  const articles = getAllArticles()

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Writing — Nguyen Tran",
    url: `${SITE_URL}/blog`,
    inLanguage: "en",
    author: { "@type": "Person", name: "Nguyen Tran", url: SITE_URL },
    blogPost: articles.map((a) => ({
      "@type": "BlogPosting",
      headline: a.title,
      description: a.excerpt,
      datePublished: a.date,
      url: `${SITE_URL}/blog/${a.slug}`,
      keywords: a.tags.join(", "),
      author: { "@type": "Person", name: "Nguyen Tran", url: SITE_URL },
    })),
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Writing", item: `${SITE_URL}/blog` },
    ],
  }

  return (
    <SmoothScroll>
      <Navbar />
      <main id="main" className="min-h-screen pt-32 pb-32">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <section className="relative px-8 md:px-12 py-20 md:py-28">
          <div className="mb-20 md:mb-24 max-w-4xl">
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">
              09 — WRITING
            </p>
            <h1 className="font-sans text-4xl md:text-6xl font-light italic leading-[1.05]">
              Notes &amp; essays
            </h1>
            <p className="mt-8 max-w-2xl text-base md:text-lg leading-relaxed text-white/60">
              Field notes on engineering at scale, medical AI, and the discipline of building quiet
              software.
            </p>
          </div>

          {articles.length === 0 ? (
            <p className="font-mono text-xs tracking-widest text-muted-foreground">
              — NO ENTRIES YET
            </p>
          ) : (
            <ol className="border-t border-white/10">
              {articles.map((article, index) => (
                <li key={article.slug} className="border-b border-white/10">
                  <Link
                    href={`/blog/${article.slug}`}
                    className="group block py-10 md:py-12 grid grid-cols-1 md:grid-cols-[18%_1fr_auto] gap-4 md:gap-12 items-baseline transition-colors hover:bg-white/[0.015]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] tracking-[0.3em] text-accent">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-muted-foreground">
                        {formatDate(article.date)}
                      </span>
                    </div>

                    <div>
                      <h2 className="font-sans text-2xl md:text-4xl font-light italic leading-tight group-hover:text-white transition-colors">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p className="mt-3 max-w-2xl text-sm md:text-base leading-relaxed text-white/55">
                          {article.excerpt}
                        </p>
                      )}
                      {article.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {article.tags.map((tag) => (
                            <span
                              key={tag}
                              className="font-mono text-[10px] tracking-wider px-3 py-1 border border-white/15 rounded-full text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {article.draft && (
                        <span className="mt-4 inline-block font-mono text-[10px] tracking-[0.3em] text-accent uppercase">
                          Draft
                        </span>
                      )}
                    </div>

                    <span
                      aria-hidden
                      className="hidden md:inline-block font-mono text-xs tracking-widest text-muted-foreground group-hover:text-accent transition-all group-hover:translate-x-1"
                    >
                      READ →
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>
    </SmoothScroll>
  )
}
