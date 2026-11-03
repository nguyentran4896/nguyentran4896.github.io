import { ArrowUpRight, Award, Briefcase, FlaskConical, Github, Mail, PenLine, type LucideIcon } from "lucide-react"
import { quick } from "@/lib/content"

const ICONS: Record<string, LucideIcon> = { Briefcase, FlaskConical, PenLine, Award, Mail, Github }
const TINT: Record<string, string> = {
  sand: "bg-tint-sand",
  sage: "bg-tint-sage",
  sky: "bg-tint-sky",
  blush: "bg-tint-blush",
}

export function QuickAccess() {
  return (
    <section aria-labelledby="quick-title" className="px-5 pb-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 id="quick-title" className="sr-only">
          {quick.eyebrow}
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {quick.tiles.map((t, i) => {
            const Icon = ICONS[t.icon]
            const external = t.href.startsWith("http")
            return (
              <li key={t.label} className="reveal">
                <a
                  href={t.href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`group flex aspect-[4/3] flex-col justify-between rounded-tile p-5 transition duration-300 hover:-translate-y-1 sm:aspect-[16/10] sm:p-7 ${TINT[t.tint]}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <Icon className="size-8 sm:size-10" strokeWidth={1.25} aria-hidden />
                    <ArrowUpRight
                      className="size-5 opacity-40 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                      aria-hidden
                    />
                  </div>
                  <div>
                    <p className="font-display text-2xl leading-tight sm:text-3xl">{t.label}</p>
                    <p className="mt-1 hidden text-sm text-muted-foreground sm:block">{t.blurb}</p>
                  </div>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
