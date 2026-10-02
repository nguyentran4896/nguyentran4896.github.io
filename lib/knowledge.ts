import { facts, works, type Fact } from "@/lib/content"
import { getAllArticles } from "@/lib/articles"

/** Everything the on-site Ask can answer from. Runs at build time. */
export function getKnowledge(): Fact[] {
  const projects: Fact[] = works.projects.map((p) => ({
    id: `work-${p.title.toLowerCase().replace(/\W+/g, "-")}`,
    title: p.title,
    keywords: `${p.tags.join(" ")} ${p.stack} project work built portfolio`,
    answer: `${p.title} (${p.year}): ${p.summary} Stack: ${p.stack}.${p.achievement ? ` ${p.achievement}.` : ""}`,
    href: "/#work",
    source: "Selected work",
  }))

  const articles: Fact[] = getAllArticles()
    .filter((a) => !a.draft)
    .map((a) => ({
      id: `post-${a.slug}`,
      title: a.title,
      keywords: `${a.tags.join(" ")} writing blog essay article post note read`,
      answer: `In the essay “${a.title}”: ${a.excerpt}`,
      href: `/blog/${a.slug}/`,
      source: "Writing",
    }))

  return [...facts, ...projects, ...articles]
}
