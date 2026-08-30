"use client"

import { useEffect } from "react"

export function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    }
    // This effect runs after hydration, which — on a normally-loaded page —
    // is usually AFTER the window "load" event has already fired. Attaching a
    // "load" listener then would never fire, so the SW would never register.
    // Register immediately if the page is already loaded; otherwise wait for it
    // (still deferring past the initial load on a slow first paint).
    if (document.readyState === "complete") {
      register()
      return
    }
    window.addEventListener("load", register, { once: true })
    return () => window.removeEventListener("load", register)
  }, [])
  return null
}
