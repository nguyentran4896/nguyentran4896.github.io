"use client"

import { ReactLenis, useLenis } from "lenis/react"
import { useEffect, useState, type ReactNode } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { prefersReducedMotion, isCoarsePointer } from "@/lib/media"

gsap.registerPlugin(ScrollTrigger)

/**
 * Inner component rendered only when Lenis is active.
 * Syncs Lenis with GSAP ScrollTrigger following the official pattern:
 *  - lenis.on("scroll", ScrollTrigger.update) keeps ST in sync with Lenis's virtual scroll position.
 *  - gsap.ticker drives lenis.raf so both share the same rAF loop.
 *  - lagSmoothing(0) disables GSAP's built-in lag compensation (Lenis handles its own timing).
 */
function LenisScrollTriggerSync() {
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) return

    // Keep ScrollTrigger scroll position in sync with Lenis
    lenis.on("scroll", ScrollTrigger.update)

    // Drive Lenis from the GSAP ticker so they share the same animation frame
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.off("scroll", ScrollTrigger.update)
      gsap.ticker.remove(tickerCallback)
    }
  }, [lenis])

  return null
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const coarse = isCoarsePointer()
    const reduced = prefersReducedMotion()
    if (coarse || reduced || "ontouchstart" in window) return
    setEnabled(true)
  }, [])

  if (!enabled) return <>{children}</>

  return (
    // autoRaf={false} so Lenis's built-in rAF loop is disabled; GSAP ticker drives it instead.
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }} autoRaf={false}>
      <LenisScrollTriggerSync />
      {children}
    </ReactLenis>
  )
}
