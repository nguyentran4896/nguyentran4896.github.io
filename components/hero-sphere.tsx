"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import type { Pointer } from "@/components/sentient-sphere"

const SentientSphere = dynamic(() => import("@/components/sentient-sphere").then((m) => m.SentientSphere), {
  ssr: false,
  loading: () => null,
})

const DARK = "(prefers-color-scheme: dark)"
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

function readColors() {
  const s = getComputedStyle(document.documentElement)
  return {
    ink: s.getPropertyValue("--foreground").trim() || "#15130f",
    accent: s.getPropertyValue("--accent").trim() || "#e5481b",
    dark: window.matchMedia(DARK).matches,
    compact: window.innerWidth < 640,
  }
}

/**
 * Decorative backdrop for the hero: the original wireframe sphere. It follows
 * the pointer, fades and shrinks as the hero scrolls away, pauses when off
 * screen, and holds still (one static frame) under prefers-reduced-motion.
 */
export function HeroSphere() {
  const wrap = useRef<HTMLDivElement>(null)
  const pointer = useRef<Pointer>({ x: 0, y: 0 })
  const [colors, setColors] = useState<ReturnType<typeof readColors> | null>(null)
  const [visible, setVisible] = useState(true)
  const [still, setStill] = useState(false)
  const [shown, setShown] = useState(false)
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia(REDUCED_MOTION)
    const dark = window.matchMedia(DARK)
    const onScheme = () => setColors(readColors())
    const onReduced = () => setStill(reduced.matches)
    dark.addEventListener("change", onScheme)
    reduced.addEventListener("change", onReduced)
    const t = window.setTimeout(() => {
      setColors(readColors())
      setStill(reduced.matches)
      setShown(true)
    }, 120)
    // Once the entrance has played, drop the transition so scroll fades track 1:1.
    const t2 = window.setTimeout(() => setSettled(true), 1600)
    return () => {
      window.clearTimeout(t2)
      dark.removeEventListener("change", onScheme)
      reduced.removeEventListener("change", onReduced)
      window.clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (still) return
    const el = wrap.current
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        if (!el) return
        const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.6)))
        el.style.setProperty("--sphere-fade", String(1 - p))
        el.style.setProperty("--sphere-scale", String(1 - p * 0.2))
      })
    }
    onScroll()
    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("scroll", onScroll)
    }
  }, [still])

  return (
    <div
      ref={wrap}
      aria-hidden
      className="hero-sphere pointer-events-none absolute inset-x-0 top-14 -z-10 flex h-[30rem] items-start justify-center overflow-hidden sm:top-10 sm:h-[min(100svh,54rem)] sm:items-center"
      data-shown={shown || undefined}
      data-settled={settled || undefined}
    >
      <div className="aspect-square w-[min(110vw,28rem)] sm:w-[min(100vw,52rem)]">
        {colors && (
          <SentientSphere
            ink={colors.ink}
            accent={colors.accent}
            alpha={(colors.dark ? 0.13 : 0.1) * (colors.compact ? 0.7 : 1)}
            detail={colors.compact ? 20 : 32}
            pointer={pointer}
            running={visible && !still}
          />
        )}
      </div>
    </div>
  )
}
