"use client"

import { useEffect } from "react"

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
      if (e.key === "Escape" && document.documentElement.hasAttribute("data-terminal")) {
        document.documentElement.removeAttribute("data-terminal")
        return
      }
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      buffer = [...buffer, key].slice(-SEQUENCE.length)
      if (buffer.length === SEQUENCE.length && buffer.every((k, i) => k === SEQUENCE[i])) {
        const html = document.documentElement
        if (html.hasAttribute("data-terminal")) {
          html.removeAttribute("data-terminal")
        } else {
          html.setAttribute("data-terminal", "")
        }
        buffer = []
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return null
}
