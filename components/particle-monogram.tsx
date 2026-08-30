"use client"

import {
  useRef,
  useMemo,
  useEffect,
  useState,
  useCallback,
} from "react"
import dynamic from "next/dynamic"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import {
  BufferGeometry,
  Float32BufferAttribute,
  Color,
} from "three"

import { particleMonogram as MONOGRAM_COPY } from "@/lib/content"
import { prefersReducedMotion, isCoarsePointer } from "@/lib/media"

// ── constants ────────────────────────────────────────────────────────────────

const POINT_COUNT = 5000
const CANVAS_W = 1200
const CANVAS_H = 260
const FONT_SIZE = 180
const FONT_FAMILY = '"Playfair Display", Georgia, serif'
const ACCENT_HEX = "#3B5CFF"
const ACCENT_FRACTION = 0.04   // ~4 % of particles get accent tint
const REPEL_RADIUS = 0.35      // world-space repel distance
const REPEL_STRENGTH = 0.012   // per-frame push magnitude
const CLOUD_SPREAD = 3.2       // half-extent of idle cloud
const CLOUD_DEPTH = 1.2        // z drift range
const EASE_LAMBDA = 4          // exponential smoothing rate (higher = faster)

// ── helpers ──────────────────────────────────────────────────────────────────

/** Exponential decay lerp factor from lambda & delta */
function dampFactor(lambda: number, delta: number): number {
  return 1 - Math.exp(-lambda * delta)
}

/** Sample alpha>128 pixels from an offscreen canvas; returns normalised world coords. */
function sampleTextPositions(count: number): Float32Array {
  if (typeof document === "undefined") return new Float32Array(count * 3)

  const canvas = document.createElement("canvas")
  canvas.width = CANVAS_W
  canvas.height = CANVAS_H
  const ctx = canvas.getContext("2d")
  if (!ctx) return new Float32Array(count * 3)

  // Try to use Playfair Display if already loaded; falls back to Georgia serif
  ctx.fillStyle = "#ffffff"
  ctx.font = `300 italic ${FONT_SIZE}px ${FONT_FAMILY}`
  ctx.textBaseline = "middle"
  ctx.textAlign = "center"
  ctx.fillText(MONOGRAM_COPY.text, CANVAS_W / 2, CANVAS_H / 2)

  const imageData = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H)
  const pixels: [number, number][] = []

  for (let y = 0; y < CANVAS_H; y++) {
    for (let x = 0; x < CANVAS_W; x++) {
      const alpha = imageData.data[(y * CANVAS_W + x) * 4 + 3]
      if (alpha > 128) pixels.push([x, y])
    }
  }

  if (pixels.length === 0) return new Float32Array(count * 3)

  // Map pixels → world space: x in [-aspect..aspect], y in [-0.75..0.75]
  const aspect = CANVAS_W / CANVAS_H
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const [px, py] = pixels[Math.floor(Math.random() * pixels.length)]
    positions[i * 3 + 0] = ((px / CANVAS_W) - 0.5) * aspect * 2
    positions[i * 3 + 1] = -((py / CANVAS_H) - 0.5) * 1.5
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.05
  }

  return positions
}

/** Uniform cloud scatter. */
function makeCloudPositions(count: number): Float32Array {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    pos[i * 3 + 0] = (Math.random() - 0.5) * CLOUD_SPREAD * 2
    pos[i * 3 + 1] = (Math.random() - 0.5) * CLOUD_SPREAD
    pos[i * 3 + 2] = (Math.random() - 0.5) * CLOUD_DEPTH * 2
  }
  return pos
}

// ── inner R3F component ───────────────────────────────────────────────────────

interface ParticleFieldProps {
  formed: boolean
  reducedMotion: boolean
  isTouch: boolean
}

