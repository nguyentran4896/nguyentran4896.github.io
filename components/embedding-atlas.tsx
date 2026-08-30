"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useRouter } from "next/navigation"
import type { EmbeddingEntry } from "@/lib/embeddings"
import { embeddingAtlas as COPY } from "@/lib/content"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  entries: EmbeddingEntry[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAD = 48 // px padding inside the SVG frame
const DOT_R = 4 // base dot radius
const DOT_R_ACTIVE = 6 // radius when hovered

// ─── Helper: project normalised [0,1] coords to SVG pixel space ───────────────

function project(x: number, y: number, w: number, h: number) {
  return {
    cx: PAD + x * (w - PAD * 2),
    cy: PAD + y * (h - PAD * 2),
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ExcerptCard({
  entry,
  visible,
}: {
  entry: EmbeddingEntry | null
  visible: boolean
}) {
  if (!entry) return null
  const kindLabel = COPY.kindLabels[entry.kind] ?? entry.kind.toUpperCase()

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="pointer-events-none absolute right-0 top-0 w-64 border border-border bg-background p-4"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="block font-mono text-[9px] uppercase tracking-[0.3em] text-accent-text mb-2">
            {kindLabel}
          </span>
          <p className="font-sans text-xs leading-relaxed text-foreground/80 line-clamp-4">
            {entry.excerpt}
          </p>
          <span className="mt-3 block font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
            {entry.href.replace(/^\//, "").replace(/^#/, "") || "home"}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EmbeddingAtlas({ entries }: Props) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [svgSize, setSvgSize] = useState({ w: 600, h: 400 })
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [inView, setInView] = useState(false)
  const prefersReduced = useReducedMotion()

  // ── Observe container size ────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((resizeEntries) => {
      for (const re of resizeEntries) {
        const { width, height } = re.contentRect
        if (width > 0 && height > 0) setSvgSize({ w: width, h: height })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // ── IntersectionObserver — only animate when visible ─────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([ioEntry]) => setInView(ioEntry.isIntersecting),
      { threshold: 0.1 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // ── Derived: active entry and its neighbours ──────────────────────────────
  const activeEntry = hoveredIdx !== null ? entries[hoveredIdx] : null
  const neighborIndices: Set<number> =
    activeEntry ? new Set(activeEntry.neighbors) : new Set()

  // ── Event handlers ────────────────────────────────────────────────────────
  const handleMouseEnter = useCallback((idx: number) => setHoveredIdx(idx), [])
  const handleMouseLeave = useCallback(() => setHoveredIdx(null), [])
  const handleDotClick = useCallback(
    (idx: number) => {
      const entry = entries[idx]
      if (entry) router.push(entry.href)
    },
    [entries, router],
  )
  const handleDotKeyDown = useCallback(
    (e: React.KeyboardEvent<SVGCircleElement>, idx: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        const entry = entries[idx]
        if (entry) router.push(entry.href)
      }
    },
    [entries, router],
  )

  // ── Stagger timing ────────────────────────────────────────────────────────
  const staggerDelay = (i: number) => (prefersReduced ? 0 : i * 0.03)

  const { w, h } = svgSize

  return (
    <section
      className="relative px-8 md:px-12 py-20 md:py-28 border-t border-border"
      aria-label="Embedding atlas — latent space of the writing"
    >
      {/* Eyebrow + heading */}
      <motion.p
        className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4"
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {COPY.eyebrow}
      </motion.p>
      <motion.h2
        className="font-sans text-3xl md:text-5xl font-light italic leading-[1.05] mb-16"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.08, ease: "easeOut" }}
      >
        {COPY.heading}
      </motion.h2>

      {/* Atlas frame */}
      <motion.div
        ref={containerRef}
        className="relative w-full"
        style={{ height: "min(60vw, 480px)" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
      >
        {/* Hairline frame */}
        <div className="absolute inset-0 border border-border pointer-events-none" />

        {/* Corner label */}
        <span className="absolute bottom-3 left-3 font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground pointer-events-none select-none">
          {COPY.cornerLabel}
        </span>

        {/* Hover card — top-right */}
        <div className="absolute top-3 right-3 z-10">
          <ExcerptCard entry={activeEntry} visible={hoveredIdx !== null} />
        </div>

        {/* SVG scatter */}
        <svg
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          className="absolute inset-0 w-full h-full overflow-visible"
          aria-hidden="true"
        >
          {/* Neighbour lines — drawn first so they sit under the dots */}
          {inView &&
            hoveredIdx !== null &&
            activeEntry &&
            activeEntry.neighbors.map((nIdx) => {
              const aPos = project(activeEntry.x, activeEntry.y, w, h)
              const nEntry = entries[nIdx]
              if (!nEntry) return null
              const nPos = project(nEntry.x, nEntry.y, w, h)
              return (
                <line
                  key={`line-${hoveredIdx}-${nIdx}`}
                  x1={aPos.cx}
                  y1={aPos.cy}
                  x2={nPos.cx}
                  y2={nPos.cy}
                  stroke="rgba(250,250,250,0.20)"
                  strokeWidth={1}
                />
              )
            })}

          {/* Dots */}
          {entries.map((entry, idx) => {
            const pos = project(entry.x, entry.y, w, h)
            const isActive = idx === hoveredIdx
            const isNeighbor = neighborIndices.has(idx)

            const fill = isActive
              ? "var(--color-accent, #3B5CFF)"
              : isNeighbor
                ? "rgba(250,250,250,0.55)"
                : "rgba(250,250,250,0.22)"

            const strokeColor = isActive
              ? "var(--color-accent, #3B5CFF)"
              : isNeighbor
                ? "rgba(250,250,250,0.4)"
                : "rgba(250,250,250,0.12)"

            const r = isActive ? DOT_R_ACTIVE : DOT_R

            return (
              <motion.circle
                key={entry.id}
                cx={pos.cx}
                cy={pos.cy}
                r={r}
                fill={fill}
                stroke={strokeColor}
                strokeWidth={1}
                initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.4 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
                transition={{
                  duration: 0.5,
                  delay: staggerDelay(idx),
                  ease: "easeOut",
                }}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => handleMouseEnter(idx)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleDotClick(idx)}
                onFocus={() => handleMouseEnter(idx)}
                onBlur={handleMouseLeave}
                onKeyDown={(e) => handleDotKeyDown(e, idx)}
                tabIndex={0}
                role="button"
                aria-label={`${COPY.kindLabels[entry.kind] ?? entry.kind}: ${entry.excerpt.slice(0, 80)}`}
              />
            )
          })}
        </svg>

        {/* Navigation is handled per-dot via onClick → router.push */}
      </motion.div>

      {/* Legend */}
      <motion.div
        className="mt-6 flex gap-6 flex-wrap"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      >
        {(["post-para", "work", "about"] as const).map((kind) => (
          <span key={kind} className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{
                background: "rgba(250,250,250,0.22)",
                border: "1px solid rgba(250,250,250,0.12)",
              }}
              aria-hidden="true"
            />
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
              {COPY.kindLabels[kind]}
            </span>
          </span>
        ))}
      </motion.div>
    </section>
  )
}
