"use client"

import { useEffect, useRef, useState } from "react"
import { useChat } from "@/hooks/use-chat"

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const { messages, pending, error, send } = useChat()
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!open) return
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, pending, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft
    setDraft("")
    await send(text)
  }

  if (!process.env.NEXT_PUBLIC_CHAT_ENDPOINT) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="chat-drawer"
        className="fixed bottom-5 right-5 z-[9000] inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-accent hover:border-accent transition-colors"
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
        {open ? "Close" : "Ask about Nguyen"}
      </button>

      {open && (
        <div
          id="chat-drawer"
          role="dialog"
          aria-label="Chat about Nguyen Tran"
          className="fixed bottom-0 right-0 z-[9001] flex h-[90vh] max-h-[640px] w-full max-w-[400px] flex-col border-l border-t border-border bg-background sm:bottom-5 sm:right-5 sm:h-[600px] sm:rounded-2xl sm:border"
        >
          <header className="flex items-start justify-between border-b border-border px-5 pt-5 pb-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                00 — Chat
              </p>
              <h2 className="mt-1 font-sans text-2xl font-light italic leading-tight tracking-tight">
                Ask about Nguyen.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors"
            >
              ×
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.length === 0 && (
              <p className="text-sm text-foreground/60 leading-relaxed">
                Ask me about Nguyen&rsquo;s experience, research, or projects. Anything you&rsquo;d like to know before reaching out.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm border border-border bg-foreground/[0.04] px-3.5 py-2.5 text-sm leading-relaxed"
                    : "max-w-[90%] text-sm leading-relaxed text-foreground/85"
                }
              >
                {m.content}
              </div>
            ))}
            {pending && (
              <div className="max-w-[90%] text-sm leading-relaxed text-foreground/50">
                <span className="inline-block animate-pulse">▌</span>
              </div>
            )}
            {error && (
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-accent">
                {error}
              </p>
            )}
          </div>

          <form
            onSubmit={onSubmit}
            className="flex items-end gap-2 border-t border-border px-5 py-4"
          >
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  void onSubmit(e as unknown as React.FormEvent)
                }
              }}
              rows={1}
              maxLength={1000}
              placeholder="Type a question…"
              disabled={pending}
              className="flex-1 resize-none bg-transparent font-mono text-xs tracking-wide text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={pending || !draft.trim()}
              className="rounded-full border border-border px-3 py-1.5 font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-accent hover:border-accent transition-colors disabled:opacity-40 disabled:hover:text-muted-foreground disabled:hover:border-border"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  )
}
