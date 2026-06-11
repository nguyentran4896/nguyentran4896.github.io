"use client"

// copy — consolidate into lib/content.ts — a later integration agent migrates it
// (no user-facing copy in this utility component)

import { useRef, useEffect, useState, type ReactNode, type ElementType } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"

gsap.registerPlugin(ScrollTrigger, SplitText)

interface RevealTextProps {
  children: ReactNode
  /** Extra className forwarded to the wrapper element */
  className?: string
  /** Tag to render as; defaults to "div" */
  as?: ElementType
}

/**
 * RevealText — masked line-reveal animation via GSAP SplitText + ScrollTrigger.
 *
 * Lines rise from beneath an invisible overflow-clip mask when they scroll into view.
 * Stagger: 75 ms, duration: 700 ms, power3.out.
 *
 * Reduced-motion: children rendered as-is, no splitting, no animation.
 */
export function RevealText({ children, className, as: Tag = "div" }: RevealTextProps) {
  const containerRef = useRef<HTMLElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener("change", handler)
    setMounted(true)
    return () => mq.removeEventListener("change", handler)
  }, [])

  useGSAP(
    () => {
      if (!mounted || reducedMotion || !containerRef.current) return

      const split = new SplitText(containerRef.current, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        aria: "auto",
      })

      gsap.from(split.lines, {
        yPercent: 105,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.075,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 88%",
          once: true,
        },
      })

      return () => {
        split.revert()
      }
    },
    { scope: containerRef, dependencies: [mounted, reducedMotion] }
  )

  return (
    <Tag ref={containerRef} className={className}>
      {children}
    </Tag>
  )
}
