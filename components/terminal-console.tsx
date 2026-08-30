"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { TERMINAL_EVENT } from "@/lib/terminal-bus"
// Types are erased at build time (import type), so they don't pull the command
// engine into the bundle. The engine itself (runCommand / COMMAND_NAMES) is
// dynamically imported on first use, keeping it out of the initial bundle.
import type { CommandResult, TerminalLine } from "@/lib/terminal"

const BANNER: TerminalLine[] = [
  { kind: "head", text: "Nguyen Tran — interactive console" },
  { kind: "muted", text: "type 'help' for commands · 'open works' to navigate · Esc to close" },
  { kind: "output", text: "" },
]

// Accent (hue) is deliberately absent here — hierarchy comes from brightness
// (DESIGN.md). The single accent lives only on the live prompt + caret below.
const LINE_CLASS: Record<TerminalLine["kind"], string> = {
  input: "text-foreground",
  output: "text-foreground/80",
  muted: "text-muted-foreground",
  head: "text-foreground",
  error: "text-muted-foreground",
}

function Line({ line }: { line: TerminalLine }) {
  if (line.kind === "input") {
    return (
      <div className="whitespace-pre-wrap break-words text-foreground">
        <span className="text-muted-foreground">~ $ </span>
        {line.text}
      </div>
    )
  }
  return (
    <div className={`whitespace-pre-wrap break-words ${LINE_CLASS[line.kind]}`}>
      {line.text || " "}
    </div>
  )
}

export function TerminalConsole() {
  const router = useRouter()
  const pathname = usePathname()

  const [open, setOpen] = useState(false)
  const [output, setOutput] = useState<TerminalLine[]>([])
  const [value, setValue] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const lastFocusedRef = useRef<HTMLElement | null>(null)

  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) lastFocusedRef.current = document.activeElement as HTMLElement | null
      return !prev
    })
  }, [])

  // Global open triggers: Ctrl+` shortcut and the cross-component event bus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "`" || e.code === "Backquote")) {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener(TERMINAL_EVENT, toggle)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener(TERMINAL_EVENT, toggle)
    }
  }, [toggle])

  // Focus management: greet + focus input on open, restore focus on close.
  useEffect(() => {
    if (open) {
      setOutput((prev) => (prev.length ? prev : BANNER))
      const id = requestAnimationFrame(() => inputRef.current?.focus())
      return () => cancelAnimationFrame(id)
    }
    lastFocusedRef.current?.focus?.()
  }, [open])

  // Keep the latest output in view.
  useEffect(() => {
    if (open && outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output, open])

  const navigate = useCallback(
    (id: string) => {
      setOpen(false)
      if (id === "blog") {
        router.push("/blog")
        return
      }
      if (pathname === "/") {
        requestAnimationFrame(() =>
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
        )
      } else {
        router.push(`/#${id}`)
      }
    },
    [router, pathname],
  )

  /** Drain an async stream from a command, appending each batch to output. */
  const drainStream = useCallback(
    async (gen: CommandResult["stream"]) => {
      if (!gen) return
      for await (const batch of gen) {
        setOutput((prev) => [...prev, ...batch])
      }
    },
    [],
  )

  const submit = useCallback(async () => {
    const raw = value
    // Clear the input immediately so it feels snappy while the engine chunk
    // (dynamically imported on first command) loads.
    setValue("")
    setHistoryIndex(null)
    if (raw.trim()) setHistory((h) => [...h, raw])
    const { runCommand } = await import("@/lib/terminal")
    const result = runCommand(raw, history)
    setOutput((prev) => {
      if (result.clear) return []
      return [...prev, { kind: "input", text: raw }, ...result.lines]
    })
    if (result.navigate) navigate(result.navigate)
    if (result.stream) drainStream(result.stream)
  }, [value, history, navigate, drainStream])

  const onKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      submit()
      return
    }
    if (e.key === "Escape") {
      e.preventDefault()
      setOpen(false)
      return
    }
    if (e.key === "ArrowUp") {
      if (history.length === 0) return
      e.preventDefault()
      const idx = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(idx)
      setValue(history[idx])
      return
    }
    if (e.key === "ArrowDown") {
      if (historyIndex === null) return
      e.preventDefault()
      const idx = historyIndex + 1
      if (idx >= history.length) {
        setHistoryIndex(null)
        setValue("")
      } else {
        setHistoryIndex(idx)
        setValue(history[idx])
      }
      return
    }
    if (e.key === "Tab") {
      e.preventDefault()
      const frag = value.trim().toLowerCase()
      if (!frag) return
      const { COMMAND_NAMES } = await import("@/lib/terminal")
      const matches = COMMAND_NAMES.filter((n) => n.startsWith(frag))
      if (matches.length === 1) {
        setValue(matches[0])
      } else if (matches.length > 1) {
        setOutput((prev) => [
          ...prev,
          { kind: "input", text: value },
          { kind: "muted", text: matches.join("  ") },
        ])
      }
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Interactive console"
      aria-hidden={!open}
      inert={!open}
      onMouseDown={() => inputRef.current?.focus()}
      className={`fixed inset-x-0 bottom-0 z-[9990] flex h-[55vh] max-h-[460px] flex-col border-t border-border bg-background font-mono transition-transform duration-300 ease-out sm:h-[44vh] ${
        open ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          ›_ console
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setOpen(false)
          }}
          aria-label="Close console"
          data-cursor-hover
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-accent"
        >
          ×
        </button>
      </div>

      <div ref={outputRef} className="flex-1 overflow-y-auto px-4 py-3 text-[13px] leading-relaxed">
        {output.map((line, i) => (
          <Line key={i} line={line} />
        ))}
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-accent">~ $</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            aria-label="Console input"
            placeholder="type 'help'"
            className="flex-1 bg-transparent text-foreground caret-accent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  )
}
