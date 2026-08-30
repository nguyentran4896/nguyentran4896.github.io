"use client"

import { tokenizerPlayground as COPY } from "@/lib/content"
import { REDUCED_MOTION_QUERY } from "@/lib/media"

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useDeferredValue,
} from "react"
import { motion, AnimatePresence } from "framer-motion"

type Encoding = "o200k_base" | "cl100k_base"

interface TokenSpan {
  text: string
  id: number
  index: number
}

// Lazy-loaded encoder cache — populated on first use of each encoding
const encoderCache: Partial<Record<Encoding, { encode: (text: string) => number[]; decode: (tokens: number[]) => string }>> = {}

async function getEncoder(encoding: Encoding) {
  if (encoderCache[encoding]) return encoderCache[encoding]!
  if (encoding === "o200k_base") {
    const mod = await import("gpt-tokenizer/encoding/o200k_base")
    encoderCache[encoding] = mod
    return mod
  } else {
    const mod = await import("gpt-tokenizer/encoding/cl100k_base")
    encoderCache[encoding] = mod
    return mod
  }
}

function tokenize(tokenIds: number[], enc: { decode: (tokens: number[]) => string }): TokenSpan[] {
  const spans: TokenSpan[] = []
  for (let i = 0; i < tokenIds.length; i++) {
    const id = tokenIds[i]
    // Decode single token to get its text
    const tokenText = enc.decode([id])
    spans.push({ text: tokenText, id, index: i })
  }
  return spans
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(REDUCED_MOTION_QUERY)
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return reduced
}

const MAX_INPUT = 4000

