"use client"

import { onDeviceChat as COPY } from "@/lib/content"

import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  forwardRef,
  type RefObject,
} from "react"
import dynamic from "next/dynamic"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Msg = { role: "user" | "assistant"; content: string }

type Phase =
  | "closed"
  | "consent"   // user sees disclaimer + load / not-now buttons
  | "loading"   // model downloading
  | "ready"     // model loaded, chat open
  | "no-webgpu" // WebGPU unavailable

type State = {
  phase: Phase
  progress: number
  progressMsg: string
  messages: Msg[]
  streaming: string // partial assistant token accumulator
  error: string | null
}

type Action =
  | { type: "OPEN" }
  | { type: "CONSENT_ACCEPT" }
  | { type: "CONSENT_DECLINE" }
  | { type: "NO_WEBGPU" }
  | { type: "PROGRESS"; progress: number; msg: string }
  | { type: "READY" }
  | { type: "USER_MSG"; text: string }
  | { type: "TOKEN"; token: string }
  | { type: "ASSISTANT_DONE" }
  | { type: "ERROR"; msg: string }
  | { type: "CLOSE" }

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

const INIT: State = {
  phase: "closed",
  progress: 0,
  progressMsg: "",
  messages: [],
  streaming: "",
  error: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "OPEN":
      return { ...state, phase: "consent" }
    case "CONSENT_ACCEPT":
      return { ...state, phase: "loading", progress: 0, progressMsg: "" }
    case "CONSENT_DECLINE":
      return { ...state, phase: "closed" }
    case "NO_WEBGPU":
      return { ...state, phase: "no-webgpu" }
    case "PROGRESS":
      return { ...state, progress: action.progress, progressMsg: action.msg }
    case "READY":
      return {
        ...state,
        phase: "ready",
        messages: [{ role: "assistant", content: COPY.readyMsg }],
      }
    case "USER_MSG":
      return {
        ...state,
        messages: [...state.messages, { role: "user", content: action.text }],
        streaming: "",
        error: null,
      }
    case "TOKEN":
      return { ...state, streaming: state.streaming + action.token }
    case "ASSISTANT_DONE":
      return {
        ...state,
        messages: state.streaming
          ? [...state.messages, { role: "assistant", content: state.streaming }]
          : state.messages,
        streaming: "",
      }
    case "ERROR":
      return { ...state, error: action.msg, streaming: "" }
    case "CLOSE":
      return { ...state, phase: "closed" }
    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Engine loader (lazy — only imported after user opts in)
// ---------------------------------------------------------------------------

async function loadEngine(
  onProgress: (pct: number, msg: string) => void,
): Promise<import("@mlc-ai/web-llm").MLCEngineInterface> {
  const { MODEL_ID } = await import("@/lib/local-llm")
  const webllm = await import("@mlc-ai/web-llm")

  const initProgressCallback = (
    report: import("@mlc-ai/web-llm").InitProgressReport,
  ) => {
    const pct = Math.round((report.progress ?? 0) * 100)
    onProgress(pct, report.text ?? "")
  }

  // Try worker-based engine first; fall back to non-worker if bundling fails.
  try {
    return await webllm.CreateWebWorkerMLCEngine(
      new Worker(new URL("./llm.worker.ts", import.meta.url), {
        type: "module",
      }),
      MODEL_ID,
      { initProgressCallback },
    )
  } catch {
    return await webllm.CreateMLCEngine(MODEL_ID, { initProgressCallback })
  }
}

// ---------------------------------------------------------------------------
// ChatInput sub-component
// ---------------------------------------------------------------------------

const ChatInput = forwardRef<
  HTMLTextAreaElement,
  { onSend: (text: string) => void; disabled: boolean }
>(function ChatInput({ onSend, disabled }, ref) {
  const taRef = ref as RefObject<HTMLTextAreaElement>

  const submit = useCallback(() => {
    const text = taRef.current?.value ?? ""
    if (!text.trim() || disabled) return
    onSend(text)
    if (taRef.current) taRef.current.value = ""
  }, [onSend, disabled, taRef])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="flex shrink-0 items-end gap-2 border-t border-border px-5 py-4"
    >
      <span className="shrink-0 text-[12px] text-accent font-mono">~ $</span>
      <textarea
        ref={ref}
        rows={1}
        maxLength={1000}
        placeholder={COPY.placeholder}
        disabled={disabled}
        aria-label={COPY.inputAriaLabel}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
        className="flex-1 resize-none bg-transparent font-mono text-[12px] tracking-wide text-foreground caret-accent placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled}
        className="rounded-full border border-border px-3 py-1.5 font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-accent hover:border-accent transition-colors disabled:opacity-40 disabled:hover:text-muted-foreground disabled:hover:border-border"
      >
        {disabled ? COPY.loadingLabel : COPY.sendLabel}
      </button>
    </form>
  )
})

