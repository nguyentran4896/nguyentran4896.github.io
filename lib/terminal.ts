// Pure command registry for the interactive console.
//
// Everything rendered by the console is derived from lib/content.ts — the
// single source of truth for page copy — so editing your bio there keeps the
// terminal in sync automatically with zero duplicate maintenance.
//
// runCommand() is a pure function: given an input string (and the current
// history) it returns lines to print plus an optional side-effect descriptor
// (navigate / clear) for the component to execute. No DOM, no React.

import { about, experience, stats, works, recognition, tech, footer } from "@/lib/content"

// Hierarchy is carried by brightness, not hue (DESIGN.md: "if you need
// emphasis, use italic, size, or whitespace — not hue"). The single accent
// is reserved for the live prompt + caret, rendered by the component.
export type LineKind = "input" | "output" | "muted" | "head" | "error"
export type TerminalLine = { kind: LineKind; text: string }

export type CommandResult = {
  lines: TerminalLine[]
  /** Section id ("about" | "experience" | "works" | "recognition" | "contact") or "blog". */
  navigate?: string
  /** Clear the screen. */
  clear?: boolean
}

const o = (text = ""): TerminalLine => ({ kind: "output", text }) // body, foreground/80
const m = (text = ""): TerminalLine => ({ kind: "muted", text }) // metadata, muted-foreground
const h = (text = ""): TerminalLine => ({ kind: "head", text }) // title, full foreground
const err = (text = ""): TerminalLine => ({ kind: "error", text })

export const COMMANDS: { name: string; description: string }[] = [
  { name: "help", description: "list available commands" },
  { name: "whoami", description: "who is Nguyen Tran" },
  { name: "about", description: "philosophy & background" },
  { name: "experience", description: "career & education" },
  { name: "projects", description: "selected works & research" },
  { name: "skills", description: "technical arsenal" },
  { name: "awards", description: "honors & publications" },
  { name: "stats", description: "career by the numbers" },
  { name: "contact", description: "email & social links" },
  { name: "neofetch", description: "system-style profile card" },
  { name: "ls", description: "list navigable sections" },
  { name: "open", description: "open a section, e.g. 'open works'" },
  { name: "clear", description: "clear the screen" },
  { name: "history", description: "show command history" },
]

/** Names offered for Tab-completion (canonical commands + common aliases). */
export const COMMAND_NAMES = [
  ...COMMANDS.map((c) => c.name),
  "stack",
  "goto",
]

const SECTIONS = ["about", "experience", "works", "recognition", "contact", "blog"] as const

function helpCmd(): CommandResult {
  return {
    lines: [
      m("available commands —"),
      ...COMMANDS.map((c) => o(`${c.name.padEnd(11)} ${c.description}`)),
      o(),
      m("↑/↓ recall history · Tab to complete · Esc to close"),
    ],
  }
}

function whoamiCmd(): CommandResult {
  return {
    lines: [
      h("Nguyen Tran"),
      o("Senior Software Engineer & AI Researcher · ~10 years"),
      m("Ho Chi Minh City · Vietnam"),
    ],
  }
}

function aboutCmd(): CommandResult {
  return { lines: [m("// philosophy"), ...about.statements.map((s) => o(s))] }
}

function experienceCmd(): CommandResult {
  const lines: TerminalLine[] = []
  experience.roles.forEach((r) => {
    lines.push(h(`${r.role} — ${r.company}`))
    lines.push(m(`${r.period} · ${r.location}`))
    lines.push(o(r.summary))
    lines.push(o())
  })
  const e = experience.education
  lines.push(h(e.degree))
  lines.push(m(`${e.period} · ${e.school} · ${e.note}`))
  return { lines }
}

function projectsCmd(): CommandResult {
  const lines: TerminalLine[] = []
  works.projects.forEach((p) => {
    lines.push(h(`${p.title}  [${p.year}]`))
    lines.push(m(p.tags.join(" · ")))
    lines.push(o(p.summary))
    lines.push(m(`stack: ${p.stack}`))
    if (p.achievement) lines.push(m(`award: ${p.achievement}`))
    lines.push(o())
  })
  lines.push(m("repos: https://github.com/nguyentran4896"))
  return { lines }
}

