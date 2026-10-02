import type { Metadata } from "next"
import { Link } from "next-view-transitions"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import { formatDate } from "@/lib/format"
import { getAllArticles } from "@/lib/articles"

const SITE_URL = "https://nguyentran4896.github.io"

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes and essays by Nguyen Tran on software engineering at scale, medical AI, computer vision, and the discipline of building quiet software.",
  alternates: { canonical: "/blog/" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/blog/`,
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
    site: "@nguyentran4896",
    creator: "@nguyentran4896",
  },
}

export default function BlogIndexPage() {
  const articles = getAllArticles()

  const ogImage = `${SITE_URL}/opengraph-image.png`

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Writing — Nguyen Tran",
    url: `${SITE_URL}/blog/`,
    inLanguage: "en",
    author: { "@type": "Person", name: "Nguyen Tran", url: SITE_URL },
    blogPost: articles.map((a) => ({
      "@type": "BlogPosting",
      headline: a.title,
      description: a.excerpt,
      image: [ogImage],
      datePublished: a.date,
      url: `${SITE_URL}/blog/${a.slug}/`,
      keywords: a.tags.join(", "),
      author: { "@type": "Person", name: "Nguyen Tran", url: SITE_URL },
    })),
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Writing", item: `${SITE_URL}/blog/` },
    ],
  }

  return (
    <>
      <SiteHeader />
      <main id="main" className="min-h-screen px-5 pb-28 pt-32 sm:px-8 sm:pt-44">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <div className="mx-auto max-w-6xl">
          <header className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-text">Writing</p>
            <h1 className="mt-4 text-balance font-display text-6xl leading-[1.02] sm:text-8xl">Notes and essays.</h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Field notes on engineering at scale, medical AI, and the discipline of building quiet software.
            </p>
          </header>

          {articles.length === 0 ? (
            <p className="mt-16 text-muted-foreground">No entries yet.</p>
          ) : (
            <ol className="mt-16 border-t border-border">
              {articles.map((article) => (
                <li key={article.slug} className="border-b border-border">
                  <Link
                    href={`/blog/${article.slug}`}
                    className="group grid gap-3 py-9 sm:grid-cols-[12rem_1fr_auto] sm:items-baseline sm:gap-10"
                  >
                    <time dateTime={article.date} className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {formatDate(article.date)}
                    </time>
                    <div>
                      <h2
                        className="font-display text-3xl leading-snug sm:text-4xl"
                        style={{ viewTransitionName: `post-title-${article.slug}` }}
                      >
                        {article.title}
                      </h2>
                      {article.excerpt && <p className="mt-3 max-w-2xl text-muted-foreground">{article.excerpt}</p>}
                      {article.tags.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {article.tags.map((tag) => (
                            <li key={tag} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                              {tag}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <span aria-hidden className="hidden text-muted-foreground transition group-hover:translate-x-1 group-hover:text-accent-text sm:block">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
