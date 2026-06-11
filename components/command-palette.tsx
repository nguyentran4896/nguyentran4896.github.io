"use client"

// copy — consolidate into lib/content.ts — a later integration agent migrates it
const copy = {
  placeholder: "TYPE A COMMAND OR SEARCH…",
  groupNavigate: "NAVIGATE",
  groupPages: "PAGES",
  groupActions: "ACTIONS",
  groupSocial: "SOCIAL",
  emptyLabel: "NO RESULTS",
  emailCopied: "EMAIL COPIED",
  triggerLabel: "OPEN",
  triggerShortcut: "⌘K",
  ariaLabel: "Command palette",
}

import {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react"
import { Command } from "cmdk"
import { useRouter, usePathname } from "next/navigation"
import { footer } from "@/lib/content"
import { toggleTerminal } from "@/lib/terminal-bus"

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
  const [query, setQuery] = useState("")
  const [emailCopied, setEmailCopied] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const prefersReduced = useRef(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      prefersReduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    }
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    setQuery("")
    setEmailCopied(false)
  }, [])

  // Keyboard shortcut — Cmd+K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") {
        close()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [close])

  // External event bus (navbar trigger button fires this)
  useEffect(() => {
    const handler = () => setOpen((prev) => !prev)
    window.addEventListener(PALETTE_EVENT, handler)
    return () => window.removeEventListener(PALETTE_EVENT, handler)
  }, [])

  // Navigate-group items need router awareness for cross-page links
  const handleSelect = useCallback(
    (action: PaletteAction) => {
      const onHome = pathname === "/"

      // Section jumps: if not on home, navigate to / + hash
      if (action.group === "navigate" && action.id !== "nav-hero" && !onHome) {
        const sectionId = action.id.replace("nav-", "")
        close()
        router.push(`/#${sectionId}`)
        return
      }

      // Email copy: show feedback before closing
      if (action.id === "action-copy-email") {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(footer.email).catch(() => {})
        }
        setEmailCopied(true)
        window.setTimeout(() => {
          setEmailCopied(false)
          close()
        }, 900)
        return
      }

      action.onSelect(close)
    },
    [close, pathname, router],
  )

  const groupLabels: Record<PaletteAction["group"], string> = {
    navigate: copy.groupNavigate,
    pages: copy.groupPages,
    actions: copy.groupActions,
    social: copy.groupSocial,
  }

  const groups = (["navigate", "pages", "actions", "social"] as const).map((g) => ({
    key: g,
    label: groupLabels[g],
    items: paletteActions.filter((a) => a.group === g),
  }))

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.ariaLabel}
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        animation: prefersReduced.current ? "none" : undefined,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      {/* Dialog */}
      <div
        style={{
          animation: prefersReduced.current
            ? "none"
            : "cmdPaletteIn 150ms ease-out forwards",
        }}
        className="w-full max-w-[560px] mx-4 border border-white/10 rounded-[10px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          label={copy.ariaLabel}
          className="bg-[#1A1A1A] text-foreground"
          shouldFilter={true}
          loop
        >
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            <span className="font-mono text-xs text-muted-foreground" aria-hidden>
              /
            </span>
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder={copy.placeholder}
              className="flex-1 bg-transparent font-mono text-xs tracking-[0.2em] text-foreground placeholder:text-muted-foreground outline-none"
              autoFocus
            />
            <kbd className="font-mono text-[10px] tracking-wider text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* List */}
          <Command.List
            className="max-h-[360px] overflow-y-auto py-2"
            aria-label="Commands"
          >
            <Command.Empty className="px-4 py-6 font-mono text-xs tracking-[0.2em] text-muted-foreground text-center">
              {copy.emptyLabel}
            </Command.Empty>

            {groups.map(({ key, label, items }) => (
              <Command.Group
                key={key}
                heading={label}
                className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:tracking-[0.3em] [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {items.map((action) => (
                  <Command.Item
                    key={action.id}
                    value={`${label} ${action.label}`}
                    onSelect={() => handleSelect(action)}
                    className="group relative flex items-center justify-between px-4 py-2.5 cursor-pointer font-mono text-xs tracking-[0.2em] text-muted-foreground transition-colors duration-100 data-[selected=true]:text-foreground data-[selected=true]:bg-white/[0.04] outline-none"
                  >
                    {/* 2px left accent bar on active row */}
                    <span
                      aria-hidden
                      className="absolute left-0 top-1 bottom-1 w-0.5 bg-accent opacity-0 group-data-[selected=true]:opacity-100 rounded-full transition-opacity duration-100"
                    />
                    <span className="pl-2">
                      {action.id === "action-copy-email" && emailCopied
                        ? copy.emailCopied
                        : action.label}
                    </span>
                    {action.shortcut && (
                      <kbd className="font-mono text-[10px] tracking-wider text-muted-foreground opacity-0 group-data-[selected=true]:opacity-100 transition-opacity duration-100">
                        {action.shortcut}
                      </kbd>
                    )}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-white/10 flex items-center gap-4">
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
              ↑↓ NAVIGATE · ENTER SELECT · ESC CLOSE
            </span>
          </div>
        </Command>
      </div>

      {/* Keyframe injected inline — avoids globals.css ownership */}
      <style>{`
        @keyframes cmdPaletteIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
