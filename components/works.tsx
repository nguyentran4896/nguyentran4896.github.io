"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { works } from "@/lib/content"

const { projects, sectionLabel, sectionTitle } = works

export function Works() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    }
  }

  return (
    <section id="works" className="relative px-8 md:px-12 py-32 md:py-40">
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

      {/* Projects List */}
      <div ref={containerRef} onMouseMove={handleMouseMove} className="relative">
        {projects.map((project, index) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="relative border-t border-white/10 py-10 md:py-14"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-hover
              className="group block"
            >
              {/* Top row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <span className="font-mono text-[11px] tracking-widest text-muted-foreground order-1 md:order-none">
                  {project.year}
                </span>

                <motion.h3
                  className="font-sans text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight group-hover:text-white/70 transition-colors duration-300 flex-1 flex items-center gap-3 md:gap-5"
                  animate={{ x: hoveredIndex === index ? 16 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <span>{project.title}</span>
                  <ArrowUpRight
                    className="w-6 h-6 md:w-8 md:h-8 opacity-0 group-hover:opacity-60 -translate-x-2 group-hover:translate-x-0 transition-all duration-300"
                    aria-hidden
                  />
                </motion.h3>

                <div className="flex gap-2 flex-wrap order-2 md:order-none">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] tracking-wider px-3 py-1 border border-white/20 rounded-full text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Detail row */}
              <div className="mt-6 md:mt-7 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:gap-12 md:pl-[14%]">
                <p className="text-sm md:text-base leading-relaxed text-white/65 max-w-2xl">
                  {project.summary}
                </p>
                <div className="flex flex-col md:items-end gap-2">
                  <span className="font-mono text-[10px] md:text-[11px] tracking-widest uppercase text-muted-foreground">
                    {project.stack}
                  </span>
                  {project.achievement && (
                    <span className="font-mono text-[10px] md:text-[11px] tracking-widest uppercase text-accent">
                      ★ {project.achievement}
                    </span>
                  )}
                </div>
              </div>
            </a>
          </motion.div>
        ))}

        {/* Floating Image */}
        <motion.div
          className="absolute pointer-events-none z-50 w-64 h-40 md:w-80 md:h-48 overflow-hidden rounded-lg hidden md:block"
          style={{
            x: springX,
            y: springY,
            translateX: "-50%",
            translateY: "-320%",
          }}
          animate={{
            opacity: hoveredIndex !== null ? 1 : 0,
            scale: hoveredIndex !== null ? 1 : 0.8,
          }}
          transition={{ duration: 0.2 }}
        >
          {hoveredIndex !== null && (
            <motion.img
              src={projects[hoveredIndex].image}
              alt={projects[hoveredIndex].title}
              className="w-full h-full object-cover"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                filter: "grayscale(50%) contrast(1.1)",
              }}
            />
          )}
          <div className="absolute inset-0 bg-[#2563eb]/10 mix-blend-overlay" />
        </motion.div>
      </div>

      {/* Bottom Border */}
      <div className="border-t border-white/10" />
    </section>
  )
}
