import Image from "next/image"
import { ArrowUpRight, Award } from "lucide-react"
import { works } from "@/lib/content"
import { Section } from "@/components/section"

const ROWS = [
  ["Problem", "problem"],
  ["What I built", "built"],
  ["Result", "result"],
] as const

export function Works() {
  return (
    <Section id="work" eyebrow={works.eyebrow} title={works.title} className="border-t border-border">
      <ul className="grid gap-6 lg:grid-cols-2">
        {works.projects.map((p) => (
          <li key={p.title} className="reveal">
            <a
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col overflow-hidden rounded-tile border border-border bg-card transition duration-300 hover:border-foreground"
            >
              <Image
                src={p.image}
                alt={`${p.title} project cover`}
                width={1240}
                height={819}
                className="aspect-[2/1] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{p.year}</p>
                  <ArrowUpRight className="size-5 text-muted-foreground transition group-hover:text-foreground" aria-hidden />
                </div>
                <h3 className="mt-2 font-display text-3xl">{p.title}</h3>
                {p.achievement && (
                  <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-tint-blush px-3 py-1 text-sm">
                    <Award className="size-4" strokeWidth={1.5} aria-hidden />
                    {p.achievement}
                  </p>
                )}
                <dl className="mt-5 space-y-3 text-base leading-relaxed">
                  {ROWS.map(([label, key]) => (
                    <div key={key}>
                      <dt className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
                      <dd className="mt-0.5 text-foreground/85">{p[key]}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-auto pt-5 font-mono text-xs text-muted-foreground">{p.stack}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  )
}
