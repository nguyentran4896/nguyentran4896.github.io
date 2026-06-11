"use client"

/**
 * InViewShader — wraps a shader canvas so it only mounts/animates when in view.
 * Uses IntersectionObserver to pause (speed=0) when off-screen.
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
      {children(inView)}
    </div>
  )
}
