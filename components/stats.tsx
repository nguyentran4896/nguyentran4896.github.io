"use client"

import { motion } from "framer-motion"
import { stats } from "@/lib/content"

export function Stats() {
  return (
    <section className="relative px-8 md:px-12 py-20 md:py-28 border-y border-white/5">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-10 md:mb-14"
      >
        {stats.sectionLabel}
      </motion.p>

      <ul className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-6">
        {stats.items.map((item, index) => (
          <motion.li
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <span className="block font-sans text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light tracking-tight tabular-nums leading-none">
              {item.value}
            </span>
            <span className="mt-3 block font-mono text-[10px] md:text-xs tracking-[0.2em] uppercase text-muted-foreground">
              {item.label}
            </span>
            <span className="absolute -top-2 -left-2 text-accent font-mono text-[10px] tracking-widest">
              0{index + 1}
            </span>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
