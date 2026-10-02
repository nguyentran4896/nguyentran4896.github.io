import Image from "next/image"
import { about, stats } from "@/lib/content"
import { Section } from "@/components/section"

export function About() {
  return (
    <Section id="about" eyebrow={about.eyebrow} title={about.title}>
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <div className="reveal space-y-6 text-lg leading-relaxed text-foreground/85 sm:text-xl">
          {about.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <dl className="mt-10 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-border pt-8 text-base sm:grid-cols-2">
            {about.facts.map((f) => (
              <div key={f.label}>
                <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{f.label}</dt>
                <dd className="mt-1">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="reveal">
          <Image
            src="/avatar-thailand.jpeg"
            alt="Portrait of Nguyen Tran"
            width={512}
            height={511}
            className="aspect-square w-full rounded-tile object-cover"
          />
        </div>
      </div>

      <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-tile border border-border bg-border lg:grid-cols-4">
        {stats.items.map((s) => (
          <div key={s.label} className="bg-background p-6 sm:p-8">
            <dd className="font-display text-5xl sm:text-6xl">{s.value}</dd>
            <dt className="mt-2 text-sm text-muted-foreground">{s.label}</dt>
          </div>
        ))}
      </dl>
    </Section>
  )
}
