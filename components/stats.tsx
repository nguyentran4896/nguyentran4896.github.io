"use client"

import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { stats } from "@/lib/content"
import { Contributions } from "@/components/contributions"
import { InViewShader } from "@/components/in-view-shader"
import { RevealText } from "@/components/reveal-text"

// Lazy-load the grain shader so it doesn't block first paint
const GrainGradient = dynamic(
  () => import("@paper-design/shaders-react").then((m) => ({ default: m.GrainGradient })),
  { ssr: false }
)

export function Stats() {
  // Respect prefers-reduced-motion: freeze speed to 0 when reduced motion is requested
  const [speed, setSpeed] = useState(0.04)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mq.matches) setSpeed(0)
    const handler = (e: MediaQueryListEvent) => setSpeed(e.matches ? 0 : 0.04)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return (
    <section className="relative px-8 md:px-12 py-20 md:py-28 border-y border-white/5 overflow-hidden">
      {/* Extremely subtle grain texture behind the numerals — reads as paper, not as an effect */}
      <InViewShader className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        {(inView) => (
          <GrainGradient
            // Two-tone near-black palette: background vs a barely-lighter shade
            colorBack="#1A1A1A"
            colors={["#222222", "#1A1A1A"]}
            softness={0.85}
            intensity={0.06}
            noise={0.55}
            shape="wave"
            speed={inView ? speed : 0}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              // Cap pixel ratio for perf
              maxWidth: "100%",
            }}
            maxPixelCount={2560 * 1440}
          />
        )}
      </InViewShader>

      <RevealText
        as="p"
        className="scroll-eyebrow relative font-mono text-xs tracking-[0.3em] text-muted-foreground mb-10 md:mb-14"
      >
        {stats.sectionLabel}
      </RevealText>

      <ul className="relative grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-6">
        {stats.items.map((item, index) => (
          <motion.li
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <span className="block font-sans text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light tracking-tight tabular-nums leading-none">
              {item.value}
            </span>
            <span className="mt-3 block font-mono text-[10px] md:text-xs tracking-[0.2em] uppercase text-muted-foreground">
              {item.label}
            </span>
            <span className="absolute -top-2 -left-2 text-accent font-mono text-[10px] tracking-widest">
              0{index + 1}
            </span>
          </motion.li>
        ))}
      </ul>

      <Contributions />
    </section>
  )
}
