import { Award } from "lucide-react"
import { recognition, tech } from "@/lib/content"
import { Section } from "@/components/section"

export function Recognition() {
  const r = recognition
  return (
    <Section id="recognition" eyebrow={r.eyebrow} title={r.title} className="border-t border-border">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <article className="reveal rounded-tile bg-tint-blush p-7 sm:p-10">
          <Award className="size-10" strokeWidth={1.25} aria-hidden />
          <p className="mt-6 font-display text-5xl sm:text-6xl">{r.award.place}</p>
          <p className="mt-3 text-lg">{r.award.event}</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{r.award.date}</p>
          <p className="mt-6 max-w-xl border-l-2 border-accent pl-4 text-base italic leading-relaxed">{r.award.paper}</p>
          <p className="mt-4 text-sm text-muted-foreground">{r.award.follow}</p>
        </article>

        <div className="reveal flex flex-col gap-6">
          <div className="rounded-tile border border-border p-7">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Research interests</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {r.interests.map((i) => (
                <li key={i} className="rounded-full bg-muted px-3.5 py-1.5 text-sm">
                  {i}
                </li>
              ))}
            </ul>
            <h3 className="mt-7 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Languages</h3>
            <ul className="mt-3 space-y-1 text-sm">
              {r.languages.map((l) => (
                <li key={l.name}>
                  <span className="font-medium">{l.name}</span>
                  <span className="text-muted-foreground"> · {l.level}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <figure className="reveal mx-auto mt-20 max-w-3xl text-center">
        <blockquote className="text-balance font-display text-3xl leading-snug sm:text-4xl">“{r.quote}”</blockquote>
      </figure>

      <div className="reveal mt-20">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{tech.eyebrow}</h3>
        <ul className="mt-4 flex flex-wrap gap-2">
          {tech.items.map((t) => (
            <li key={t} className="rounded-full border border-border px-4 py-2 text-sm">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
