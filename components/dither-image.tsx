"use client"

/**
 * DitherImage — reusable image component.
 * On initial render: shows the image as a two-tone #1A1A1A/#3B5CFF ordered-dither print.
 * On hover/focus: cross-resolves to the real image.
 * Exported for future use; not applied in any section by this agent.
 */

// copy — consolidate into lib/content.ts — a later integration agent migrates it
const COPY = {
  imageAlt: "Dithered image",
}

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { InViewShader } from "@/components/in-view-shader"

// Lazy-load the shader so it doesn't block the editorial first paint
const ImageDithering = dynamic(
  () => import("@paper-design/shaders-react").then((m) => ({ default: m.ImageDithering })),
  { ssr: false }
)

interface DitherImageProps {
  /** URL of the real image */
  src: string
  /** Alt text for the real <img> */
  alt?: string
  /** Optional class names for the outer container */
  className?: string
  /** Width of the element (CSS value) */
  width?: string | number
  /** Height of the element (CSS value) */
  height?: string | number
}

/**
 * Renders an image as a two-tone dither print by default,
 * and resolves to the real image on hover or focus.
 *
 * Respects prefers-reduced-motion: skips the cross-fade and shows
 * the real image immediately if motion is reduced.
 */
export function DitherImage({
  src,
  alt = COPY.imageAlt,
  className = "",
  width = "100%",
  height = "100%",
}: DitherImageProps) {
  const [hovered, setHovered] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // Resolve to real image when focused via keyboard
  const handleFocus = () => setHovered(true)
  const handleBlur = () => setHovered(false)

  const showReal = hovered || reducedMotion
  const showDither = !showReal

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={0}
      role="img"
      aria-label={alt}
    >
      {/* Dither layer — visible by default, fades out on hover */}
      <InViewShader className="absolute inset-0 w-full h-full">
        {(inView) => (
          <div
            className="absolute inset-0 transition-opacity duration-700 ease-out"
            style={{ opacity: showDither ? 1 : 0, pointerEvents: "none" }}
            aria-hidden="true"
          >
            <ImageDithering
              image={inView ? src : ""}
              colorFront="#1A1A1A"
              colorBack="#3B5CFF"
              colorHighlight="#1A1A1A"
              type="4x4"
              size={4}
              speed={0}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        )}
      </InViewShader>

      {/* Real image layer — fades in on hover/focus */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out"
        style={{ opacity: showReal ? 1 : 0 }}
        draggable={false}
      />
    </div>
  )
}
