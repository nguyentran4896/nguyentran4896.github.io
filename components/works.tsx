import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { works } from "@/lib/content"
import { Section } from "@/components/section"

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
              className="group block overflow-hidden rounded-tile border border-border bg-card transition duration-300 hover:border-foreground"
            >
              <Image
                src={p.image}
                alt={`${p.title} project cover`}
                width={1240}
                height={819}
                className="aspect-[3/2] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{p.year}</p>
                  <ArrowUpRight className="size-5 text-muted-foreground transition group-hover:text-foreground" aria-hidden />
                </div>
                <h3 className="mt-3 font-display text-3xl sm:text-4xl">{p.title}</h3>
                {p.achievement && (
                  <p className="mt-2 inline-block rounded-full bg-tint-blush px-3 py-1 text-xs">{p.achievement}</p>
                )}
                <p className="mt-4 text-base leading-relaxed text-foreground/85">{p.summary}</p>
                <p className="mt-4 font-mono text-xs text-muted-foreground">{p.stack}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  )
}
