import { SYSTEM_PROMPT } from "./bio"
import type { Env } from "./index"

type Msg = { role: "user" | "assistant"; content: string; ts: number }

const DEBOUNCE_MS = 120_000 // 2 min after last message
const MAX_TURNS = 40

export class ChatSession {
  state: DurableObjectState
  env: Env
  messages: Msg[] = []
  startedAt: number | null = null
  notified: boolean = false
  loaded: boolean = false

  constructor(state: DurableObjectState, env: Env) {
    this.state = state
    this.env = env
  }

  async load() {
    if (this.loaded) return
    this.messages = (await this.state.storage.get<Msg[]>("messages")) || []
    this.startedAt = (await this.state.storage.get<number>("startedAt")) || null
    this.notified = (await this.state.storage.get<boolean>("notified")) || false
    this.loaded = true
  }

  async fetch(req: Request): Promise<Response> {
    await this.load()
    const { message } = (await req.json()) as { message: string }

    if (this.messages.filter((m) => m.role === "user").length >= MAX_TURNS) {
      return Response.json(
        { error: "session_ended", reply: "Session limit reached. Refresh to start a new chat." },
        { status: 429 },
      )
    }

    const now = Date.now()
    if (!this.startedAt) this.startedAt = now
    this.messages.push({ role: "user", content: message, ts: now })

    let reply: string
    try {
      reply = await this.callGroq(this.env.GROQ_MODEL)
    } catch (e) {
      try {
        reply = await this.callGroq(this.env.GROQ_FALLBACK_MODEL)
      } catch (e2) {
        reply = "Sorry — the assistant is unavailable right now. Try again in a moment."
      }
    }

    this.messages.push({ role: "assistant", content: reply, ts: Date.now() })
    await this.state.storage.put("messages", this.messages)
    await this.state.storage.put("startedAt", this.startedAt)
    await this.state.storage.setAlarm(Date.now() + DEBOUNCE_MS)

    return Response.json({ reply })
  }

  async callGroq(model: string): Promise<string> {
    const payload = {
      model,
      temperature: 0.4,
      max_tokens: 600,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...this.messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`groq ${res.status}`)
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const out = data.choices?.[0]?.message?.content?.trim()
    if (!out) throw new Error("empty reply")
    return out
  }

  async alarm() {
    await this.load()
    if (!this.messages.length) return
    const transcript = this.formatTranscript()
    try {
      await this.sendTelegram(transcript)
    } catch (e) {
      // best-effort; don't crash the DO
    }
    await this.state.storage.deleteAll()
  }

  formatTranscript(): string {
    const sid = this.state.id.toString().slice(0, 8)
    const start = this.startedAt || Date.now()
    const last = this.messages[this.messages.length - 1]?.ts || start
    const durMin = Math.max(1, Math.round((last - start) / 60_000))
    const turns = this.messages.filter((m) => m.role === "user").length
    const header = `💬 Portfolio chat — ${sid} — ${durMin}m, ${turns} turn${turns === 1 ? "" : "s"}`
    const body = this.messages
      .map((m) => `${m.role === "user" ? "[visitor]" : "[bot]    "} ${m.content}`)
      .join("\n\n")
    return `${header}\n\n${body}`
  }

  async sendTelegram(text: string) {
    // Telegram caps message body at 4096 chars; chunk if needed.
    const CHUNK = 3800
    const parts: string[] = []
    let remaining = text
    while (remaining.length > CHUNK) {
      let cut = remaining.lastIndexOf("\n\n", CHUNK)
      if (cut < CHUNK / 2) cut = CHUNK
      parts.push(remaining.slice(0, cut))
      remaining = remaining.slice(cut).trimStart()
    }
    parts.push(remaining)

    const url = `https://api.telegram.org/bot${this.env.TELEGRAM_BOT_TOKEN}/sendMessage`
    for (const part of parts) {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: this.env.TELEGRAM_CHAT_ID,
          text: part,
          disable_web_page_preview: true,
        }),
      })
      if (!res.ok) throw new Error(`telegram ${res.status}`)
    }
  }
}
