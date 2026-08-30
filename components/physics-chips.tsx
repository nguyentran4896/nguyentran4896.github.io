"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { tech, physicsChips as COPY } from "@/lib/content"
import { prefersReducedMotion, isCoarsePointer } from "@/lib/media"

// Cap at 18 chips
const TECH_ITEMS = [...tech.techItems, ...tech.concepts].slice(0, 18)

// Index of the single chip that gets the accent outline (pick a deliberate one)
const ACCENT_INDEX = 0

// ─── Static chip row (touch / reduced-motion / below-lg) ──────────────────────
function StaticChips() {
  return (
    <div className="flex flex-wrap gap-2">
      {TECH_ITEMS.map((label, i) => (
        <span
          key={label}
          className={
            "font-mono text-[10px] uppercase tracking-[0.25em] px-3 py-1.5 rounded-full " +
            (i === ACCENT_INDEX
              ? "border border-accent text-accent-text"
              : "border border-white/20 text-muted-foreground")
          }
        >
          {label}
        </span>
      ))}
    </div>
  )
}

// ─── Physics chip canvas ───────────────────────────────────────────────────────
function PhysicsChipsCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chipRefs = useRef<(HTMLDivElement | null)[]>([])
  const engineRef = useRef<unknown>(null)
  const rafRef = useRef<number | null>(null)
  const bodiesRef = useRef<unknown[]>([])
  const mouseConstraintRef = useRef<unknown>(null)
  const runnerRef = useRef<unknown>(null)
  const pointerHandlerRef = useRef<(() => void) | null>(null)
  const teardownRef = useRef<(() => void) | null>(null)
  const isInViewRef = useRef(false)
  const isIdleRef = useRef(false)
  const lastInteractionRef = useRef(Date.now())
  const IDLE_TIMEOUT = 3000

  // Spawn / reset the pile
  const spawnPile = useCallback(async () => {
    const container = containerRef.current
    if (!container) return

    const Matter = (await import("matter-js")).default
    const { Engine, Runner, Bodies, Body, World, MouseConstraint, Mouse } = Matter

    const W = container.clientWidth
    const H = container.clientHeight
    const DPR = Math.min(window.devicePixelRatio ?? 1, 2)

    // Clean up previous run
    if (engineRef.current) {
      const oldEngine = engineRef.current as ReturnType<typeof Engine.create>
      World.clear(oldEngine.world, false)
      Engine.clear(oldEngine)
    }
    if (runnerRef.current) {
      const oldRunner = runnerRef.current as ReturnType<typeof Runner.create>
      Runner.stop(oldRunner)
    }
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    const engine = Engine.create({ gravity: { x: 0, y: 1.5 } })
    engineRef.current = engine

    const runner = Runner.create()
    runnerRef.current = runner

    // Walls: floor, left, right, ceiling
    const wallThick = 60
    const walls = [
      Bodies.rectangle(W / 2, H + wallThick / 2, W + wallThick * 2, wallThick, { isStatic: true, label: "floor" }),
      Bodies.rectangle(-wallThick / 2, H / 2, wallThick, H * 2, { isStatic: true, label: "wall-left" }),
      Bodies.rectangle(W + wallThick / 2, H / 2, wallThick, H * 2, { isStatic: true, label: "wall-right" }),
      Bodies.rectangle(W / 2, -wallThick / 2, W + wallThick * 2, wallThick, { isStatic: true, label: "ceiling" }),
    ]
    World.add(engine.world, walls)

    // Measure chip DOM elements, create matching bodies
    const chips = chipRefs.current
    const newBodies: ReturnType<typeof Bodies.rectangle>[] = []

    for (let i = 0; i < TECH_ITEMS.length; i++) {
      const el = chips[i]
      if (!el) continue

      const chipW = el.offsetWidth || 80
      const chipH = el.offsetHeight || 28

      // Drop from a random x near top
      const spawnX = chipW / 2 + Math.random() * (W - chipW)
      const spawnY = -chipH - Math.random() * H * 0.5

      const body = Bodies.rectangle(spawnX, spawnY, chipW, chipH, {
        restitution: 0.3,
        friction: 0.4,
        frictionAir: 0.025,
        chamfer: { radius: chipH / 2 },
        label: `chip-${i}`,
      })

      Body.setAngle(body, (Math.random() - 0.5) * 0.6)
      newBodies.push(body)
    }

    World.add(engine.world, newBodies)
    bodiesRef.current = newBodies

    // Mouse constraint
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = W * DPR
      canvas.height = H * DPR
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`

      const mouse = Mouse.create(canvas)
      // Fix DPR offset
      mouse.pixelRatio = DPR
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.3, render: { visible: false } },
      })
      World.add(engine.world, mouseConstraint)
      mouseConstraintRef.current = mouseConstraint

      // Wake on pointer interaction. Remove any handler left by a previous
      // spawn before adding a new one — the canvas element persists across
      // resets / scroll-resumes, so re-adding would leak listeners.
      if (pointerHandlerRef.current) {
        canvas.removeEventListener("pointerdown", pointerHandlerRef.current)
      }
      const onPointerDown = () => {
        lastInteractionRef.current = Date.now()
        isIdleRef.current = false
        if (!rafRef.current) startLoop()
      }
      pointerHandlerRef.current = onPointerDown
      canvas.addEventListener("pointerdown", onPointerDown)
    }

    isIdleRef.current = false
    lastInteractionRef.current = Date.now()

    Runner.run(runner, engine)

    // Expose a teardown that stops matter-js's own runner loop (it steps the
    // engine on an internal rAF and would otherwise keep running forever after
    // unmount) and releases the engine. Called from the unmount effect.
    teardownRef.current = () => {
      Runner.stop(runner)
      World.clear(engine.world, false)
      Engine.clear(engine)
    }

    // rAF sync loop
    function startLoop() {
      if (!canvas) return
      const resolvedCanvas: HTMLCanvasElement = canvas
       
      const ctx = resolvedCanvas.getContext("2d")!
      if (!ctx) return

      function loop() {
        if (!isInViewRef.current) {
          rafRef.current = null
          return
        }

        // Check idle
        const timeSinceInteraction = Date.now() - lastInteractionRef.current
        const allSettled = newBodies.every((b) => {
          const body = b as { speed: number; angularSpeed: number }
          return body.speed < 0.1 && body.angularSpeed < 0.01
        })
        if (allSettled && timeSinceInteraction > IDLE_TIMEOUT) {
          isIdleRef.current = true
          rafRef.current = null
          return
        }

        ctx.clearRect(0, 0, resolvedCanvas.width, resolvedCanvas.height)

        // Sync DOM chips to physics bodies
        for (let i = 0; i < newBodies.length; i++) {
          const body = newBodies[i] as {
            position: { x: number; y: number }
            angle: number
          }
          const el = chips[i]
          if (!el) continue

          const chipW = el.offsetWidth
          const chipH = el.offsetHeight

          el.style.transform = `translate(${body.position.x - chipW / 2}px, ${body.position.y - chipH / 2}px) rotate(${body.angle}rad)`
          el.style.position = "absolute"
          el.style.top = "0"
          el.style.left = "0"
          el.style.willChange = "transform"
        }

        rafRef.current = requestAnimationFrame(loop)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    startLoop()
  }, [])

  // IntersectionObserver — spawn once on first view
  const hasSpawnedRef = useRef(false)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        isInViewRef.current = entry.isIntersecting

        if (entry.isIntersecting && !hasSpawnedRef.current) {
          hasSpawnedRef.current = true
          spawnPile()
        } else if (entry.isIntersecting && isIdleRef.current) {
          // Resume loop if scrolled back into view while idle
          isIdleRef.current = false
          lastInteractionRef.current = Date.now()
          spawnPile()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [spawnPile])

  // Cleanup on unmount: cancel our sync loop, detach the pointer listener, and
  // stop + clear the matter-js engine so it doesn't keep stepping (and holding
  // the whole component graph in memory) after the footer unmounts.
  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      const canvas = canvasRef.current
      if (canvas && pointerHandlerRef.current) {
        canvas.removeEventListener("pointerdown", pointerHandlerRef.current)
        pointerHandlerRef.current = null
      }
      teardownRef.current?.()
      teardownRef.current = null
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: 220 }}
      aria-label="Interactive tech chip pile — drag to throw"
    >
      {/* Transparent canvas captures mouse events for Matter */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
      />

      {/* DOM chips — positioned absolutely by the rAF loop */}
      {TECH_ITEMS.map((label, i) => (
        <div
          key={label}
          ref={(el) => { chipRefs.current[i] = el }}
          className={
            "absolute pointer-events-none select-none font-mono text-[10px] uppercase tracking-[0.25em] px-3 py-1.5 rounded-full whitespace-nowrap " +
            (i === ACCENT_INDEX
              ? "border border-accent text-accent-text bg-background"
              : "border border-white/20 text-muted-foreground bg-background")
          }
        >
          {label}
        </div>
      ))}

      {/* Reset button */}
      <button
        onClick={() => {
          hasSpawnedRef.current = false
          spawnPile()
        }}
        className="absolute top-2 right-2 z-20 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors duration-300 border border-white/10 hover:border-white/30 rounded-full px-2.5 py-1"
        aria-label="Reset chip pile"
      >
        {COPY.resetLabel}
      </button>
    </div>
  )
}

// ─── Exported component with progressive enhancement ──────────────────────────
export function PhysicsChips() {
  const [canUsePhysics, setCanUsePhysics] = useState<boolean | null>(null)

  useEffect(() => {
    const isCoarse = isCoarsePointer()
    const isReducedMotion = prefersReducedMotion()
    const isTouch = "ontouchstart" in window
    const isLargeEnough = window.innerWidth >= 1024 // lg breakpoint

    setCanUsePhysics(!isCoarse && !isReducedMotion && !isTouch && isLargeEnough)
  }, [])

  // During SSR / hydration: render static chips to avoid layout shift
  if (canUsePhysics === null) return <StaticChips />

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {COPY.eyebrow}
        </span>
      </div>
      {canUsePhysics ? <PhysicsChipsCanvas /> : <StaticChips />}
    </div>
  )
}
