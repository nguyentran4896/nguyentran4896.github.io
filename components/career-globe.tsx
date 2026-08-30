"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useScroll } from "framer-motion"
import { REDUCED_MOTION_QUERY, isCoarsePointer } from "@/lib/media"

// copy — consolidate into lib/content.ts — a later integration agent migrates it
const GLOBE_COPY = {
  caption: "HCM CITY ↔ SYDNEY — REMOTE",
  captionSub: "EMPLOYMENT HERO — DISTRIBUTED TEAM",
}

// Geographic data — Ho Chi Minh City (VNG/HCMUT) and Sydney (Employment Hero)
const HCMC = { lat: 10.8231, lng: 106.6297 }
const SYDNEY = { lat: -33.8688, lng: 151.2093 }

const ARC_DATA = [
  {
    startLat: HCMC.lat,
    startLng: HCMC.lng,
    endLat: SYDNEY.lat,
    endLng: SYDNEY.lng,
  },
]

const POINT_DATA = [
  { lat: HCMC.lat, lng: HCMC.lng, radius: 0.45, color: "#3B5CFF" },
  { lat: SYDNEY.lat, lng: SYDNEY.lng, radius: 0.35, color: "#FAFAFA" },
]

const RING_DATA = [{ lat: HCMC.lat, lng: HCMC.lng }]

interface ScrollRef {
  get: () => number
}

interface GlobeSceneProps {
  reducedMotion: boolean
  scrollYProgress: ScrollRef
}

function GlobeScene({ reducedMotion, scrollYProgress }: GlobeSceneProps) {
   
  const globeRef = useRef<any>(null)
  const { scene } = useThree()
  const readyRef = useRef(false)

  const initGlobe = useCallback(async () => {
    // Lazy imports — keep heavy deps out of first paint
    const THREE = await import("three")
    const { default: ThreeGlobe } = await import("three-globe")
    const { feature } = await import("topojson-client")
    const worldAtlas = await import("world-atlas/countries-110m.json")

    // Build GeoJSON features from TopoJSON
     
    const topo = worldAtlas as any
     
    const countries = feature(topo, topo.objects.countries) as any

    const globe = new ThreeGlobe({ waitForGlobeReady: true, animateIn: false })
    globe.showGlobe(true)
    globe.showAtmosphere(false)
    globe.showGraticules(false)

    // Hex polygon layer — countries as gray hex dots
    globe.hexPolygonsData(countries.features)
     
    globe.hexPolygonGeoJsonGeometry((d: any) => d.geometry)
    globe.hexPolygonColor(() => "#2A2A2A")
    globe.hexPolygonResolution(3)
    globe.hexPolygonMargin(0.4)
    globe.hexPolygonAltitude(0.005)
    globe.hexPolygonsTransitionDuration(0)

    // Point markers
    globe.pointsData(POINT_DATA)
    globe.pointLat("lat")
    globe.pointLng("lng")
    globe.pointColor("color")
    globe.pointRadius("radius")
    globe.pointAltitude(0.01)
    globe.pointsTransitionDuration(0)

    // Dashed arc HCMC → Sydney in accent blue
    globe.arcsData(ARC_DATA)
    globe.arcStartLat("startLat")
    globe.arcStartLng("startLng")
    globe.arcEndLat("endLat")
    globe.arcEndLng("endLng")
    globe.arcColor(() => "#3B5CFF")
    globe.arcAltitude(0.35)
    globe.arcStroke(0.5)
    globe.arcDashLength(0.4)
    globe.arcDashGap(0.2)
    globe.arcDashAnimateTime(reducedMotion ? 0 : 2000)
    globe.arcsTransitionDuration(0)

    // Ripple rings on HCMC — disabled when reduced motion
    if (!reducedMotion) {
      globe.ringsData(RING_DATA)
      globe.ringLat("lat")
      globe.ringLng("lng")
       
      globe.ringColor(() => (t: any) => `rgba(59,92,255,${1 - t})`)
      globe.ringMaxRadius(3)
      globe.ringPropagationSpeed(1.5)
      globe.ringRepeatPeriod(1200)
      globe.ringAltitude(0.01)
    }

    // Near-invisible dark sphere surface — flat, no shadows, matches bg
    const material = new THREE.MeshBasicMaterial({
      color: 0x1a1a1a,
      transparent: true,
      opacity: 0.88,
    })
    globe.globeMaterial(material)

    globe.onGlobeReady(() => {
      readyRef.current = true
    })

    // Orient to center the Asia-Pacific corridor
    globe.rotation.y = -Math.PI * 0.25

    scene.add(globe)
    globeRef.current = globe

    return () => {
      scene.remove(globe)
    }
  }, [reducedMotion, scene])

  useEffect(() => {
    let cancelled = false
    let cleanup: (() => void) | undefined
    initGlobe().then((fn) => {
      cleanup = fn
      // If we unmounted (or deps changed) while the lazy imports were still
      // resolving, `scene.add(globe)` ran after teardown. Remove it now so the
      // globe — with its running arc/ring animations — isn't left orphaned in
      // the scene, holding memory and animating invisibly.
      if (cancelled) cleanup?.()
    })
    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [initGlobe])

  useFrame((_, delta) => {
    if (!globeRef.current || !readyRef.current) return
    if (reducedMotion) return

    // Slow idle rotation around Y axis
    globeRef.current.rotation.y += delta * 0.06

    // Subtle scroll-linked tilt — read framer-motion scroll value each frame
    const t = scrollYProgress.get()
    globeRef.current.rotation.x = t * 0.35 - 0.08
  })

  return null
}

interface CareerGlobeCanvasProps {
  reducedMotion: boolean
  scrollYProgress: ScrollRef
}

function CareerGlobeCanvas({ reducedMotion, scrollYProgress }: CareerGlobeCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 260], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.5} />
      <GlobeScene reducedMotion={reducedMotion} scrollYProgress={scrollYProgress} />
    </Canvas>
  )
}

