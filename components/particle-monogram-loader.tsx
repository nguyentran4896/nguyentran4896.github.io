"use client"

// Client boundary: next/dynamic with ssr:false is only valid inside a client component.
import dynamic from "next/dynamic"

const ParticleMonogramDynamic = dynamic(
  () =>
    import("@/components/particle-monogram").then((m) => m.ParticleMonogram),
  { ssr: false }
)

export function ParticleMonogramLoader() {
  return <ParticleMonogramDynamic />
}
