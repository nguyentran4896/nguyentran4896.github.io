"use client"

// Client boundary: next/dynamic with ssr:false is only valid inside a client component.
import dynamic from "next/dynamic"

const LatentField = dynamic(
  () => import("@/components/latent-field"),
  { ssr: false }
)

export function LatentFieldLoader() {
  return <LatentField />
}
