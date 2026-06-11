"use client"

import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { recognition } from "@/lib/content"
import { InViewShader } from "@/components/in-view-shader"
import { RevealText } from "@/components/reveal-text"

// Lazy-load the dot-grid shader so it doesn't block first paint
const DotGrid = dynamic(
  () => import("@paper-design/shaders-react").then((m) => ({ default: m.DotGrid })),
  { ssr: false }
)

const { award, interests, languages, quote, sectionLabel, sectionTitle } = recognition

/**
 * DotGridBackground — subtle gray dot grid behind the award card.
 * On fine-pointer devices only: dots subtly perturb near the cursor.
 * No accent color — the award card already owns the viewport's accent.
 */
function DotGridBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  // Normalized cursor position relative to this element (0..1)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const [finePointer, setFinePointer] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    // Detect fine pointer (mouse) vs coarse (touch)
    const fine = window.matchMedia("(pointer: fine)").matches
    setFinePointer(fine)
    // Respect reduced motion
    const rmq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(rmq.matches)
    const rmHandler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    rmq.addEventListener("change", rmHandler)
    return () => rmq.removeEventListener("change", rmHandler)
  }, [])

  useEffect(() => {
    if (!finePointer || reducedMotion) return
    const el = containerRef.current
    if (!el) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      // Only update when near the element
      if (x >= -0.1 && x <= 1.1 && y >= -0.1 && y <= 1.1) {
        setCursor({ x, y })
      } else {
        setCursor(null)
      }
    }

    const handleMouseLeave = () => setCursor(null)
    window.addEventListener("mousemove", handleMouseMove)
    el.addEventListener("mouseleave", handleMouseLeave)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      el.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [finePointer, reducedMotion])

  // sizeRange: perturbation amount — near-zero by default, slightly more near cursor
  // We keep it very subtle: the dots should whisper, not shout.
  const baseSizeRange = 0
  const hoverSizeRange = reducedMotion || !finePointer || cursor === null ? 0 : 0.18

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
      <InViewShader className="absolute inset-0 w-full h-full">
        {(inView) => (
          <DotGrid
            colorBack="#1A1A1A"
            colorFill="#2A2A2A"
            colorStroke="#1A1A1A"
            size={3}
            gapX={28}
            gapY={28}
            strokeWidth={0}
            // Gentle size variation near cursor; otherwise perfectly uniform
            sizeRange={inView ? hoverSizeRange : baseSizeRange}
            opacityRange={0.04}
            shape="circle"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
            maxPixelCount={2560 * 1440}
          />
        )}
      </InViewShader>
    </div>
  )
}

export function Recognition() {
  return (
    <section id="recognition" className="relative px-8 md:px-12 py-32 md:py-40">
      {/* Section Header */}
      <div className="mb-16 md:mb-20">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="scroll-eyebrow font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4"
        >
          {sectionLabel}
        </motion.p>
        <RevealText as="h2" className="font-sans text-3xl md:text-5xl font-light italic">
          {sectionTitle}
        </RevealText>
      </div>

      {/* Award Highlight — dot grid sits behind the card */}
      <div className="relative">
        {/* DotGrid layer: behind everything, no pointer events */}
        <DotGridBackground />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-16 p-8 md:p-12 border border-white/10 rounded-sm bg-white/[0.015]"
        >
          {/* Decorative corner marks */}
          <span className="absolute top-0 left-0 w-3 h-px bg-accent" />
          <span className="absolute top-0 left-0 w-px h-3 bg-accent" />
          <span className="absolute bottom-0 right-0 w-3 h-px bg-accent" />
          <span className="absolute bottom-0 right-0 w-px h-3 bg-accent" />

          {/* Place */}
          <div className="flex md:flex-col items-baseline md:items-start gap-3 md:gap-1">
            <span className="font-sans text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light italic leading-none text-accent">
              2nd
            </span>
            <span className="font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase text-muted-foreground">
              Prize
            </span>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <p className="font-mono text-[10px] md:text-xs tracking-[0.25em] uppercase text-muted-foreground">
              {award.date}
            </p>
            <h3 className="mt-2 font-sans text-xl md:text-3xl font-light leading-snug">
              {award.event}
            </h3>
            <p className="mt-4 font-sans text-base md:text-lg italic text-white/70 leading-relaxed">
              &ldquo;{award.paper}&rdquo;
            </p>
            <p className="mt-4 font-mono text-[11px] md:text-xs tracking-wider text-muted-foreground">
              → {award.follow}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Quote */}
      <motion.blockquote
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="mt-20 md:mt-28 max-w-4xl"
      >
        <span className="block font-sans text-6xl md:text-8xl text-accent/30 leading-none mb-2">&ldquo;</span>
        <p className="font-sans text-2xl md:text-4xl lg:text-5xl font-light italic leading-tight text-white/90 -mt-6 md:-mt-10 pl-6 md:pl-10">
          {quote}
        </p>
      </motion.blockquote>

      {/* Interests + Languages grid */}
      <div className="mt-24 md:mt-32 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
        {/* Research Interests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
        >
          <p className="scroll-eyebrow font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
            Research Interests
          </p>
          <ul className="space-y-3">
            {interests.map((interest, index) => (
              <li
                key={interest}
                className="group flex items-baseline gap-4 border-b border-white/5 pb-3"
              >
                <span className="font-mono text-[10px] tracking-widest text-accent">
                  0{index + 1}
                </span>
                <span className="font-sans text-lg md:text-2xl font-light tracking-tight">
                  {interest}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Languages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <p className="scroll-eyebrow font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
            Languages
          </p>
          <ul className="space-y-6">
            {languages.map((lang) => (
              <li key={lang.name} className="border-b border-white/5 pb-5">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-sans text-2xl md:text-3xl font-light italic">
                    {lang.name}
                  </span>
                  <span className="font-mono text-[10px] md:text-xs tracking-widest uppercase text-muted-foreground text-right">
                    {lang.level}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
