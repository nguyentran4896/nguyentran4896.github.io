"use client"

import { createContext, useContext } from "react"
import type { Index } from "@/lib/ask"

export type AskCtx = { index: Index; open: (query?: string) => void }

export const AskContext = createContext<AskCtx | null>(null)

export function useAsk() {
  const ctx = useContext(AskContext)
  if (!ctx) throw new Error("useAsk must be used inside <AskProvider>")
  return ctx
}
