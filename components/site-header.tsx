"use client"

import { useEffect, useState } from "react"
import { Link } from "next-view-transitions"
import { Menu, Search, X } from "lucide-react"
import { nav } from "@/lib/content"
import { useAsk } from "@/components/ask-context"

export function SiteHeader() {
  const { open } = useAsk()
  const [menu, setMenu] = useState(false)
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const on = () => setStuck(window.scrollY > 8)
    on()
    window.addEventListener("scroll", on, { passive: true })
    return () => window.removeEventListener("scroll", on)
  }, [])

  useEffect(() => {
    if (!menu) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false)
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [menu])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        stuck || menu ? "border-b border-border bg-background/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-[15px] font-medium tracking-tight">
          <span aria-hidden className="flex size-8 items-center justify-center rounded-full bg-foreground font-display text-lg italic leading-none text-background">
            N
          </span>
          {nav.brand}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {nav.links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => open()}
            className="hidden items-center gap-2 rounded-full border border-border-strong px-4 py-2 text-sm transition hover:bg-foreground hover:text-background sm:flex"
          >
            <Search className="size-4" aria-hidden />
            Ask
            <kbd className="font-mono text-[11px] text-muted-foreground">⌘K</kbd>
          </button>
          <button
            type="button"
            onClick={() => open()}
            aria-label="Ask about Nguyen"
            className="flex size-10 items-center justify-center rounded-full border border-border-strong sm:hidden"
          >
            <Search className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            aria-expanded={menu}
            aria-controls="mobile-nav"
            aria-label={menu ? "Close menu" : "Open menu"}
            className="flex size-10 items-center justify-center rounded-full border border-border-strong md:hidden"
          >
            {menu ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          </button>
        </div>
      </div>

      {menu && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-border px-5 pb-6 pt-2 md:hidden">
          {nav.links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenu(false)}
              className="block border-b border-border py-4 font-display text-3xl"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
