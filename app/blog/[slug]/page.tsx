import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import rehypePrettyCode from "rehype-pretty-code"
import { Navbar } from "@/components/navbar"
import { SmoothScroll } from "@/components/smooth-scroll"
import { mdxComponents } from "@/components/mdx-components"
import { getAllArticles, getArticleBySlug } from "@/lib/articles"

const SITE_URL = "https://nguyentran4896.github.io"

type Params = { slug: string }

export function generateStaticParams(): Params[] {
  return getAllArticles().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}
  const url = `${SITE_URL}/blog/${article.slug}`
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: article.excerpt,
      siteName: "Nguyen Tran",
      publishedTime: article.date,
      modifiedTime: article.date,
      authors: [`${SITE_URL}`],
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      creator: "@nguyentran4896",
    },
  }
}

function formatDate(d: string) {
  if (!d) return ""
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return d
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

function readingTime(text: string) {
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 220))
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const mins = readingTime(article.content)
  const url = `${SITE_URL}/blog/${article.slug}`

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.date,
    inLanguage: "en",
    keywords: article.tags.join(", "),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    author: {
      "@type": "Person",
      name: "Nguyen Tran",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: "Nguyen Tran",
      url: SITE_URL,
    },
    wordCount: article.content.trim().split(/\s+/).length,
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Writing", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: article.title, item: url },
    ],
  }

  return (
    <div data-theme="paper" className="bg-background text-foreground min-h-screen">
      <SmoothScroll>
        <Navbar />
        <main id="main" className="relative">
          <article className="relative">
            {/* Header — full-bleed editorial intro */}
            <header className="relative px-6 sm:px-10 md:px-12 pt-28 sm:pt-32 md:pt-40 pb-10 md:pb-16">
              <div className="max-w-[68ch] mx-auto">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-accent transition-colors mb-10"
                >
                  <span aria-hidden>←</span>
                  All writing
                </Link>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-8 font-mono text-[10.5px] sm:text-[11px] tracking-[0.25em] uppercase text-muted-foreground">
                  <time dateTime={article.date}>{formatDate(article.date)}</time>
                  <span aria-hidden className="text-foreground/20">/</span>
                  <span>{mins} min read</span>
                  {article.tags.length > 0 && (
                    <>
                      <span aria-hidden className="text-foreground/20">/</span>
                      <span className="text-accent">{article.tags.join(" · ")}</span>
                    </>
                  )}
                </div>

                <h1 className="font-sans font-light italic leading-[1.04] tracking-tight text-[2.25rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] text-balance">
                  {article.title}
                </h1>

                {article.excerpt && (
                  <p className="mt-7 sm:mt-9 text-[1.05rem] sm:text-lg md:text-xl leading-[1.55] text-foreground/65 font-light text-pretty">
                    {article.excerpt}
                  </p>
                )}
              </div>

              {/* Hairline + mono signature */}
              <div className="max-w-[68ch] mx-auto mt-12 md:mt-16 flex items-center gap-4">
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                  Essay / {String(slug).slice(0, 2).toUpperCase()}
                </span>
                <span className="flex-1 h-px bg-border" />
                <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-accent" />
              </div>
            </header>

            {/* Body */}
            <div className="px-6 sm:px-10 md:px-12">
              <div className="max-w-[68ch] mx-auto pb-16 md:pb-24">
                <MDXRemote
                  source={article.content}
                  components={mdxComponents}
                  options={{
                    mdxOptions: {
                      remarkPlugins: [remarkGfm],
                      rehypePlugins: [
                        [
                          rehypePrettyCode,
                          {
                            theme: "github-light",
                            keepBackground: false,
                          },
                        ],
                      ],
                    },
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <footer className="px-6 sm:px-10 md:px-12 pb-24 md:pb-32">
              <div className="max-w-[68ch] mx-auto pt-10 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <Link
                  href="/blog"
                  className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground hover:text-accent transition-colors"
                >
                  <span aria-hidden className="transition-transform group-hover:-translate-x-1">←</span>
                  Back to writing
                </Link>
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                  Filed {formatDate(article.date)}
                </span>
              </div>
            </footer>
          </article>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
          />
        </main>
      </SmoothScroll>
    </div>
  )
}
