import { ArrowUpRight } from "lucide-react"
import { footer } from "@/lib/content"

export function Footer() {
  return (
    <footer id="contact" data-swarm className="relative border-t border-border px-5 pb-24 pt-16 sm:px-8 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <p data-swt="eyebrow" className="font-mono text-xs uppercase tracking-[0.18em] text-accent-text">{footer.eyebrow}</p>
        <h2 className="mt-4 max-w-4xl text-balance font-display text-4xl leading-[1.05] sm:text-6xl">{footer.heading}</h2>
        <p data-swt="text" className="mt-6 max-w-xl text-lg text-muted-foreground">{footer.lead}</p>

        <a
          href={`mailto:${footer.email}`}
          data-swt="cta"
          className="mt-10 inline-flex items-center gap-3 rounded-full bg-accent-text px-7 py-4 text-base font-medium text-accent-foreground transition hover:brightness-95 sm:text-lg"
        >
          {footer.email} <ArrowUpRight className="size-5" aria-hidden />
        </a>

        <div data-swarm-rule className="mt-14 flex flex-col gap-6 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p data-swt="text">
            © {new Date().getFullYear()} Nguyen Tran · {footer.location}
          </p>
          <ul className="flex gap-6">
            {footer.socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-swt="text"
                  className="transition hover:text-foreground"
                >
                  {s.label}
                </a>
              </li>
            ))}
            <li>
              <a href="/feed.xml" data-swt="text" className="transition hover:text-foreground">
                RSS
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
