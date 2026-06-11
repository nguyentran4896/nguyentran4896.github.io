"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { Marker, Globe } from "cobe"

import { contactGlobe as GLOBE_COPY } from "@/lib/content"

// Timezone → approximate [lat, lng] for visitor marker.
// ~40 major zones; unknown zones are silently skipped.
const TIMEZONE_COORDS: Record<string, [number, number]> = {
  "America/New_York": [40.712, -74.006],
  "America/Chicago": [41.878, -87.629],
  "America/Denver": [39.739, -104.984],
  "America/Los_Angeles": [34.052, -118.243],
  "America/Anchorage": [61.217, -149.9],
  "America/Honolulu": [21.305, -157.857],
  "America/Toronto": [43.653, -79.383],
  "America/Vancouver": [49.282, -123.12],
  "America/Sao_Paulo": [-23.55, -46.633],
  "America/Buenos_Aires": [-34.603, -58.381],
  "America/Mexico_City": [19.432, -99.133],
  "America/Bogota": [4.710, -74.072],
  "America/Lima": [-12.046, -77.042],
  "America/Santiago": [-33.458, -70.647],
  "Europe/London": [51.507, -0.127],
  "Europe/Paris": [48.856, 2.352],
  "Europe/Berlin": [52.52, 13.404],
  "Europe/Madrid": [40.416, -3.703],
  "Europe/Rome": [41.902, 12.496],
  "Europe/Amsterdam": [52.377, 4.9],
  "Europe/Stockholm": [59.332, 18.065],
  "Europe/Warsaw": [52.229, 21.012],
  "Europe/Kyiv": [50.45, 30.523],
  "Europe/Moscow": [55.755, 37.617],
  "Europe/Istanbul": [41.015, 28.979],
  "Asia/Tokyo": [35.689, 139.691],
  "Asia/Seoul": [37.566, 126.977],
  "Asia/Shanghai": [31.228, 121.474],
  "Asia/Hong_Kong": [22.319, 114.169],
  "Asia/Singapore": [1.352, 103.819],
  "Asia/Bangkok": [13.756, 100.501],
  "Asia/Jakarta": [-6.208, 106.845],
  "Asia/Ho_Chi_Minh": [10.776, 106.700],
  "Asia/Kolkata": [28.613, 77.209],
  "Asia/Dubai": [25.204, 55.270],
  "Asia/Riyadh": [24.688, 46.722],
  "Asia/Tehran": [35.689, 51.388],
  "Africa/Nairobi": [-1.286, 36.817],
  "Africa/Lagos": [6.524, 3.379],
  "Africa/Cairo": [30.044, 31.235],
  "Australia/Sydney": [-33.868, 151.207],
  "Australia/Melbourne": [-37.813, 144.963],
  "Pacific/Auckland": [-36.866, 174.769],
}

// Hex color → cobe [r, g, b] 0-1 float tuple
function hex2rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "")
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  return [r, g, b]
}

const SAIGON: [number, number] = [10.776, 106.700]
// accent #3B5CFF
const ACCENT_RGB = hex2rgb("3B5CFF")
// dim gray for visitor marker
const VISITOR_RGB: [number, number, number] = [0.42, 0.42, 0.42]

function getVisitorCoords(): [number, number] | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return TIMEZONE_COORDS[tz] ?? null
  } catch {
    return null
  }
}

export function ContactGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<Globe | null>(null)
  const phiRef = useRef(2.2) // start slightly offset from prime meridian toward Saigon
  const rafRef = useRef<number | undefined>(undefined)
  const runningRef = useRef(false)
  const [mounted, setMounted] = useState(false)
  // pointer drag state
  const isDragging = useRef(false)
  const lastX = useRef(0)
  // reducedMotion stored in a ref so the loop closure can read it without stale capture
  const reducedMotionRef = useRef(false)

  // Detect reduced motion — store in ref only, no state re-render needed
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    reducedMotionRef.current = mq.matches
    const handler = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const stopLoop = useCallback(() => {
    if (rafRef.current !== undefined) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = undefined
    }
    runningRef.current = false
  }, [])

  const startLoop = useCallback(() => {
    if (runningRef.current) return
    runningRef.current = true
    const loop = () => {
      if (!runningRef.current) return
      if (!isDragging.current && !reducedMotionRef.current) {
        phiRef.current += 0.003
      }
      globeRef.current?.update({ phi: phiRef.current })
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [])

  // Intersection observer — pause when off screen, resume when in view
  useEffect(() => {
    if (!mounted) return
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startLoop()
        } else {
          stopLoop()
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [mounted, startLoop, stopLoop])

  // Lazy-init globe when the container first enters the viewport
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true)
          obs.disconnect()
        }
      },
      { rootMargin: "200px" }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Create globe once mounted
  useEffect(() => {
    if (!mounted) return
    const canvas = canvasRef.current
    if (!canvas) return

    // Dynamically import cobe to keep it out of the initial bundle
    let destroyed = false
    import("cobe").then(({ default: createGlobe }) => {
      if (destroyed || !canvas) return

      const visitorCoords = getVisitorCoords()
      const isVisitorSaigon =
        visitorCoords &&
        Math.abs(visitorCoords[0] - SAIGON[0]) < 0.5 &&
        Math.abs(visitorCoords[1] - SAIGON[1]) < 0.5

      const markers: Marker[] = [
        { location: SAIGON, size: 0.05, color: ACCENT_RGB },
        ...(visitorCoords && !isVisitorSaigon
          ? [{ location: visitorCoords, size: 0.03, color: VISITOR_RGB }]
          : []),
      ]

      const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2)
      const SIZE = 280

      globeRef.current = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: SIZE * dpr,
        height: SIZE * dpr,
        phi: phiRef.current,
        theta: 0.18,
        dark: 1,
        diffuse: 0.4,
        mapSamples: 16000,
        mapBrightness: 1.6,
        baseColor: [0.16, 0.16, 0.16],
        markerColor: ACCENT_RGB,
        glowColor: [0.12, 0.12, 0.14],
        markers,
        opacity: 0.95,
      })
      startLoop()
    })

    return () => {
      destroyed = true
      stopLoop()
      globeRef.current?.destroy()
      globeRef.current = null
    }
  }, [mounted, startLoop, stopLoop])

  // Pointer drag
  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    lastX.current = e.clientX
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastX.current
    phiRef.current -= dx * 0.005
    lastX.current = e.clientX
  }
  const onPointerUp = () => {
    isDragging.current = false
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center gap-3 select-none"
      aria-hidden="true"
    >
      {/* Eyebrow */}
      <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
        {GLOBE_COPY.eyebrow}
      </span>

      {/* Globe canvas */}
      <div
        className="relative w-[280px] h-[280px] cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {mounted ? (
          <canvas
            ref={canvasRef}
            style={{ width: 280, height: 280 }}
            className="rounded-none"
          />
        ) : (
          // Placeholder while not yet in view — matches globe dimensions
          <div className="w-[280px] h-[280px] rounded-none border border-white/10 bg-transparent" />
        )}
      </div>

      {/* Caption */}
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground text-center">
        {GLOBE_COPY.caption}
      </span>
    </div>
  )
}
