"use client"

/**
 * Swarm build: a crew of cursors builds each section of the page while the visitor reads it, then leaves the page
 * exactly as the HTML wrote it. The engine is public/crew.js (a byte copy of the swarm-build skill's crew.js, loaded
 * as a plain script); the styles are the "Swarm build" block in app/globals.css; the plans are below.
 *
 * Credit: the idea is Joel Califa's Swarm (califa.github.io/swarm-site) and Dhvanil Patel's Swarm Rebuild
 * (github.com/DhvanilPatel/swarm-cursors). Neither has a licence; crew.js is written anew and only the idea is shared.
 *
 * The crew comes out of, and goes back into, the "N" badge in the header, and every part has a move of its own:
 *   hero        a guide, the lead typed in a text box, the buttons and the Ask prompt dragged out  (once per visit)
 *   about       a layout grid over the text and the portrait, then the text typed
 *   work        each project card dragged out, then its text typed
 *   experience  a relay: each period typed, then linked to the next one down the timeline
 *   writing     the list ruled with the pen, the next row copied down from the one above
 *   contact     the Email button floods out from a click, the bottom rule is drawn
 * Not built: headings, photos, figures (the proof strip), the hero sphere. Nothing React rewrites later is typed.
 *
 * Markup contract: data-swarm on a section (its host), data-swt on the plain-text elements to type, data-swt="cta" on
 * the buttons, data-swarm-list on a list whose children are the units, data-sw-hold on what the hero holds back.
 */

import { useEffect } from "react"

interface Task {
  readonly kind: string
  until?: Task[]
}
interface PlanApi {
  add: (kind: string, el: Element | null, after?: Task[], extra?: Record<string, unknown>) => Task
  type: (els: Iterable<Element | null>, after?: Task[], extra?: Record<string, unknown>) => Task[]
}
interface Point {
  x: number
  y: number
}
interface CrewOptions {
  host: HTMLElement
  plan: (api: PlanApi) => void
  [option: string]: unknown
}
interface Crew {
  start: () => void
  stop: () => void
  teardown: () => void
}
declare global {
  interface Window {
    crew?: (options: CrewOptions) => Crew
  }
}

const REDUCED = "(prefers-reduced-motion: reduce)"
const all = (root: ParentNode, selector: string) => [...root.querySelectorAll<HTMLElement>(selector)]
const one = (root: ParentNode, selector: string) => root.querySelector<HTMLElement>(selector)

const ready = () =>
  typeof window.crew === "function" && "IntersectionObserver" in window && !matchMedia(REDUCED).matches

/** crew.js is loaded by the head script on a hero visit; otherwise it is loaded here, once. */
function loadCrew(): Promise<void> {
  if (window.crew) return Promise.resolve()
  return new Promise((resolve) => {
    let tag = document.querySelector<HTMLScriptElement>('script[src="/crew.js"]')
    if (!tag) {
      tag = document.createElement("script")
      tag.src = "/crew.js"
      tag.async = true
      document.head.append(tag)
    }
    // The head script may have started the load, and its error may have fired before we got here: do not wait for ever
    tag.addEventListener("load", () => resolve())
    tag.addEventListener("error", () => resolve())
    setTimeout(resolve, 1500)
  })
}

/** The crew changes the DOM it works in; React must have hydrated it first, or it would see a mismatch. */
const hydrated = (el: Element) => Object.keys(el).some((key) => key.startsWith("__reactFiber$"))

function whenHydrated(find: () => HTMLElement | null, timeout: number): Promise<HTMLElement | null> {
  const t0 = performance.now()
  return new Promise((resolve) => {
    const tick = () => {
      const el = find()
      if (el && hydrated(el)) resolve(el)
      else if (performance.now() - t0 > timeout) resolve(null)
      else requestAnimationFrame(tick)
    }
    tick()
  })
}

/** The "N" badge in the header: the lamp the crew comes out of and goes back into. */
function lampPoint(): Point | null {
  const r = one(document, "[data-swarm-lamp]")?.getBoundingClientRect()
  return r?.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null
}

