"use client"

import { ReactLenis } from "lenis/react"
import { useEffect, useState, type ReactNode } from "react"

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (coarse || reduced || "ontouchstart" in window) return
    setEnabled(true)
  }, [])

  if (!enabled) return <>{children}</>

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
      {children}
    </ReactLenis>
  )
}
