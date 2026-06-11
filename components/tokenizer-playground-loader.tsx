"use client"

// Client boundary: next/dynamic with ssr:false is only valid inside a client component.
// This thin wrapper keeps the Server Component page.tsx clean.
import dynamic from "next/dynamic"

const TokenizerPlayground = dynamic(
  () =>
    import("@/components/tokenizer-playground").then(
      (mod) => mod.TokenizerPlayground
    ),
  { ssr: false }
)

export function TokenizerPlaygroundLoader() {
  return <TokenizerPlayground />
}