/** Below the first screen the lamp is clamped into the section, so the crew enters at the section's edge. */
const lampIn = (host: HTMLElement) => (): Point => {
  const h = host.getBoundingClientRect()
  const p = lampPoint()
  return {
    x: p?.x ?? h.left + 24,
    y: Math.min(h.bottom - 8, Math.max(h.top + 8, p?.y ?? h.top + 8)),
  }
}

/** The browser jumps to /#part after scripts run: that part, and those above it, are read rather than built. */
function jumpedPast(host: HTMLElement) {
  if (!location.hash) return false
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)))
  return !!target && (host.contains(target) || !!(host.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING))
}

type Plan = (api: PlanApi, host: HTMLElement) => void

/**
 * One crew for a section, started as its eyebrow (the first thing it builds) comes up the screen. Smaller and
 * quicker than the hero's. Every section shares one thing: its eyebrow is typed.
 */
function below(host: HTMLElement, plan: Plan, options: Record<string, unknown> = {}): Crew | null {
  const first = one(host, '[data-swt="eyebrow"]')
  if (!first || !ready() || jumpedPast(host) || first.getBoundingClientRect().top < innerHeight) return null
  let io: IntersectionObserver | null = null
  const team = window.crew!({
    pace: 1.2,
    orbit: { radius: 24, step: 10, ms: 320, gap: 40 },
    ...options,
    host,
    from: lampIn(host),
    plan: (api) => {
      api.type([first])
      plan(api, host)
    },
    onEnd: () => io?.disconnect(),
  })
  io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      io?.disconnect()
      team.start()
    },
    { rootMargin: "0px 0px 8% 0px" },
  )
  io.observe(first)
  return team
}

// ---------------------------------------------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------------------------------------------

/** The hero: on the first screen, so it is held back before the first paint (html.has-crew) and built once per visit. */
function buildHero(hero: HTMLElement): Crew | null {
  const shown = () => hero.classList.add("sw-done")
  // Too late (the 3 s failsafe in globals.css is about to show it), already scrolled, or crew.js missing: just show it
  if (!ready() || performance.now() > 2500 || scrollY > 32) {
    shown()
    return null
  }
  const parts = (name: string) => all(hero, `[data-swt="${name}"]`)
  try {
    return window.crew!({
      host: hero,
      rate: 0.1,
      pace: 1.4,
      ahead: Infinity, // everything in the hero is on the first screen
      hurry: 0,
      orbit: { radius: 14, step: 8, ms: 160, gap: 18 },
      passed: () => scrollY > 32, // the hero is the first screen: "scrolled past" means the visitor has started to scroll
      from: lampPoint,
      home: lampPoint,
      park: (next: { top: number }) => {
        // Idle cursors wait in the empty margin beside the centred column, off the text; on a phone there is none
        const margin = (innerWidth - 768) / 2
        if (margin < 90) return undefined
        const left = Math.random() < 0.5
        const span = margin - 70
        return {
          x: left ? 24 + Math.random() * span : innerWidth - margin + 30 + Math.random() * span,
          y: Math.max(next.top, 160) + Math.random() * 120,
        }
      },
      plan({ add, type }) {
        type(parts("status"))
        const [lead] = parts("lead")
        const guide = add("guide", null, [], { axis: "x", to: lead })
        type([lead], [], { box: true })
        for (const cta of parts("cta")) add("rect", cta)
        const ask = add("rect", parts("ask")[0])
        guide.until = [ask]
        type(parts("note"), [ask])
      },
      onEnd: shown,
    })
  } catch (error) {
    hero.classList.remove("sw-on") // never leave the first screen empty
    shown()
    throw error
  }
}

const aboutPlan: Plan = ({ add, type }, host) => {
  // The text column and the portrait as a layout grid, then the text filled in
  const list = one(host, "[data-swarm-list]")!
  const grid = add("grid", list, [], { cells: [...list.children] })
  type(all(list, '[data-swt="text"]'), [grid], { rate: 0.16 })
}

