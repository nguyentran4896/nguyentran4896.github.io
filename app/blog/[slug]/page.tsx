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
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.date,
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
    },
  }
}

function formatDate(d: string) {
  if (!d) return ""
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return d
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  return (
    <SmoothScroll>
      <Navbar />
      <main id="main" className="min-h-screen pt-32 pb-32">
        <article className="relative px-8 md:px-12">
          <header className="max-w-3xl mx-auto pt-12 md:pt-20 pb-12 md:pb-16">
            <Link
              href="/blog"
              className="inline-block font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-accent transition-colors mb-10"
            >
              ← All writing
            </Link>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 font-mono text-[11px] tracking-[0.25em] uppercase text-muted-foreground">
              <time dateTime={article.date}>{formatDate(article.date)}</time>
              {article.tags.length > 0 && (
                <>
                  <span aria-hidden className="text-white/20">
                    /
                  </span>
                  <span className="text-accent">{article.tags.join(" · ")}</span>
                </>
              )}
            </div>
            <h1 className="font-sans text-4xl md:text-6xl font-light italic leading-[1.05] tracking-tight">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="mt-8 text-lg md:text-xl leading-relaxed text-white/65 font-light">
                {article.excerpt}
              </p>
            )}
            <hr className="mt-12 border-0 border-t border-white/10" />
          </header>

          <div className="max-w-3xl mx-auto">
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
                        theme: "github-dark-dimmed",
                        keepBackground: false,
                      },
                    ],
                  ],
                },
              }}
            />
          </div>

          <footer className="max-w-3xl mx-auto mt-20 pt-10 border-t border-white/10">
            <Link
              href="/blog"
              className="inline-block font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground hover:text-accent transition-colors"
            >
              ← Back to writing
            </Link>
          </footer>
        </article>
      </main>
    </SmoothScroll>
  )
}