export function TokenizerPlayground() {
  const [text, setText] = useState<string>(COPY.examples[1].text)
  const [encoding, setEncoding] = useState<Encoding>("o200k_base")
  const [showIds, setShowIds] = useState(false)
  const [spans, setSpans] = useState<TokenSpan[]>([])
  const [tokenCount, setTokenCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const reduced = useReducedMotion()

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deferredText = useDeferredValue(text)

  const runTokenizer = useCallback(
    async (input: string, enc: Encoding) => {
      if (!input.trim()) {
        setSpans([])
        setTokenCount(0)
        return
      }
      setLoading(true)
      try {
        const encoder = await getEncoder(enc)
        const ids = encoder.encode(input)
        setTokenCount(ids.length)
        const result = tokenize(ids, encoder)
        setSpans(result)
      } catch {
        setSpans([])
        setTokenCount(0)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // Debounced tokenization
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      runTokenizer(deferredText, encoding)
    }, 80)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [deferredText, encoding, runTokenizer])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, MAX_INPUT)
    setText(val)
  }

  const handleEncodingChange = (enc: Encoding) => {
    setEncoding(enc)
  }

  const charCount = text.length

  return (
    <section className="relative px-8 md:px-12 py-20 md:py-28">
      {/* Top hairline */}
      <div className="mb-16 h-px bg-white/10" />

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-16 max-w-4xl"
      >
        <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4 uppercase">
          {COPY.eyebrow}
        </p>
        <h1 className="font-sans text-4xl md:text-6xl font-light italic leading-[1.05] mb-8">
          {COPY.heading}
        </h1>
        <p className="max-w-2xl text-base md:text-lg leading-relaxed text-white/60 font-sans">
          {COPY.intro}
        </p>
      </motion.div>

      {/* Main playground */}
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.12, ease: "easeOut" }}
        className="max-w-5xl"
      >
        {/* Controls bar */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Encoding toggle */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
              {COPY.encodingLabel}
            </span>
            <div className="flex border border-white/10 rounded-full overflow-hidden">
              {(["o200k_base", "cl100k_base"] as Encoding[]).map((enc) => (
                <button
                  key={enc}
                  onClick={() => handleEncodingChange(enc)}
                  className={[
                    "px-4 py-1.5 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors duration-300",
                    encoding === enc
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                  aria-pressed={encoding === enc}
                >
                  {enc}
                </button>
              ))}
            </div>
          </div>

          {/* IDs toggle */}
          <button
            onClick={() => setShowIds((v) => !v)}
            aria-pressed={showIds}
            className={[
              "flex items-center gap-2 px-4 py-1.5 border rounded-full font-mono text-[10px] tracking-[0.3em] uppercase transition-colors duration-300",
              showIds
                ? "border-accent text-accent-text"
                : "border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20",
            ].join(" ")}
          >
            {COPY.idsToggle} — {showIds ? "ON" : "OFF"}
          </button>

          {/* Counts */}
          <div className="ml-auto flex items-center gap-6">
            <div className="text-right">
              <p
                className="font-sans text-xl font-light tabular-nums"
                aria-live="polite"
                aria-label={`${tokenCount} tokens`}
              >
                {tokenCount}
              </p>
              <p className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground uppercase">
                {COPY.countLabel}
              </p>
            </div>
            <div className="text-right">
              <p className="font-sans text-xl font-light tabular-nums text-muted-foreground">
                {charCount}
              </p>
              <p className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground uppercase">
                {COPY.charLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Example chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase self-center mr-1">
            TRY
          </span>
          {COPY.examples.map((ex) => (
            <button
              key={ex.label}
              onClick={() => setText(ex.text)}
              className="font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-1 border border-white/10 rounded-full text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors duration-300"
            >
              {ex.label}
            </button>
          ))}
        </div>

        {/* Input textarea */}
        <textarea
          value={text}
          onChange={handleTextChange}
          rows={5}
          maxLength={MAX_INPUT}
          placeholder={COPY.inputPlaceholder}
          aria-label={COPY.inputLabel}
          className={[
            "w-full resize-none rounded-none border border-white/35 bg-transparent p-4",
            "font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground",
            "focus:border-white/60 transition-colors duration-300",
            "tracking-[0.05em]",
          ].join(" ")}
        />
        <div className="flex justify-between mt-1 mb-8">
          <span className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground uppercase">
            {COPY.inputLabel}
          </span>
          <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground tabular-nums">
            {charCount} / {MAX_INPUT}
          </span>
        </div>

        {/* Token output */}
        <div className="border border-white/10 rounded-none min-h-[120px] p-4 relative">
          {loading && (
            <span className="absolute top-3 right-4 font-mono text-[9px] tracking-[0.3em] text-muted-foreground uppercase animate-pulse">
              TOKENIZING
            </span>
          )}
          {spans.length === 0 && !loading && (
            <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
              — NO TOKENS
            </p>
          )}
          <div className="flex flex-wrap gap-1">
            <AnimatePresence mode="sync">
              {spans.map((span, i) => {
                // Alternating: odd index = accent bg, even = foreground bg
                const isAccent = i % 2 === 1
                return (
                  <motion.span
                    key={`${span.id}-${i}`}
                    initial={{ opacity: 0, y: reduced ? 0 : 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: reduced ? 0.01 : 0.18,
                      delay: reduced ? 0 : Math.min(i * 0.012, 0.4),
                      ease: "easeOut",
                    }}
                    className={[
                      "inline-flex flex-col items-center px-1 py-0.5 border-r border-white/10 last:border-r-0",
                      "cursor-default select-text",
                    ].join(" ")}
                    style={{
                      backgroundColor: isAccent
                        ? "rgba(59, 92, 255, 0.10)"
                        : "rgba(250, 250, 250, 0.06)",
                    }}
                    title={`Token ID: ${span.id}`}
                  >
                    <span className="font-mono text-[12px] tracking-[0.05em] text-foreground whitespace-pre">
                      {/* Render special whitespace visibly */}
                      {span.text}
                    </span>
                    {showIds && (
                      <span className="font-mono text-[8px] tracking-[0.15em] text-muted-foreground leading-none mt-0.5 tabular-nums">
                        {span.id}
                      </span>
                    )}
                  </motion.span>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom legend */}
        <div className="flex flex-wrap gap-6 mt-4">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-4 h-4 border border-white/10"
              style={{ backgroundColor: "rgba(250, 250, 250, 0.06)" }}
              aria-hidden
            />
            <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
              EVEN TOKEN
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-4 h-4 border border-white/10"
              style={{ backgroundColor: "rgba(59, 92, 255, 0.10)" }}
              aria-hidden
            />
            <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
              ODD TOKEN
            </span>
          </div>
        </div>
      </motion.div>

      {/* Bottom hairline */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: reduced ? 0.01 : 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mt-20 h-px bg-white/10 origin-left"
      />
    </section>
  )
}
