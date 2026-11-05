import { experience, tech } from "@/lib/content"
import { Section } from "@/components/section"

export function Experience() {
  return (
    <Section id="experience" eyebrow={experience.eyebrow} title={experience.title} className="border-t border-border">
      <ol data-swarm-list className="border-t border-border">
        {experience.roles.map((r) => (
          <li key={r.company} className="reveal border-b border-border py-7 sm:py-8">
            <div className="grid gap-2 md:grid-cols-[11rem_1fr] md:gap-12">
              <p data-swt="period" className="pt-1 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{r.period}</p>
              <div>
                <h3 className="font-display text-2xl leading-tight sm:text-3xl">
                  {r.role} <span className="text-accent-text">· {r.company}</span>
                </h3>
                <p data-swt="text" className="mt-2 max-w-2xl text-base leading-relaxed text-foreground/85">{r.summary}</p>
                {r.bullets && (
                  <ul className="mt-3 max-w-2xl list-disc space-y-1.5 pl-5 text-base leading-relaxed text-muted-foreground marker:text-accent">
                    {r.bullets.map((b) => (
                      <li key={b} data-swt="text">{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="reveal mt-8 grid gap-2 md:grid-cols-[11rem_1fr] md:gap-12">
        <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{tech.eyebrow}</h3>
        <p data-swt="text" data-swarm-tools className="text-base text-muted-foreground">{tech.items.join(" · ")}</p>
      </div>
    </Section>
  )
}
