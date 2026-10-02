import { hero, nav } from "@/lib/content"
import { AskBox } from "@/components/ask-box"

export function Hero() {
  return (
    <section id="ask" className="relative px-5 pb-16 pt-32 sm:px-8 sm:pb-24 sm:pt-44">
      <div className="mx-auto max-w-3xl text-center">
        <p
          className="rise mx-auto mb-8 inline-flex items-center gap-2.5 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground"
          style={{ "--d": "0ms" } as React.CSSProperties}
        >
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          {nav.status}
        </p>

        <h1
          className="rise font-display text-6xl leading-[0.98] tracking-tight sm:text-8xl"
          style={{ "--d": "80ms" } as React.CSSProperties}
        >
          {hero.greeting}
        </h1>
        <p
          className="rise mx-auto mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl"
          style={{ "--d": "160ms" } as React.CSSProperties}
        >
          {hero.lead}
        </p>

        <div className="rise mt-10 text-left" style={{ "--d": "260ms" } as React.CSSProperties}>
          <AskBox />
        </div>

        <p className="rise mt-6 text-xs text-muted-foreground" style={{ "--d": "340ms" } as React.CSSProperties}>
          {hero.note}
        </p>
      </div>
    </section>
  )
}
