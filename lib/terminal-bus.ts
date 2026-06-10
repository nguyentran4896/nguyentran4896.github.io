// Tiny event bus so the navbar chip, the Konami easter egg, and any other
// trigger can open the console without importing the (heavier) console
// component or its command registry. Keeps those units decoupled.

export const TERMINAL_EVENT = "portfolio:terminal-toggle"

/** Toggle the interactive console open/closed. No-op during SSR. */
export function toggleTerminal() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(TERMINAL_EVENT))
}