function ParticleField({ formed, reducedMotion, isTouch }: ParticleFieldProps) {
  const pointsRef = useRef<import("three").Points>(null)
  const { pointer, size } = useThree()

  // Stable target positions sampled once
  const textPositions = useMemo(() => sampleTextPositions(POINT_COUNT), [])
  const cloudPositions = useMemo(() => makeCloudPositions(POINT_COUNT), [])

  // Build vertex colors: ~4% accent blue, rest near-white
  const vertexColors = useMemo(() => {
    const accentColor = new Color(ACCENT_HEX)
    const whiteColor = new Color(0.95, 0.95, 0.95)
    const colors = new Float32Array(POINT_COUNT * 3)
    for (let i = 0; i < POINT_COUNT; i++) {
      const c = Math.random() < ACCENT_FRACTION ? accentColor : whiteColor
      colors[i * 3 + 0] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    return colors
  }, [])

  // Build geometry with cloud initial positions
  const geometry = useMemo(() => {
    const geo = new BufferGeometry()
    const initial = makeCloudPositions(POINT_COUNT)
    geo.setAttribute("position", new Float32BufferAttribute(initial, 3))
    geo.setAttribute("color", new Float32BufferAttribute(vertexColors, 3))
    return geo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally not adding vertexColors — geometry is stable

  // Live position buffer — same typed array backing the BufferAttribute
  // Mutating this directly is enough; we only need posAttr.needsUpdate = true
  const cur = useRef<Float32Array>(
    geometry.attributes.position.array as Float32Array
  )

  // Per-particle velocity for cloud drift
  const vel = useRef<Float32Array>(
    (() => {
      const v = new Float32Array(POINT_COUNT * 3)
      for (let i = 0; i < POINT_COUNT * 3; i++) {
        v[i] = (Math.random() - 0.5) * 0.0003
      }
      return v
    })()
  )

  // Pointer in view-space ([-1..1] NDC from R3F)
  const pxNdc = useRef(0)
  const pyNdc = useRef(0)

  useFrame((_, delta) => {
    if (!pointsRef.current) return

    const posAttr = pointsRef.current.geometry.attributes
      .position as import("three").BufferAttribute

    // Map NDC pointer to approximate world units (camera z=4, fov=50)
    if (!isTouch) {
      const aspect = size.width / size.height
      pxNdc.current = pointer.x * aspect * 1.68  // tan(25°)≈0.466 * 2*4 ≈ 3.72; scale ≈1.68 feels right
      pyNdc.current = pointer.y * 1.68
    }

    const target = formed ? textPositions : cloudPositions
    const c = cur.current
    const v = vel.current
    const f = dampFactor(EASE_LAMBDA, Math.min(delta, 0.1))

    if (reducedMotion) {
      // Snap to target once; mutate buffer in-place then mark dirty
      if (formed) {
        for (let i = 0; i < POINT_COUNT * 3; i++) c[i] = target[i]
        posAttr.needsUpdate = true
      }
      return
    }

    const px = pxNdc.current
    const py = pyNdc.current

    for (let i = 0; i < POINT_COUNT; i++) {
      const ix = i * 3
      const iy = i * 3 + 1
      const iz = i * 3 + 2

      // Gentle cloud drift when not formed
      if (!formed) {
        c[ix] += v[ix]
        c[iy] += v[iy]
        c[iz] += v[iz]

        // Soft bounding: flip velocity when particle escapes cloud
        if (Math.abs(c[ix]) > CLOUD_SPREAD)       v[ix] *= -1
        if (Math.abs(c[iy]) > CLOUD_SPREAD * 0.5) v[iy] *= -1
        if (Math.abs(c[iz]) > CLOUD_DEPTH)         v[iz] *= -1
      }

      // Exponential ease toward target (replaces damp3 – same maths, no allocation)
      c[ix] += (target[ix] - c[ix]) * f
      c[iy] += (target[iy] - c[iy]) * f
      c[iz] += (target[iz] - c[iz]) * f

      // Pointer repel (fine pointers only, formed state)
      if (!isTouch && formed) {
        const dx = c[ix] - px
        const dy = c[iy] - py
        const dist2 = dx * dx + dy * dy
        if (dist2 < REPEL_RADIUS * REPEL_RADIUS && dist2 > 0.00001) {
          const dist = Math.sqrt(dist2)
          const factor = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH
          c[ix] += (dx / dist) * factor
          c[iy] += (dy / dist) * factor
        }
      }
    }

    // c IS posAttr.array — mutation is already in the buffer, just flag dirty
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={0.018}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </points>
  )
}

// ── scene wrapper ─────────────────────────────────────────────────────────────

interface SceneProps {
  formed: boolean
  reducedMotion: boolean
  isTouch: boolean
}

function Scene({ formed, reducedMotion, isTouch }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: false, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ParticleField
        formed={formed}
        reducedMotion={reducedMotion}
        isTouch={isTouch}
      />
    </Canvas>
  )
}

// Lazy-mount: the Canvas is heavy (WebGL context) — only instantiate when in-view
const LazyScene = dynamic(() => Promise.resolve(Scene), { ssr: false })

// ── exported band component ───────────────────────────────────────────────────

export function ParticleMonogram() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [formed, setFormed] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [reducedMotion, setReducedMotion] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  // Detect client capabilities on mount
  useEffect(() => {
    setMounted(true)
    const reduced = prefersReducedMotion()
    const touch = isCoarsePointer() || "ontouchstart" in window
    setReducedMotion(reduced)
    setIsTouch(touch)
  }, [])

  // IntersectionObserver: triggers formed state + pauses Canvas when off-screen
  const observerRef = useRef<IntersectionObserver | null>(null)

  const setupObserver = useCallback((el: HTMLDivElement | null) => {
    if (!el) return
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting) setFormed(true)
      },
      { threshold: 0.2 }
    )
    observerRef.current.observe(el)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el || !mounted) return
    setupObserver(el)
    return () => observerRef.current?.disconnect()
  }, [mounted, setupObserver])

  return (
    <section
      ref={containerRef}
      aria-label={MONOGRAM_COPY.ariaLabel}
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(200px, 42vh, 480px)" }}
    >
      {/* hairline top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
      {/* hairline bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />

      {/* WebGL Canvas — lazy-mounted only when first scrolled into view */}
      {mounted && inView && (
        <div className="absolute inset-0">
          <LazyScene
            formed={formed}
            reducedMotion={reducedMotion}
            isTouch={isTouch}
          />
        </div>
      )}

      {/* Reduced-motion / SSR fallback: plain typeset name */}
      {(!mounted || reducedMotion) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="font-sans font-light italic text-foreground/60 select-none"
            style={{ fontSize: "clamp(2rem, 8vw, 6rem)", letterSpacing: "-0.02em" }}
          >
            {MONOGRAM_COPY.text}
          </span>
        </div>
      )}

      {/* Screen-reader text */}
      <span className="sr-only">{MONOGRAM_COPY.ariaLabel}</span>
    </section>
  )
}
