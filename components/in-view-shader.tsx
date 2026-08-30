"use client"

/**
 * InViewShader — wraps a shader canvas so it only mounts while in view.
 * Uses IntersectionObserver to fully UNMOUNT the child when off-screen, which
 * releases its WebGL context (merely setting speed=0 kept the context alive).
 * With several canvases on the page this keeps the number of simultaneous live
 * GL contexts down — browsers cap them (~16, fewer on mobile) and force-lose the
 * oldest, which can blank a canvas. Trade-off: a small re-init cost on re-entry.
 * Shared utility used by the stats and recognition shaders.
 */

import { useEffect, useRef, useState, type ReactNode } from "react"

interface InViewShaderProps {
  children: (inView: boolean) => ReactNode
  /** Extra class names for the outer wrapper */
  className?: string
  /** Root margin passed to IntersectionObserver (default "-10% 0px") */
  rootMargin?: string
}

export function InViewShader({ children, className, rootMargin = "-10% 0px" }: InViewShaderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el || typeof IntersectionObserver === "undefined") {
      // Fallback: treat as always in view if API unavailable
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return (
    <div ref={wrapperRef} className={className}>
      {inView ? children(inView) : null}
    </div>
  )
}