interface CareerGlobeProps {
  className?: string
}

export function CareerGlobe({ className = "" }: CareerGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  useEffect(() => {
    setMounted(true)

    // Detect reduced motion preference — mirrors custom-cursor.tsx pattern
    const mq = window.matchMedia(REDUCED_MOTION_QUERY)
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener("change", handler)

    // Disable pointer-driven effects on touch devices
    const coarse = isCoarsePointer()
    if (coarse || "ontouchstart" in window) setIsTouch(true)

    return () => mq.removeEventListener("change", handler)
  }, [])

  // Pause when off-screen — IntersectionObserver
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin: "120px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (!mounted) {
    return (
      <div className={`relative flex flex-col items-center ${className}`}>
        <div style={{ height: "380px" }} className="w-full flex items-center justify-center">
          <div className="w-40 h-40 rounded-full border border-white/10" />
        </div>
      </div>
    )
  }

  return (
    <div ref={sectionRef} className={`relative flex flex-col items-center ${className}`}>
      {/* Globe canvas — paused off-screen, DPR capped at 2 */}
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: "380px" }}
        role="img"
        aria-label="Globe showing connection between Ho Chi Minh City and Sydney"
      >
        {isInView && !isTouch && (
          <CareerGlobeCanvas
            reducedMotion={reducedMotion}
            scrollYProgress={scrollYProgress}
          />
        )}

        {/* Touch fallback — static city pair visual */}
        {isTouch && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-36 h-36 rounded-full border border-white/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-accent" />
              </div>
              <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground text-center">
                {GLOBE_COPY.caption}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mono caption — Geist Mono, uppercase, wide-tracked, muted */}
      <div className="mt-4 text-center space-y-1.5">
        <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-muted-foreground">
          {GLOBE_COPY.caption}
        </p>
        <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-muted-foreground">
          {GLOBE_COPY.captionSub}
        </p>
      </div>
    </div>
  )
}
