"use client"

import { useEffect } from "react"
import { toggleTerminal } from "@/lib/terminal-bus"

const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
]

export function Konami() {
  useEffect(() => {
    let buffer: string[] = []

    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      buffer = [...buffer, key].slice(-SEQUENCE.length)
      if (buffer.length === SEQUENCE.length && buffer.every((k, i) => k === SEQUENCE[i])) {
        toggleTerminal()
        buffer = []
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return null
}
