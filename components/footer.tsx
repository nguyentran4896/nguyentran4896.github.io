import { ArrowUpRight } from "lucide-react"
import { footer } from "@/lib/content"

export function Footer() {
  return (
    <footer id="contact" className="border-t border-border px-5 pb-28 pt-20 sm:px-8 sm:pt-28">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-text">{footer.eyebrow}</p>
        <h2 className="mt-4 max-w-4xl text-balance font-display text-5xl leading-[1.02] sm:text-8xl">{footer.heading}</h2>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">{footer.lead}</p>

        <a
          href={`mailto:${footer.email}`}
          className="mt-10 inline-flex items-center gap-3 rounded-full bg-accent px-7 py-4 text-base font-medium text-accent-foreground transition hover:brightness-95 sm:text-lg"
        >
          {footer.email} <ArrowUpRight className="size-5" aria-hidden />
        </a>

        <div className="mt-20 flex flex-col gap-6 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Nguyen Tran · {footer.location}
          </p>
          <ul className="flex gap-6">
            {footer.socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-foreground"
                >
                  {s.label}
                </a>
              </li>
            ))}
            <li>
              <a href="/feed.xml" className="transition hover:text-foreground">
                RSS
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
