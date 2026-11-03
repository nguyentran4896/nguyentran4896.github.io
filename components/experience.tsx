import { experience } from "@/lib/content"
import { Section } from "@/components/section"

export function Experience() {
  return (
    <Section id="experience" eyebrow={experience.eyebrow} title={experience.title} className="border-t border-border">
      <ol>
        {experience.roles.map((r) => (
          <li key={r.company} className="reveal border-b border-border py-10 first:pt-0 sm:py-14 sm:first:pt-0">
            <div className="grid gap-6 lg:grid-cols-[14rem_1fr] lg:gap-16">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{r.period}</p>
                <p className="mt-2 text-sm text-muted-foreground">{r.location}</p>
              </div>
              <div>
                <h3 className="font-display text-3xl leading-tight sm:text-4xl">{r.role}</h3>
                <p className="mt-1 text-lg text-accent-text">{r.company}</p>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/85">{r.summary}</p>
                <ul className="mt-5 max-w-2xl list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-accent">
                  {r.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <ul className="mt-6 flex flex-wrap gap-2" aria-label="Stack">
                  {r.stack.map((s) => (
                    <li key={s} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="reveal mt-10 grid gap-2 sm:grid-cols-[14rem_1fr] sm:gap-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {experience.education.period}
        </p>
        <p className="text-base">
          <span className="font-display text-2xl">{experience.education.degree}</span>
          <br />
          <span className="text-muted-foreground">
            {experience.education.school} · {experience.education.note}
          </span>
        </p>
      </div>
    </Section>
  )
}
