"use client"

import { useEffect, useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { footer } from "@/lib/content"
import { toggleTerminal } from "@/lib/terminal-bus"

// The cmdk-powered dialog body is code-split into its own module and loaded on
// first open, so `cmdk` stays out of the initial bundle. This shell owns only
// the open state, the keyboard shortcut and the event bus — all cmdk-free — so
// importing `openPalette` (e.g. from the navbar) doesn't pull cmdk in either.
const CommandPaletteDialog = dynamic(() => import("@/components/command-palette-dialog"), {
  ssr: false,
})

// ─── Action registry ───────────────────────────────────────────────────────
// Exported so a phase-2 agent can append a SEMANTIC group by importing this
// array and pushing/spreading new entries before the component is rendered.

export type PaletteAction = {
  id: string
  group: "navigate" | "pages" | "actions" | "social"
  label: string
  shortcut?: string
  /** Called when the item is selected. Receives a close callback. */
  onSelect: (close: () => void) => void
}

export const paletteActions: PaletteAction[] = [
  // NAVIGATE — section jumps (same smooth-scroll approach as navbar)
  {
    id: "nav-hero",
    group: "navigate",
    label: "HERO",
    onSelect: (close) => {
      close()
      window.scrollTo({ top: 0, behavior: "smooth" })
    },
  },
  {
    id: "nav-about",
    group: "navigate",
    label: "ABOUT",
    onSelect: (close) => {
      close()
      document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" })
    },
  },
  {
    id: "nav-experience",
    group: "navigate",
    label: "EXPERIENCE",
    onSelect: (close) => {
      close()
      document.querySelector("#experience")?.scrollIntoView({ behavior: "smooth" })
    },
  },
  {
    id: "nav-stats",
    group: "navigate",
    label: "STATS",
    onSelect: (close) => {
      close()
      document.querySelector("#stats")?.scrollIntoView({ behavior: "smooth" })
    },
  },
  {
    id: "nav-works",
    group: "navigate",
    label: "WORKS",
    onSelect: (close) => {
      close()
      document.querySelector("#works")?.scrollIntoView({ behavior: "smooth" })
    },
  },
  {
    id: "nav-recognition",
    group: "navigate",
    label: "RECOGNITION",
    onSelect: (close) => {
      close()
      document.querySelector("#recognition")?.scrollIntoView({ behavior: "smooth" })
    },
  },
  {
    id: "nav-contact",
    group: "navigate",
    label: "CONTACT",
    onSelect: (close) => {
      close()
      document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })
    },
  },

  // PAGES — static list; add new blog posts as one-line entries here
  {
    id: "page-blog",
    group: "pages",
    label: "BLOG",
    onSelect: (close) => {
      close()
      window.location.href = "/blog"
    },
  },
  {
    id: "page-tokenizer",
    group: "pages",
    label: "TOKENIZER",
    onSelect: (close) => {
      close()
      window.location.href = "/tokens"
    },
  },
  {
    id: "page-post-quiet-interfaces",
    group: "pages",
    label: "POST — QUIET INTERFACES",
    onSelect: (close) => {
      close()
      window.location.href = "/blog/quiet-interfaces"
    },
  },
  {
    id: "page-post-ai-brainrot",
    group: "pages",
    label: "POST — AI BRAINROT",
    onSelect: (close) => {
      close()
      window.location.href = "/blog/ai-brainrot"
    },
  },

  // ACTIONS
  {
    id: "action-copy-email",
    group: "actions",
    label: "COPY EMAIL",
    shortcut: "⌘E",
    onSelect: (close) => {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(footer.email).catch(() => {})
      }
      close()
    },
  },
  {
    id: "action-open-terminal",
    group: "actions",
    label: "OPEN CONSOLE",
    shortcut: "⌘`",
    onSelect: (close) => {
      close()
      toggleTerminal()
    },
  },

  // SOCIAL — hrefs from lib/content.ts footer.socials
  ...footer.socials
    .filter((s) => !s.href.startsWith("mailto:"))
    .map((s) => ({
      id: `social-${s.label.toLowerCase()}`,
      group: "social" as const,
      label: s.label.toUpperCase(),
      onSelect: (close: () => void) => {
        close()
        window.open(s.href, "_blank", "noopener noreferrer")
      },
    })),
]

// ─── Event bus ─────────────────────────────────────────────────────────────

export const PALETTE_EVENT = "portfolio:command-palette-open"

export function openPalette() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(PALETTE_EVENT))
}

// ─── Component ─────────────────────────────────────────────────────────────

export function CommandPalette() {
  const [open, setOpen] = useState(false)

  const close = useCallback(() => setOpen(false), [])

  // Keyboard shortcut — Cmd+K / Ctrl+K (toggle) and Escape (close).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  // External event bus (navbar trigger button fires this)
  useEffect(() => {
    const handler = () => setOpen((prev) => !prev)
    window.addEventListener(PALETTE_EVENT, handler)
    return () => window.removeEventListener(PALETTE_EVENT, handler)
  }, [])

  // The heavy cmdk dialog is only loaded/rendered once the palette is opened.
  if (!open) return null

  return <CommandPaletteDialog onClose={close} />
}
