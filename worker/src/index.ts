import { ChatSession } from "./session"

export { ChatSession }

export interface Env {
  SESSION: DurableObjectNamespace
  GROQ_API_KEY: string
  TELEGRAM_BOT_TOKEN: string
  TELEGRAM_CHAT_ID: string
  GROQ_MODEL: string
  GROQ_FALLBACK_MODEL: string
  ALLOWED_ORIGIN: string
}

const MAX_MSG_LEN = 1000

function isLocalhost(origin: string): boolean {
  try {
    const u = new URL(origin)
    return (u.protocol === "http:" || u.protocol === "https:") && u.hostname === "localhost"
  } catch {
    return false
  }
}

function corsHeaders(env: Env, origin: string | null): HeadersInit {
  const allow =
    origin && (origin === env.ALLOWED_ORIGIN || isLocalhost(origin)) ? origin : env.ALLOWED_ORIGIN
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get("Origin")
    const cors = corsHeaders(env, origin)

    if (req.method === "OPTIONS") return new Response(null, { headers: cors })

    const url = new URL(req.url)
    if (url.pathname !== "/chat" || req.method !== "POST") {
      return new Response("Not found", { status: 404, headers: cors })
    }

    let body: { sessionId?: string; message?: string }
    try {
      body = await req.json()
    } catch {
      return new Response("Bad JSON", { status: 400, headers: cors })
    }

    const sessionId = (body.sessionId || "").trim()
    const message = (body.message || "").trim()
    if (!sessionId || !message) {
      return new Response("Missing sessionId or message", { status: 400, headers: cors })
    }
    if (message.length > MAX_MSG_LEN) {
      return new Response("Message too long", { status: 413, headers: cors })
    }
    if (!/^[A-Za-z0-9_-]{8,64}$/.test(sessionId)) {
      return new Response("Bad sessionId", { status: 400, headers: cors })
    }

    const id = env.SESSION.idFromName(sessionId)
    const stub = env.SESSION.get(id)
    const doRes = await stub.fetch("https://do/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })

    const headers = new Headers(doRes.headers)
    for (const [k, v] of Object.entries(cors)) headers.set(k, v as string)
    return new Response(doRes.body, { status: doRes.status, headers })
  },
}
