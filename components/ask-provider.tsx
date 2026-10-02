"use client"

import { usePathname } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowUp, X } from "lucide-react"
import { buildIndex, type Index } from "@/lib/ask"
import type { Fact } from "@/lib/content"
import { ask as askCopy } from "@/lib/content"
import { AskBox } from "@/components/ask-box"
import { AskContext } from "@/components/ask-context"

/**
 * Owns the retrieval index and the global "Ask" dialog. Opens from the floating
 * dock, from any `open()` call, and from Cmd/Ctrl+K or "/".
 */
export function AskProvider({ knowledge, children }: { knowledge: Fact[]; children: React.ReactNode }) {
  const index = useMemo(() => buildIndex(knowledge), [knowledge])
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [seed, setSeed] = useState<{ q: string; n: number }>({ q: "", n: 0 })
  const onHome = usePathname() === "/"
  const [heroGone, setHeroGone] = useState(false)
  const dock = !onHome || heroGone

  const open = useCallback((query?: string) => {
    setSeed((s) => ({ q: query ?? "", n: s.n + 1 }))
    setIsOpen(true)
  }, [])

  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    if (isOpen && !d.open) {
      d.showModal()
      // showModal() focuses the first control (Close); move focus to the prompt.
      d.querySelector<HTMLInputElement>("input")?.focus()
    }
    if (!isOpen && d.open) d.close()
  }, [isOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      const typing = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault()
        open()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  // On the home page the dock appears once the hero prompt scrolls out of view.
  useEffect(() => {
    const hero = document.getElementById("ask")
    if (!hero) return
    const io = new IntersectionObserver(([e]) => setHeroGone(!e.isIntersecting), { threshold: 0 })
    io.observe(hero)
    return () => io.disconnect()
  }, [onHome])

  const value = useMemo(() => ({ index, open }), [index, open])

  return (
    <AskContext.Provider value={value}>
      {children}

      <button
        type="button"
        onClick={() => open()}
        aria-label="Ask about Nguyen"
        tabIndex={dock ? 0 : -1}
        className={`fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border-strong bg-card/90 py-2.5 pl-5 pr-2.5 text-sm text-muted-foreground backdrop-blur-md transition duration-300 hover:text-foreground ${
          dock ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        <span>Ask anything about Nguyen</span>
        <kbd className="hidden rounded-md border border-border px-1.5 py-0.5 font-mono text-[11px] sm:inline">⌘K</kbd>
        <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background">
          <ArrowUp className="size-4" aria-hidden />
        </span>
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setIsOpen(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setIsOpen(false)
        }}
        aria-label={askCopy.title}
        className="m-auto w-[min(42rem,calc(100vw-1.5rem))] max-h-[85dvh] overflow-y-auto rounded-[1.75rem] border border-border-strong bg-background p-5 text-foreground backdrop:bg-foreground/40 backdrop:backdrop-blur-sm sm:p-7"
      >
        {isOpen && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{askCopy.title}</p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <AskBox key={seed.n} initialQuery={seed.q} autoFocus onNavigate={() => setIsOpen(false)} />
          </>
        )}
      </dialog>
    </AskContext.Provider>
  )
}
