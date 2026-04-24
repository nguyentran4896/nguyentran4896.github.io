"use client"

import { motion } from "framer-motion"
import { recognition } from "@/lib/content"

const { award, interests, languages, quote, sectionLabel, sectionTitle } = recognition

export function Recognition() {
  return (
    <section id="recognition" className="relative px-8 md:px-12 py-32 md:py-40">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-16 md:mb-20"
      >
        <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">{sectionLabel}</p>
        <h2 className="font-sans text-3xl md:text-5xl font-light italic">{sectionTitle}</h2>
      </motion.div>

      {/* Award Highlight */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-16 p-8 md:p-12 border border-white/10 rounded-sm bg-white/[0.015]"
      >
        {/* Decorative corner marks */}
        <span className="absolute top-0 left-0 w-3 h-px bg-accent" />
        <span className="absolute top-0 left-0 w-px h-3 bg-accent" />
        <span className="absolute bottom-0 right-0 w-3 h-px bg-accent" />
        <span className="absolute bottom-0 right-0 w-px h-3 bg-accent" />

        {/* Place */}
        <div className="flex md:flex-col items-baseline md:items-start gap-3 md:gap-1">
          <span className="font-sans text-6xl md:text-7xl lg:text-8xl font-light italic leading-none text-accent">
            2nd
          </span>
          <span className="font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase text-muted-foreground">
            Prize
          </span>
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <p className="font-mono text-[10px] md:text-xs tracking-[0.25em] uppercase text-muted-foreground">
            {award.date}
          </p>
          <h3 className="mt-2 font-sans text-xl md:text-3xl font-light leading-snug">
            {award.event}
          </h3>
          <p className="mt-4 font-sans text-base md:text-lg italic text-white/70 leading-relaxed">
            “{award.paper}”
          </p>
          <p className="mt-4 font-mono text-[11px] md:text-xs tracking-wider text-muted-foreground">
            → {award.follow}
          </p>
        </div>
      </motion.div>

      {/* Quote */}
      <motion.blockquote
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="mt-20 md:mt-28 max-w-4xl"
      >
        <span className="block font-sans text-6xl md:text-8xl text-accent/30 leading-none mb-2">“</span>
        <p className="font-sans text-2xl md:text-4xl lg:text-5xl font-light italic leading-tight text-white/90 -mt-6 md:-mt-10 pl-6 md:pl-10">
          {quote}
        </p>
      </motion.blockquote>

      {/* Interests + Languages grid */}
      <div className="mt-24 md:mt-32 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
        {/* Research Interests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
        >
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
            Research Interests
          </p>
          <ul className="space-y-3">
            {interests.map((interest, index) => (
              <li
                key={interest}
                className="group flex items-baseline gap-4 border-b border-white/5 pb-3"
              >
                <span className="font-mono text-[10px] tracking-widest text-accent">
                  0{index + 1}
                </span>
                <span className="font-sans text-lg md:text-2xl font-light tracking-tight">
                  {interest}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Languages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
            Languages
          </p>
          <ul className="space-y-6">
            {languages.map((lang) => (
              <li key={lang.name} className="border-b border-white/5 pb-5">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-sans text-2xl md:text-3xl font-light italic">
                    {lang.name}
                  </span>
                  <span className="font-mono text-[10px] md:text-xs tracking-widest uppercase text-muted-foreground text-right">
                    {lang.level}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
