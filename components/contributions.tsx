"use client"

import { motion } from "framer-motion"
import { contributions as copy } from "@/lib/content"
import data from "@/lib/contributions.json"

type Day = { date: string; count: number; level: number }
type Week = { days: Day[] }

// Monochrome scale — five steps of foreground opacity. No GitHub green: the
// palette allows exactly one accent, and hierarchy here comes from brightness
// (DESIGN.md), not hue.
const LEVEL_BG = [
  "bg-foreground/[0.06]",
  "bg-foreground/20",
  "bg-foreground/40",
  "bg-foreground/65",
  "bg-foreground/90",
]

export function Contributions() {
  const weeks = (data.weeks ?? []) as Week[]
  // No baked snapshot yet → render nothing rather than fake data.
  if (!weeks.length || !data.total) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="mt-16 md:mt-20"
    >
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:text-xs">
          {copy.label}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:text-xs">
          {data.total.toLocaleString()} {copy.caption}
        </p>
      </div>

      <div
        role="img"
        aria-label={`GitHub contribution calendar: ${data.total} contributions in the last year`}
        className="overflow-x-auto pb-2"
      >
        <div className="flex min-w-max gap-[3px]" aria-hidden>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.days.map((day) => (
                <span
                  key={day.date}
                  title={`${day.count} contribution${day.count === 1 ? "" : "s"} · ${day.date}`}
                  className={`h-2.5 w-2.5 rounded-[2px] ${LEVEL_BG[day.level] ?? LEVEL_BG[0]}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>Less</span>
        {LEVEL_BG.map((bg, i) => (
          <span key={i} className={`h-2.5 w-2.5 rounded-[2px] ${bg}`} aria-hidden />
        ))}
        <span>More</span>
      </div>
    </motion.div>
  )
}
