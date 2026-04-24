"use client"

import { motion } from "framer-motion"
import { experience } from "@/lib/content"

const { roles, education, sectionLabel, sectionTitle } = experience

export function Experience() {
  return (
    <section id="experience" className="relative px-8 md:px-12 py-32 md:py-40">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-20 md:mb-24"
      >
        <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">{sectionLabel}</p>
        <h2 className="font-sans text-3xl md:text-5xl font-light italic">{sectionTitle}</h2>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line — desktop only */}
        <div className="hidden md:block absolute left-[18%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />

        <ol className="space-y-16 md:space-y-24">
          {roles.map((role, index) => (
            <motion.li
              key={role.company}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="relative grid grid-cols-1 md:grid-cols-[18%_1fr] gap-6 md:gap-12"
            >
              {/* Period column */}
              <div className="relative md:pr-8">
                <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-muted-foreground">
                  {role.period}
                </span>
                {/* Dot on the timeline */}
                <span className="hidden md:block absolute top-[7px] -right-[5px] w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-background" />
              </div>

              {/* Content */}
              <div className="md:pl-12">
                <h3 className="font-sans text-2xl md:text-4xl lg:text-5xl font-light tracking-tight leading-tight">
                  {role.role}
                </h3>
                <p className="mt-2 font-mono text-xs md:text-sm tracking-[0.2em] uppercase text-accent">
                  {role.company}
                  <span className="mx-3 text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{role.location}</span>
                </p>
                <p className="mt-5 max-w-2xl text-sm md:text-base leading-relaxed text-white/70">
                  {role.summary}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {role.stack.map((s) => (
                    <span
                      key={s}
                      className="font-mono text-[10px] tracking-wider px-3 py-1 border border-white/15 rounded-full text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </motion.li>
          ))}

          {/* Education entry — mirrors role layout but distinguished */}
          <motion.li
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative grid grid-cols-1 md:grid-cols-[18%_1fr] gap-6 md:gap-12 pt-8 border-t border-white/5"
          >
            <div className="relative md:pr-8">
              <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-muted-foreground">
                {education.period}
              </span>
              <span className="hidden md:block absolute top-[7px] -right-[5px] w-2.5 h-2.5 rounded-full bg-white/30 ring-4 ring-background" />
            </div>

            <div className="md:pl-12">
              <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
                Education
              </p>
              <h3 className="font-sans text-2xl md:text-4xl font-light italic leading-tight">
                {education.degree}
              </h3>
              <p className="mt-2 font-mono text-xs md:text-sm tracking-[0.2em] uppercase text-white/80">
                {education.school}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{education.note}</p>
            </div>
          </motion.li>
        </ol>
      </div>
    </section>
  )
}
