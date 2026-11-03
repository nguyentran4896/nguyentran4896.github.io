"use client"

import { useEffect, useMemo, useRef, type MutableRefObject } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Color, MathUtils, type Mesh, type ShaderMaterial } from "three"

/**
 * The noise-displaced wireframe sphere from the original hero, recoloured for
 * Concierge: ink lines on paper, with the vermilion accent showing on the
 * crests. Pointer and scroll are read from refs owned by <HeroSphere>, so the
 * canvas itself can stay pointer-events-none behind the hero copy.
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vDisplacement;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;
    float noise = snoise(position * 1.5 + uTime * 0.15);
    float displacement = noise * 0.15;
    vDisplacement = displacement;
    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uAccent;
  uniform float uAlpha;
  varying float vDisplacement;

  void main() {
    // Crests (positive displacement) warm towards the accent; troughs stay ink.
    float crest = smoothstep(0.02, 0.13, vDisplacement);
    vec3 color = mix(uInk, uAccent, crest);
    float alpha = uAlpha * (0.6 + crest * 0.8);
    gl_FragColor = vec4(color, alpha);
  }
`

export type Pointer = { x: number; y: number }

function Sphere({
  ink,
  accent,
  alpha,
  detail,
  pointer,
}: {
  ink: string
  accent: string
  alpha: number
  detail: number
  pointer: MutableRefObject<Pointer>
}) {
  const meshRef = useRef<Mesh>(null)
  const materialRef = useRef<ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uInk: { value: new Color(ink) },
      uAccent: { value: new Color(accent) },
      uAlpha: { value: alpha },
    }),
    // Created once; colour changes (e.g. dark mode) are applied in the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => {
    const u = materialRef.current?.uniforms
    if (!u) return
    u.uInk.value.set(ink)
    u.uAccent.value.set(accent)
    u.uAlpha.value = alpha
  }, [ink, accent, alpha])

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05)
    if (materialRef.current) materialRef.current.uniforms.uTime.value += d
    const m = meshRef.current
    if (m) {
      m.rotation.y += d * 0.05
      m.rotation.x = MathUtils.lerp(m.rotation.x, pointer.current.y * 0.2, 0.05)
      m.rotation.z = MathUtils.lerp(m.rotation.z, pointer.current.x * 0.2, 0.05)
    }
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.8, detail]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        wireframe
      />
    </mesh>
  )
}

export function SentientSphere({
  ink,
  accent,
  alpha,
  detail,
  pointer,
  running,
}: {
  ink: string
  accent: string
  alpha: number
  detail: number
  pointer: MutableRefObject<Pointer>
  running: boolean
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      frameloop={running ? "always" : "demand"}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <Sphere ink={ink} accent={accent} alpha={alpha} detail={detail} pointer={pointer} />
    </Canvas>
  )
}
