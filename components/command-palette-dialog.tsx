"use client"

// The cmdk-powered dialog body for the command palette. Kept in its own module
// so it can be next/dynamic-imported from the lightweight CommandPalette shell —
// this keeps `cmdk` out of the initial bundle (it loads on first open) and out
// of navbar's chunk (which only needs the shell's `openPalette`).

import { useState, useCallback, useEffect } from "react"
import { Command } from "cmdk"
import { useRouter, usePathname } from "next/navigation"
import { footer } from "@/lib/content"
import { paletteActions, type PaletteAction } from "@/components/command-palette"
import { prefersReducedMotion } from "@/lib/media"

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

export default function CommandPaletteDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("")
  const [emailCopied, setEmailCopied] = useState(false)
  const [prefersReduced, setPrefersReduced] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setPrefersReduced(prefersReducedMotion())
  }, [])

  const handleSelect = useCallback(
    (action: PaletteAction) => {
      const onHome = pathname === "/"

      // Section jumps: if not on home, navigate to / + hash
      if (action.group === "navigate" && action.id !== "nav-hero" && !onHome) {
        const sectionId = action.id.replace("nav-", "")
        onClose()
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
          onClose()
        }, 900)
        return
      }

      action.onSelect(onClose)
    },
    [onClose, pathname, router],
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.ariaLabel}
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        animation: prefersReduced ? "none" : undefined,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Dialog */}
      <div
        style={{
          animation: prefersReduced ? "none" : "cmdPaletteIn 150ms ease-out forwards",
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
