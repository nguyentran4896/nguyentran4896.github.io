"use client"

import { useEffect, useId, useRef, useState } from "react"
import { ArrowUp, ArrowUpRight } from "lucide-react"
import { Link } from "next-view-transitions"
import { MIN_SCORE, search, type Hit } from "@/lib/ask"
import { ask as askCopy, footer, hero } from "@/lib/content"
import { useAsk } from "@/components/ask-context"

type Turn = { q: string; hits: Hit[]; miss: boolean; n?: number }

const WORD_MS = 22

/** Reveals `text` word by word; mount with a fresh `key` per answer. */
function Streamed({ text, onDone }: { text: string; onDone: (done: boolean) => void }) {
  const words = text.split(/(\s+)/)
  const [shown, setShown] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? words.length : 0,
  )
  const done = shown >= words.length

  useEffect(() => {
    onDone(done)
    if (done) return
    const id = window.setInterval(() => setShown((n) => n + 2), WORD_MS)
    return () => window.clearInterval(id)
  }, [done, onDone])

  return <span className={done ? "" : "caret"}>{done ? text : words.slice(0, shown).join("")}</span>
}

function answer(index: Parameters<typeof search>[0], q: string): Turn {
  const hits = search(index, q)
  return { q, hits, miss: hits.length === 0 || hits[0].score < MIN_SCORE }
}

export function AskBox({
  initialQuery = "",
  autoFocus = false,
  size = "lg",
  onNavigate,
}: {
  initialQuery?: string
  autoFocus?: boolean
  size?: "lg" | "md"
  onNavigate?: () => void
}) {
  const { index } = useAsk()
  const [value, setValue] = useState(initialQuery)
  const [turn, setTurn] = useState<Turn | null>(() => (initialQuery.trim() ? answer(index, initialQuery.trim()) : null))
  const [done, setDone] = useState(false)
  const count = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()

  function run(q: string) {
    const query = q.trim()
    if (!query) return
    setValue(query)
    setTurn({ ...answer(index, query), n: ++count.current })
  }

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  const best = turn && !turn.miss ? turn.hits[0].fact : null
  const answerText = best ? best.answer : turn ? askCopy.empty : ""
  const showMeta = !!turn && done
  const chips = turn?.miss || !turn ? (turn ? askCopy.followups : hero.prompts) : []

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          run(value)
        }}
        className={`group flex items-center gap-2 rounded-full border border-border-strong bg-card pl-5 pr-2 transition focus-within:border-foreground ${
          size === "lg" ? "py-2 sm:pl-7" : "py-1.5"
        }`}
      >
        <label htmlFor={inputId} className="sr-only">
          Ask a question about Nguyen&rsquo;s work
        </label>
        <input
          id={inputId}
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={hero.placeholder}
          autoComplete="off"
          enterKeyHint="send"
          className={`min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground ${
            size === "lg" ? "h-12 text-base sm:h-14 sm:text-lg" : "h-11 text-base"
          }`}
        />
        <button
          type="submit"
          aria-label={hero.submit}
          disabled={!value.trim()}
          className={`flex shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition hover:brightness-95 disabled:bg-muted disabled:text-muted-foreground ${
            size === "lg" ? "size-11 sm:size-12" : "size-10"
          }`}
        >
          <ArrowUp className="size-5" aria-hidden />
        </button>
      </form>

      {chips.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Suggested questions">
          {chips.map((p) => (
            <li key={p}>
              <button
                type="button"
                onClick={() => run(p)}
                className="rounded-full border border-border px-4 py-2 text-left text-sm text-muted-foreground transition hover:border-foreground hover:text-foreground"
              >
                {p}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div aria-live="polite" className="mt-6 empty:hidden">
        {turn && (
          <article className="rounded-tile border border-border bg-card p-6 sm:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{turn.q}</p>
            <p className="mt-4 font-display text-2xl leading-snug sm:text-[1.75rem]">
              <Streamed key={turn.n ?? 0} text={answerText} onDone={setDone} />
            </p>

            {showMeta && best && (
              <div className="mt-6 border-t border-border pt-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{askCopy.sources}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {turn.hits.map((h) => (
                    <li key={h.fact.id}>
                      <Link
                        href={h.fact.href}
                        onClick={onNavigate}
                        className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3.5 py-1.5 text-sm transition hover:bg-foreground hover:text-background"
                      >
                        {h.fact.source}
                        {h.fact.title !== h.fact.source && (
                          <>
                            <span className="text-muted-foreground">·</span>
                            <span className="max-w-[16rem] truncate">{h.fact.title}</span>
                          </>
                        )}
                        <ArrowUpRight className="size-3.5" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showMeta && turn.miss && (
              <a
                href={`mailto:${footer.email}?subject=${encodeURIComponent(turn.q)}`}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent-text underline underline-offset-4"
              >
                Email Nguyen this question <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
            )}
          </article>
        )}
      </div>
    </div>
  )
}
