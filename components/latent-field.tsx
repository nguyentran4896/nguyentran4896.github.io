"use client"

import { latentField as copy } from "@/lib/content"
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from "react"
import { motion } from "framer-motion"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMesh = any

// ─── PRNG ────────────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ─── CPPN weight generator ───────────────────────────────────────────────────

interface CPPNWeights {
  seed: number
  // Layer weight arrays flattened: each entry is [rows, cols, flat_data]
  layers: Float32Array[]
  biases: Float32Array[]
}

// Architecture: 8 → 16 → 16 → 16 → 16 → 3
// dims[i] → dims[i+1] is layer i; 5 layers total
const ARCH_DIMS = [8, 16, 16, 16, 16, 3]

function generateWeights(seed: number): CPPNWeights {
  const rand = mulberry32(seed)
  const layers: Float32Array[] = []
  const biases: Float32Array[] = []

  for (let l = 0; l < ARCH_DIMS.length - 1; l++) {
    const inDim = ARCH_DIMS[l]
    const outDim = ARCH_DIMS[l + 1]
    const scale = Math.sqrt(2.0 / inDim) // He init for tanh
    const w = new Float32Array(inDim * outDim)
    for (let i = 0; i < w.length; i++) {
      // Box-Muller normal approximation
      const u = rand() + 1e-10
      const v = rand() + 1e-10
      w[i] = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * scale
    }
    layers.push(w)

    const b = new Float32Array(outDim)
    for (let i = 0; i < b.length; i++) {
      b[i] = (rand() - 0.5) * 0.1
    }
    biases.push(b)
  }

  return { seed, layers, biases }
}

function newSeed(): number {
  return Math.floor(Math.random() * 0xffffffff)
}

// ─── Fragment shader (fullscreen quad CPPN) ──────────────────────────────────
// Implements the CPPN entirely on the GPU with hardcoded dims matching ARCH_DIMS.
// Weights are passed as uniform arrays.

function buildFragmentShader(): string {
  return /* glsl */ `
precision highp float;

varying vec2 vUv;

// Time & cursor
uniform float uTime;
uniform vec2  uCursor;      // -1..1 NDC; vec2(9999) if no fine pointer
uniform bool  uStaticMode;  // prefers-reduced-motion → single frame

// Layer 0: 8 → 16
uniform float uW0[128]; // 8*16
uniform float uB0[16];
// Layer 1: 16 → 16
uniform float uW1[256]; // 16*16
uniform float uB1[16];
// Layer 2: 16 → 16
uniform float uW2[256];
uniform float uB2[16];
// Layer 3: 16 → 16
uniform float uW3[256];
uniform float uB3[16];
// Layer 4: 16 → 3
uniform float uW4[48]; // 16*3
uniform float uB4[3];

float tanhAct(float x) {
  // Accurate tanh
  float e2 = exp(clamp(2.0 * x, -20.0, 20.0));
  return (e2 - 1.0) / (e2 + 1.0);
}

// Dense layer: inDim → outDim; result written to out[]
// We manually unroll the two supported sizes via macros.

#define DENSE16x16(wArr, bArr, inp, out) { \
  for (int _j = 0; _j < 16; _j++) { \
    float _s = bArr[_j]; \
    for (int _i = 0; _i < 16; _i++) { _s += wArr[_i * 16 + _j] * inp[_i]; } \
    out[_j] = tanhAct(_s); \
  } \
}

#define DENSE8x16(wArr, bArr, inp, out) { \
  for (int _j = 0; _j < 16; _j++) { \
    float _s = bArr[_j]; \
    for (int _i = 0; _i < 8; _i++) { _s += wArr[_i * 16 + _j] * inp[_i]; } \
    out[_j] = tanhAct(_s); \
  } \
}

#define DENSE16x3(wArr, bArr, inp, out) { \
  for (int _j = 0; _j < 3; _j++) { \
    float _s = bArr[_j]; \
    for (int _i = 0; _i < 16; _i++) { _s += wArr[_i * 3 + _j] * inp[_i]; } \
    out[_j] = tanhAct(_s); \
  } \
}

// Smooth stepped isoline: f is the field value, t is the isoline target, w is half-width
float isoline(float f, float t, float w) {
  return 1.0 - smoothstep(0.0, w, abs(f - t));
}

void main() {
  // Pixel coords in [-1, 1]
  vec2 uv = (vUv - 0.5) * 2.0;
  float radius = length(uv);

  // Latent z: slow drift in time + subtle cursor bias (fine pointer only)
  float t = uStaticMode ? 0.0 : uTime * 0.08;
  vec2 cur = (uCursor.x > 9000.0) ? vec2(0.0) : uCursor * 0.15;

  float z0 = sin(t * 0.71 + 0.0) + cur.x;
  float z1 = cos(t * 0.53 + 1.3) + cur.y;
  float z2 = sin(t * 0.37 + 2.7);
  float z3 = cos(t * 0.29 + 4.1);

  // Input vector: [x, y, radius, z0..z3, sin(radius*4)]
  float inp0[8];
  inp0[0] = uv.x;
  inp0[1] = uv.y;
  inp0[2] = radius;
  inp0[3] = z0;
  inp0[4] = z1;
  inp0[5] = z2;
  inp0[6] = z3;
  inp0[7] = sin(radius * 4.0);

  // Forward pass
  float h0[16]; DENSE8x16(uW0, uB0, inp0, h0);
  float h1[16]; DENSE16x16(uW1, uB1, h0, h1);
  float h2[16]; DENSE16x16(uW2, uB2, h1, h2);
  float h3[16]; DENSE16x16(uW3, uB3, h2, h3);
  float out0[3]; DENSE16x3(uW4, uB4, h3, out0);

  // Map output[0] to a scalar field in [0,1]
  float field = out0[0] * 0.5 + 0.5;

  // Near-monochrome ink ramp: dark grays on #1A1A1A
  // Base luminance: very dark to slightly lighter mid-gray
  float lum = mix(0.06, 0.36, field);
  vec3 color = vec3(lum);

  // Isoline bands at regular intervals — picked out in accent blue #3B5CFF
  // plus very thin hairline whites for topographic etching feel
  float accentR = 0.231, accentG = 0.361, accentB = 1.0;
  vec3 accentCol = vec3(accentR, accentG, accentB);

  // Spacing: 0.1 gives ~10 band levels across the field
  float bandSpacing = 0.12;
  float bandPhase = mod(field, bandSpacing) / bandSpacing; // 0..1 within each band
  // Thin hairline at each interval — white
  float hairline = isoline(bandPhase, 0.0, 0.04) * 0.55;
  // Accent isoline at every 3rd band: field ≈ 0.36, 0.72
  float accentBand = isoline(field, 0.36, 0.018) + isoline(field, 0.72, 0.018);
  accentBand = clamp(accentBand, 0.0, 1.0) * 0.9;

  color += hairline * vec3(0.6); // subtle white hairlines
  color = mix(color, accentCol, accentBand);  // accent isolines

  // Vignette: darken edges
  float vig = 1.0 - smoothstep(0.6, 1.5, radius);
  color *= vig;

  // Clamp
  color = clamp(color, 0.0, 1.0);

  gl_FragColor = vec4(color, 1.0);
}
`
}