// ---------------------------------------------------------------------------
// Main inner component (wrapped in dynamic below)
// ---------------------------------------------------------------------------

function OnDeviceChatInner() {
  const [state, dispatch] = useReducer(reducer, INIT)
  const engineRef = useRef<import("@mlc-ai/web-llm").MLCEngineInterface | null>(
    null,
  )
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const lastFocusRef = useRef<HTMLElement | null>(null)
  const pendingRef = useRef(false)

  // Scroll to bottom when transcript or streaming updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [state.messages, state.streaming])

  // Focus the input when the model becomes ready
  useEffect(() => {
    if (state.phase === "ready") {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [state.phase])

  // Escape to close the panel
  useEffect(() => {
    if (state.phase === "closed") return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch({ type: "CLOSE" })
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [state.phase])

  const handleOpen = useCallback(() => {
    lastFocusRef.current = document.activeElement as HTMLElement | null
    if (typeof navigator === "undefined" || !("gpu" in navigator)) {
      dispatch({ type: "NO_WEBGPU" })
    } else {
      dispatch({ type: "OPEN" })
    }
  }, [])

  const handleClose = useCallback(() => {
    dispatch({ type: "CLOSE" })
    requestAnimationFrame(() => lastFocusRef.current?.focus())
  }, [])

  const handleLoadAccept = useCallback(async () => {
    dispatch({ type: "CONSENT_ACCEPT" })
    try {
      const engine = await loadEngine((progress, msg) => {
        dispatch({ type: "PROGRESS", progress, msg })
      })
      engineRef.current = engine
      dispatch({ type: "READY" })
    } catch (err) {
      dispatch({ type: "ERROR", msg: String(err) })
    }
  }, [])

  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || pendingRef.current || !engineRef.current) return
      pendingRef.current = true
      dispatch({ type: "USER_MSG", text: trimmed })

      try {
        const { buildSystemPrompt } = await import("@/lib/local-llm")
        // Exclude the greeting-only ready message from the context window
        const history = state.messages.filter(
          (m) => !(m.role === "assistant" && m.content === COPY.readyMsg),
        )
        const msgs = [
          { role: "system" as const, content: buildSystemPrompt() },
          ...history,
          { role: "user" as const, content: trimmed },
        ]

        const stream = await engineRef.current.chat.completions.create({
          messages: msgs,
          stream: true,
          max_tokens: 256,
        })

        for await (const chunk of stream) {
          const token = chunk.choices[0]?.delta?.content ?? ""
          if (token) dispatch({ type: "TOKEN", token })
        }
        dispatch({ type: "ASSISTANT_DONE" })
      } catch (err) {
        dispatch({ type: "ERROR", msg: String(err) })
      } finally {
        pendingRef.current = false
      }
    },
    [state.messages],
  )

  // ---- Trigger button (closed state) ----------------------------------------
  if (state.phase === "closed") {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="fixed bottom-5 right-5 z-[9000] inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-accent hover:border-accent transition-colors"
        aria-label="Open on-device chat"
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
          aria-hidden="true"
        />
        {COPY.trigger}
      </button>
    )
  }

  // ---- Open panel + trigger button ------------------------------------------
  return (
    <>
      {/* Trigger — shows "CLOSE" while panel is open */}
      <button
        type="button"
        onClick={handleClose}
        className="fixed bottom-5 right-5 z-[9002] inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-accent hover:border-accent transition-colors"
        aria-label="Close on-device chat"
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
          aria-hidden="true"
        />
        {COPY.close}
      </button>

      {/* Chat panel */}
      <div
        role="dialog"
        aria-label={COPY.dialogAriaLabel}
        aria-modal="true"
        className="fixed bottom-0 right-0 z-[9001] flex h-[90vh] max-h-[640px] w-full max-w-[420px] flex-col border-l border-t border-border bg-background font-mono sm:bottom-5 sm:right-5 sm:h-[600px] sm:rounded-[10px] sm:border"
      >
        {/* Header */}
        <header className="flex shrink-0 items-start justify-between border-b border-border px-5 pt-5 pb-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              {COPY.eyebrow}
            </p>
            <h2 className="mt-1 font-sans text-2xl font-light italic leading-tight tracking-tight text-foreground">
              {COPY.heading}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label={COPY.closeAriaLabel}
            className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors"
          >
            ×
          </button>
        </header>

        {/* Body — varies by phase */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Consent / no-WebGPU screen */}
          {(state.phase === "consent" || state.phase === "no-webgpu") && (
            <div className="flex flex-1 flex-col justify-between px-5 py-6">
              <p className="font-mono text-[11px] leading-relaxed text-foreground/70 tracking-wide">
                {state.phase === "no-webgpu"
                  ? COPY.webgpuMissing
                  : COPY.disclaimer}
              </p>
              {state.phase === "consent" && (
                <div className="mt-6 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleLoadAccept}
                    className="w-full rounded-full border border-accent px-4 py-2 font-mono text-[10px] tracking-[0.3em] uppercase text-accent hover:bg-accent hover:text-background transition-colors"
                  >
                    {COPY.loadBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "CONSENT_DECLINE" })}
                    className="w-full rounded-full border border-border px-4 py-2 font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-accent hover:border-accent transition-colors"
                  >
                    {COPY.cancelBtn}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Download-progress screen */}
          {state.phase === "loading" && (
            <div className="flex flex-1 flex-col justify-center px-5">
              <p className="mb-3 font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                {COPY.loadingPrefix} {state.progress}%
              </p>
              {/* 1px accent hairline progress bar */}
              <div className="h-px w-full bg-border overflow-hidden">
                <div
                  className="h-px bg-accent transition-all duration-300"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
              {state.progressMsg && (
                <p className="mt-3 font-mono text-[10px] text-muted-foreground/60 truncate">
                  {state.progressMsg}
                </p>
              )}
            </div>
          )}

          {/* Chat transcript */}
          {state.phase === "ready" && (
            <>
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-5 py-4 space-y-3 font-mono text-[12px] leading-relaxed"
              >
                {state.messages.map((m, i) => (
                  <div key={i}>
                    {m.role === "user" ? (
                      <div className="flex gap-2">
                        <span className="shrink-0 text-muted-foreground">
                          ~ $
                        </span>
                        <span className="text-foreground break-words">
                          {m.content}
                        </span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <span className="shrink-0 text-accent">&gt;</span>
                        <span className="text-foreground/80 break-words whitespace-pre-wrap">
                          {m.content}
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Streaming partial response */}
                {state.streaming && (
                  <div className="flex gap-2">
                    <span className="shrink-0 text-accent">&gt;</span>
                    <span className="text-foreground/80 break-words whitespace-pre-wrap">
                      {state.streaming}
                      <span
                        className="inline-block w-[6px] h-[12px] bg-accent ml-0.5 animate-pulse"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                )}

                {/* Error line */}
                {state.error && (
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                    {COPY.errorPrefix} {state.error}
                  </p>
                )}
              </div>

              <ChatInput
                ref={inputRef}
                onSend={handleSend}
                disabled={pendingRef.current}
              />
            </>
          )}
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Export as a lazily-loaded no-SSR client component.
// Guards window/navigator access at static prerender time.
// ---------------------------------------------------------------------------
export const OnDeviceChat = dynamic(
  () => Promise.resolve(OnDeviceChatInner),
  { ssr: false },
)
