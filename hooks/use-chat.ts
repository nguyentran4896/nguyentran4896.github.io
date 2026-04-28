"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type ChatMessage = { role: "user" | "assistant"; content: string }

const SESSION_KEY = "nguyen-chat-session"

function getSessionId(): string {
  if (typeof window === "undefined") return ""
  let id = window.sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id =
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36)
      ).replace(/-/g, "")
    window.sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sessionIdRef = useRef<string>("")
  const endpoint = process.env.NEXT_PUBLIC_CHAT_ENDPOINT

  useEffect(() => {
    sessionIdRef.current = getSessionId()
  }, [])

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || pending) return
      if (!endpoint) {
        setError("Chat is not configured.")
        return
      }
      setError(null)
      setMessages((m) => [...m, { role: "user", content: trimmed }])
      setPending(true)
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            message: trimmed,
          }),
        })
        const data = (await res.json().catch(() => ({}))) as {
          reply?: string
          error?: string
        }
        if (!res.ok || !data.reply) {
          setError(data.error === "session_ended" ? "Session ended. Refresh to start over." : "Something went wrong.")
          if (data.reply) {
            setMessages((m) => [...m, { role: "assistant", content: data.reply! }])
          }
          return
        }
        setMessages((m) => [...m, { role: "assistant", content: data.reply! }])
      } catch {
        setError("Network error.")
      } finally {
        setPending(false)
      }
    },
    [endpoint, pending],
  )

  return { messages, pending, error, send }
}