const workPlan: Plan = ({ add, type }, host) => {
  // Each project card is dragged out as a box (the photo comes with it, untouched), then its text is typed
  for (const item of [...one(host, "[data-swarm-list]")!.children] as HTMLElement[]) {
    const card = add("rect", item.querySelector("a"))
    type(all(item, '[data-swt="text"]'), [card], { rate: 0.16 })
  }
}

const experiencePlan: Plan = ({ add, type }, host) => {
  // A career is a sequence: each period is typed, then linked to the next one down the timeline
  let prev: { period: HTMLElement; typed: Task } | null = null
  for (const item of [...one(host, "[data-swarm-list]")!.children] as HTMLElement[]) {
    const period = one(item, '[data-swt="period"]')
    if (!period) continue
    const link = prev ? [add("link", period, [prev.typed], { from: prev.period })] : []
    const [typed] = type([period], link)
    prev = { period, typed }
    type(all(item, '[data-swt="text"]'), [typed], { rate: 0.16 })
  }
  type(all(host, "[data-swarm-tools]"), prev ? [prev.typed] : [], { rate: 0.16 })
}

const writingPlan: Plan = ({ add, type }, host) => {
  // The list is ruled with the pen; each next row is copied down from the one above
  const list = one(host, "[data-swarm-list]")!
  const rows = [...list.children] as HTMLElement[]
  const top = add("line", list, [], { edge: "top" })
  let prev: Task = top
  rows.forEach((row, i) => {
    const shell = i === 0 ? add("line", row, [top], { edge: "bottom" }) : add("dup", row, [prev], { from: rows[i - 1] })
    prev = shell
    type(all(row, '[data-swt="text"]'), [shell])
  })
  for (const cta of all(host, '[data-swt="cta"]')) add("rect", cta)
}

const contactPlan: Plan = ({ add, type }, host) => {
  type(all(host, '[data-swt="text"]'), [], { rate: 0.12 })
  for (const cta of all(host, '[data-swt="cta"]')) add("fill", cta) // the Email button floods out from a click
  add("line", one(host, "[data-swarm-rule]"), [], { edge: "top" })
}

const SECTIONS: { selector: string; plan: Plan; options?: Record<string, unknown> }[] = [
  { selector: "#about", plan: aboutPlan, options: { count: 3 } },
  { selector: "#work", plan: workPlan, options: { count: 6 } },
  { selector: "#experience", plan: experiencePlan, options: { count: 6 } },
  { selector: "#writing", plan: writingPlan, options: { count: 3 } },
  // ahead 1: the last line sits near the end of the page, below the usual 90% line even when scrolled to the bottom
  { selector: "#contact", plan: contactPlan, options: { count: 4, ahead: 1 } },
]

export function Swarm() {
  useEffect(() => {
    let cancelled = false
    const crews: Crew[] = []
    const hero = one(document, '[data-swarm="hero"]')

    loadCrew().then(async () => {
      if (cancelled) return
      if (hero && document.documentElement.classList.contains("has-crew")) {
        const el = await whenHydrated(() => hero, 1500)
        if (cancelled) return
        const team = el ? buildHero(hero) : (hero.classList.add("sw-done"), null)
        if (team) {
          crews.push(team)
          team.start()
        }
      }
      await Promise.all(
        SECTIONS.map(async ({ selector, plan, options }) => {
          const host = await whenHydrated(() => one(document, selector), 10000)
          if (!host || cancelled) return
          await new Promise((resolve) => requestAnimationFrame(resolve)) // the section has committed
          if (cancelled) return
          const team = below(host, plan, options)
          if (team) crews.push(team)
        }),
      )
    })

    return () => {
      cancelled = true
      for (const team of crews) team.teardown()
      hero?.classList.add("sw-done")
    }
  }, [])

  return null
}
