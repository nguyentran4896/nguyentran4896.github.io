/**
 * Single source of truth for the media queries used across interactive
 * components. Centralised so the query strings can't drift (a typo in one
 * inline `matchMedia("...")` is a silent bug) and the intent is named.
 *
 * - Use the `*_QUERY` constants with `window.matchMedia(...)` when a component
 *   needs to subscribe to changes (add a "change" listener).
 * - Use the read-once helpers (`prefersReducedMotion()`, `isCoarsePointer()`)
 *   when a component only needs the current value inside an effect.
 *
 * All helpers are SSR-safe: they return `false` when `window` is undefined.
 */

/** User has asked the OS to minimise non-essential motion. */
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

/** Touch / stylus-style input with no reliable hover — used to disable
 *  hover-dependent and pointer-heavy interactions. */
export const COARSE_POINTER_QUERY = "(hover: none), (pointer: coarse)"

/** A precise pointer (mouse/trackpad) is available. */
export const FINE_POINTER_QUERY = "(pointer: fine)"

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches
}

export function isCoarsePointer(): boolean {
  return typeof window !== "undefined" && window.matchMedia(COARSE_POINTER_QUERY).matches
}

export function isFinePointer(): boolean {
  return typeof window !== "undefined" && window.matchMedia(FINE_POINTER_QUERY).matches
}