function skillsCmd(): CommandResult {
  return {
    lines: [
      m("// technical arsenal"),
      o(tech.techItems.join("  ·  ")),
      o(),
      m("// concepts"),
      o(tech.concepts.join("  ·  ")),
    ],
  }
}

function awardsCmd(): CommandResult {
  const w = recognition.award
  return {
    lines: [
      h(`${w.place} — ${w.event}`),
      m(w.date),
      o(`"${w.paper}"`),
      m(w.follow),
      o(),
      m(`interests: ${recognition.interests.join(", ")}`),
      o(),
      ...recognition.languages.map((l) => o(`${l.name} — ${l.level}`)),
    ],
  }
}

function statsCmd(): CommandResult {
  return { lines: stats.items.map((s) => o(`${s.value.padEnd(6)} ${s.label}`)) }
}

function contactCmd(): CommandResult {
  return {
    lines: [
      o(`email    ${footer.email}`),
      o(`location ${footer.location}`),
      o(),
      ...footer.socials.map((s) => o(`${s.label.padEnd(8)} ${s.href}`)),
    ],
  }
}

function neofetchCmd(): CommandResult {
  const rows: [string, string][] = [
    ["    ╱╲      ", "nguyen@portfolio"],
    ["   ╱  ╲     ", "----------------"],
    ["  ╱ ◢◣ ╲    ", "Role:   Senior SWE & AI Researcher"],
    ["  ╲ ▀▀ ╱    ", "Uptime: 10+ years in production"],
    ["   ╲  ╱     ", "Merged: 538+ PRs · 300k+ businesses"],
    ["    ╲╱      ", "Stack:  Rails · TS · PyTorch · AWS"],
    ["            ", "Focus:  Medical AI · Computer Vision"],
    ["            ", "Award:  2nd Prize — Global Ortho-K '25"],
  ]
  return { lines: rows.map(([art, fact]) => o(`${art}${fact}`)) }
}

function lsCmd(): CommandResult {
  return {
    lines: [
      o("about        philosophy & background"),
      o("experience   roles & education"),
      o("works        selected projects"),
      o("recognition  honors & publications"),
      o("contact      email & socials"),
      o("blog         writing & essays"),
      m("→ open <section>   e.g.  open works"),
    ],
  }
}

function openCmd(args: string[]): CommandResult {
  const raw = (args[0] ?? "").toLowerCase()
  if (!raw) return { lines: [err("usage: open <section> — try 'ls'")] }
  const alias: Record<string, string> = {
    projects: "works",
    project: "works",
    awards: "recognition",
    honors: "recognition",
    writing: "blog",
  }
  const id = alias[raw] ?? raw
  if (!SECTIONS.includes(id as (typeof SECTIONS)[number])) {
    return { lines: [err(`no such section: ${raw}. try 'ls'`)] }
  }
  return { lines: [m(`↳ opening ${id}…`)], navigate: id }
}

/**
 * Execute a console command.
 * @param raw     the raw input line
 * @param history previously entered commands (for the `history` command)
 */
export function runCommand(raw: string, history: string[] = []): CommandResult {
  const trimmed = raw.trim()
  if (!trimmed) return { lines: [] }

  const [cmd, ...args] = trimmed.split(/\s+/)
  switch (cmd.toLowerCase()) {
    case "help":
    case "?":
      return helpCmd()
    case "whoami":
      return whoamiCmd()
    case "about":
    case "bio":
      return aboutCmd()
    case "experience":
    case "exp":
      return experienceCmd()
    case "projects":
    case "works":
      return projectsCmd()
    case "skills":
    case "stack":
      return skillsCmd()
    case "awards":
    case "recognition":
    case "honors":
      return awardsCmd()
    case "stats":
      return statsCmd()
    case "contact":
    case "email":
      return contactCmd()
    case "neofetch":
      return neofetchCmd()
    case "ls":
      return lsCmd()
    case "open":
    case "goto":
    case "cd":
      return openCmd(args)
    case "clear":
      return { lines: [], clear: true }
    case "history":
      return {
        lines: history.length
          ? history.map((h, i) => m(`${String(i + 1).padStart(3)}  ${h}`))
          : [m("no history yet")],
      }
    case "sudo":
      return { lines: [m("sudo: unable to resolve host 'ego' — permission denied. nice try.")] }
    default:
      return { lines: [err(`command not found: ${cmd}. type 'help' for options.`)] }
  }
}
