import { ArrowRight, Mail } from "lucide-react"
import { footer, hero, nav, proof } from "@/lib/content"
import { AskBox } from "@/components/ask-box"
import { HeroSphere } from "@/components/hero-sphere"

export function Hero() {
  return (
    <section id="ask" data-swarm="hero" className="relative isolate px-5 pb-14 pt-28 sm:px-8 sm:pb-20 sm:pt-40">
      <HeroSphere />
      <div className="mx-auto max-w-3xl text-center">
        <p
          className="rise mx-auto mb-6 inline-flex items-center gap-2.5 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground"
          style={{ "--d": "0ms" } as React.CSSProperties}
        >
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          <span data-sw-hold data-swt="status">{nav.status}</span>
        </p>

        <h1
          className="rise text-balance font-display text-5xl leading-[0.98] tracking-tight sm:text-8xl"
          style={{ "--d": "80ms" } as React.CSSProperties}
        >
          {hero.greeting}
        </h1>
        <p
          data-swarm-box
          className="rise mx-auto mt-5 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl"
          style={{ "--d": "160ms" } as React.CSSProperties}
        >
          {hero.lead}
        </p>

        <div
          className="rise mt-7 flex flex-wrap items-center justify-center gap-3"
          style={{ "--d": "200ms" } as React.CSSProperties}
        >
          <a
            href={`mailto:${footer.email}`}
            data-sw-hold
            data-swt="cta"
            className="inline-flex items-center gap-2 rounded-full bg-accent-text px-6 py-3 text-base font-medium text-accent-foreground transition hover:brightness-95"
          >
            <Mail className="size-4" aria-hidden /> {hero.cta}
          </a>
          <a
            href="#work"
            data-sw-hold
            data-swt="cta"
            className="inline-flex items-center gap-2 rounded-full border border-border-strong px-6 py-3 text-base transition hover:bg-foreground hover:text-background"
          >
            {hero.secondary} <ArrowRight className="size-4" aria-hidden />
          </a>
        </div>

        <div className="rise mt-10 text-left" style={{ "--d": "260ms" } as React.CSSProperties}>
          <div data-swarm-box>
            <AskBox />
          </div>
        </div>

        <p className="rise mt-4 text-sm text-muted-foreground" style={{ "--d": "340ms" } as React.CSSProperties}>
          <span data-sw-hold data-swt="note">{hero.note}</span>
        </p>
      </div>

      <div className="mx-auto mt-14 max-w-6xl sm:mt-20">
        <h2 className="sr-only">{proof.label}</h2>
        <ul className="rise grid gap-px overflow-hidden rounded-tile border border-border bg-border sm:grid-cols-3">
          {proof.items.map((p) => (
            <li key={p.value} className="bg-background px-6 py-5 text-center sm:py-6">
              <p className="font-display text-3xl sm:text-4xl">{p.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
