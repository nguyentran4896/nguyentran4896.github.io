import { Link } from "next-view-transitions"
import { ArrowRight } from "lucide-react"
import { writing } from "@/lib/content"
import { getAllArticles } from "@/lib/articles"
import { Section } from "@/components/section"
import { formatDate } from "@/lib/format"

export function Writing() {
  const posts = getAllArticles().slice(0, 2)
  return (
    <Section id="writing" eyebrow={writing.eyebrow} title={writing.title} className="border-t border-border">
      <ol data-swarm-list className="border-t border-border">
        {posts.map((a) => (
          <li key={a.slug} className="reveal border-b border-border">
            <Link
              href={`/blog/${a.slug}`}
              className="group grid gap-2 py-6 transition sm:grid-cols-[12rem_1fr_auto] sm:items-baseline sm:gap-10"
            >
              <time dateTime={a.date} data-swt="text" className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {formatDate(a.date)}
              </time>
              <div>
                <h3
                  className="font-display text-2xl leading-snug"
                  style={{ viewTransitionName: `post-title-${a.slug}` }}
                >
                  {a.title}
                </h3>
                {a.excerpt && <p data-swt="text" className="mt-1.5 line-clamp-1 max-w-2xl text-base text-muted-foreground">{a.excerpt}</p>}
              </div>
              <ArrowRight
                className="hidden size-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-accent-text sm:block"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ol>
      <Link
        href="/blog"
        data-swt="cta"
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-border-strong px-5 py-2.5 text-sm transition hover:bg-foreground hover:text-background"
      >
        {writing.all} <ArrowRight className="size-4" aria-hidden />
      </Link>
    </Section>
  )
}