// ─── Fullscreen quad scene ───────────────────────────────────────────────────

interface QuadProps {
  weights: CPPNWeights
  cursor: [number, number]
  staticMode: boolean
  onFirstFrame: () => void
}

function CPPNQuad({ weights, cursor, staticMode, onFirstFrame }: QuadProps) {
  const meshRef = useRef<AnyMesh>(null)
  const firedRef = useRef(false)
  useThree() // ensure canvas context is available

  const fragmentShader = useMemo(() => buildFragmentShader(), [])

  const vertexShader = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `

  // Build uniforms from weights
  const uniforms = useMemo(() => {
    const { layers, biases } = weights
    return {
      uTime: { value: 0 },
      uCursor: { value: [cursor[0], cursor[1]] },
      uStaticMode: { value: staticMode },
      uW0: { value: layers[0] },
      uB0: { value: biases[0] },
      uW1: { value: layers[1] },
      uB1: { value: biases[1] },
      uW2: { value: layers[2] },
      uB2: { value: biases[2] },
      uW3: { value: layers[3] },
      uB3: { value: biases[3] },
      uW4: { value: layers[4] },
      uB4: { value: biases[4] },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weights])

  // Update cursor & time each frame
  useFrame((_, delta) => {
    if (!meshRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mat = meshRef.current.material as any
    if (!staticMode) {
      mat.uniforms.uTime.value += delta
    }
    mat.uniforms.uCursor.value = cursor
    mat.uniforms.uStaticMode.value = staticMode

    if (!firedRef.current) {
      firedRef.current = true
      onFirstFrame()
    }
  })

  return (
    <mesh ref={meshRef}>
      {/* Use a simple plane; vertex shader maps it to full-clip-space */}
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Inner canvas wrapper (lazy-mounted) ─────────────────────────────────────

interface CanvasInnerProps {
  weights: CPPNWeights
  cursor: [number, number]
  staticMode: boolean
  frameloop: "always" | "never"
  onFirstFrame: () => void
}

function CanvasInner({
  weights,
  cursor,
  staticMode,
  frameloop,
  onFirstFrame,
}: CanvasInnerProps) {
  return (
    <Canvas
      frameloop={frameloop}
      dpr={[1, 2]}
      gl={{ antialias: false, alpha: false }}
      style={{ display: "block" }}
      camera={{ near: 0.1, far: 10, position: [0, 0, 1] }}
    >
      <Suspense fallback={null}>
        <CPPNQuad
          weights={weights}
          cursor={cursor}
          staticMode={staticMode}
          onFirstFrame={onFirstFrame}
        />
      </Suspense>
    </Canvas>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

export default function LatentField() {
  const [weights, setWeights] = useState<CPPNWeights | null>(null)
  const [inView, setInView] = useState(false)
  const [staticMode, setStaticMode] = useState(false)
  const [firstFrameDone, setFirstFrameDone] = useState(false)
  const [cursor, setCursor] = useState<[number, number]>([9999, 9999])
  const [isFinePointer, setIsFinePointer] = useState(false)

  const sectionRef = useRef<HTMLElement>(null)
  const canvasWrapRef = useRef<HTMLDivElement>(null)

  // Reduced-motion detection
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setStaticMode(mq.matches)
    const handler = () => setStaticMode(mq.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // Fine pointer detection
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)")
    setIsFinePointer(mq.matches)
    const handler = () => setIsFinePointer(mq.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // Generate initial weights on mount
  useEffect(() => {
    setWeights(generateWeights(newSeed()))
  }, [])

  // IntersectionObserver — lazy-mount canvas and pause when off-screen
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Cursor tracking — only for fine pointers, relative to canvas
  useEffect(() => {
    if (!isFinePointer) return
    const wrap = canvasWrapRef.current
    if (!wrap) return

    const handleMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect()
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1
      setCursor([nx, ny])
    }

    const handleLeave = () => setCursor([9999, 9999])

    wrap.addEventListener("mousemove", handleMove)
    wrap.addEventListener("mouseleave", handleLeave)
    return () => {
      wrap.removeEventListener("mousemove", handleMove)
      wrap.removeEventListener("mouseleave", handleLeave)
    }
  }, [isFinePointer])

  const handleReroll = useCallback(() => {
    setFirstFrameDone(false)
    setWeights(generateWeights(newSeed()))
  }, [])

  const handleFirstFrame = useCallback(() => {
    setFirstFrameDone(true)
  }, [])

  // frameloop control: pause when out of view or after single static frame
  const frameloop: "always" | "never" = useMemo(() => {
    if (!inView) return "never"
    if (staticMode && firstFrameDone) return "never"
    return "always"
  }, [inView, staticMode, firstFrameDone])

  const seedHex = weights
    ? `0x${(weights.seed >>> 0).toString(16).toUpperCase().padStart(8, "0")}`
    : "0x--------"

  return (
    <section
      id="latent-space"
      ref={sectionRef}
      className="relative px-8 md:px-12 py-32 md:py-40"
    >
      {/* Hairline top divider */}
      <div className="absolute top-0 left-8 right-8 md:left-12 md:right-12 h-px bg-white/10" />

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12 md:mb-16"
      >
        <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4 uppercase">
          {copy.eyebrow}
        </p>
        <h2 className="font-sans text-3xl md:text-5xl font-light italic">
          {copy.heading}
        </h2>
      </motion.div>

      {/* Canvas container — lazy-mounts when in view */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <div
          ref={canvasWrapRef}
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: "16/9", borderRadius: "0px" }}
        >
          {/* Placeholder while canvas has not mounted / weights loading */}
          {(!inView || !weights) && (
            <div className="absolute inset-0 bg-background border border-white/10 flex items-center justify-center">
              <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                Loading field&hellip;
              </span>
            </div>
          )}

          {/* Canvas — only rendered in-view with weights ready */}
          {inView && weights && (
            <div className="absolute inset-0">
              <CanvasInner
                weights={weights}
                cursor={cursor}
                staticMode={staticMode}
                frameloop={frameloop}
                onFirstFrame={handleFirstFrame}
              />
            </div>
          )}

          {/* Hairline border overlay */}
          <div className="absolute inset-0 border border-white/10 pointer-events-none" />
        </div>

        {/* Caption row */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Seed + description */}
          <div className="space-y-1">
            <p className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
              {copy.captionPrefix} {seedHex} {copy.captionSuffix}
            </p>
            <p className="font-mono text-[10px] tracking-[0.2em] text-white/20 uppercase">
              {copy.subCaption}
            </p>
          </div>

          {/* Reroll button — outlined pill per design system */}
          <button
            onClick={handleReroll}
            className="self-start sm:self-auto inline-flex items-center gap-2 border border-white/20 rounded-full px-5 py-2 font-mono text-xs tracking-[0.2em] uppercase text-foreground transition-colors duration-500 ease-out hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Regenerate CPPN weights with a new random seed"
          >
            {copy.rerollLabel}
          </button>
        </div>
      </motion.div>

      {/* Hairline bottom divider */}
      <div className="absolute bottom-0 left-8 right-8 md:left-12 md:right-12 h-px bg-white/10" />
    </section>
  )
}
