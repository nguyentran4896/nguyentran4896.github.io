"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { works, worksGallery } from "@/lib/content"
import type { Project } from "@/lib/content"

const COPY = {
  counterLabel: (current: number, total: number) =>
    `${String(current).padStart(2, "0")} / ${String(total).padStart(2, "0")}`,
  scrollHint: worksGallery.scrollHint,
  viewProject: worksGallery.viewProject,
}

const { projects, sectionLabel, sectionTitle } = works

// ─────────────────────────────────────────────────────────────────────────────
// Horizontal Gallery (desktop, pointer device, no reduced-motion)
// ─────────────────────────────────────────────────────────────────────────────

function HorizontalWorks() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // totalShift = number of project panels; outer height accommodates header + projects + 1 extra
  const totalShift = projects.length
  const outerHeight = `${(totalShift + 2) * 100}vh`

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Translate the flex row from 0 to -(totalShift * 100vw) as scroll goes 0→1
  const xPercent = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `${-totalShift * 100}%`]
  )

  // Progress hairline width tied to scroll
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  // Derive active panel from scroll for the position counter
  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      const idx = Math.round(v * totalShift)
      setActiveIndex(Math.min(Math.max(idx - 1, 0), projects.length - 1))
    })
    return unsub
  }, [scrollYProgress, totalShift])

  return (
    <section
      id="works"
      ref={containerRef}
      className="relative"
      style={{ height: outerHeight }}
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Progress hairline (accent — this section's single accent element) */}
        <motion.div
          className="absolute top-0 left-0 h-[1px] z-20"
          style={{
            width: progressWidth,
            backgroundColor: "#3B5CFF",
          }}
        />

        {/* Position counter */}
        <div className="absolute bottom-8 right-8 z-20">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            {COPY.counterLabel(activeIndex + 1, projects.length)}
          </span>
        </div>

        {/* Horizontal flex row — width = (header + projects) * 100vw */}
        <motion.div
          className="flex h-full"
          style={{
            x: xPercent,
            width: `${(totalShift + 1) * 100}vw`,
          }}
        >
          {/* Header panel */}
          <div className="w-screen h-full flex-shrink-0 flex flex-col justify-end px-8 md:px-16 pb-24 border-r border-white/10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <p className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
                {sectionLabel}
              </p>
              <h2 className="font-sans text-4xl md:text-6xl font-light italic leading-tight">
                {sectionTitle}
              </h2>
            </motion.div>
            <div className="mt-16">
              <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                {COPY.scrollHint}
              </p>
              <div className="mt-2 flex gap-1">
                {projects.map((_, i) => (
                  <div
                    key={i}
                    className="h-[1px] flex-1 transition-colors duration-300"
                    style={{
                      backgroundColor:
                        i <= activeIndex
                          ? "#3B5CFF"
                          : "rgba(250,250,250,0.15)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Project panels */}
          {projects.map((project: Project, index: number) => (
            <ProjectPanel
              key={project.title}
              project={project}
              index={index}
              total={projects.length}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function ProjectPanel({
  project,
  index,
  total,
}: {
  project: Project
  index: number
  total: number
}) {
  return (
    <div
      className="w-screen h-full flex-shrink-0 border-r border-white/10 flex flex-col justify-between px-8 md:px-16 py-16"
      aria-label={`Project ${index + 1} of ${total}: ${project.title}`}
    >
      {/* Top: index + year */}
      <div className="flex items-start justify-between">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          {project.year}
        </span>
      </div>

      {/* Middle: title + details */}
      <div className="flex flex-col gap-8 max-w-2xl">
        <motion.h3
          className="font-sans text-4xl md:text-6xl lg:text-7xl font-light italic leading-tight tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {project.title}
        </motion.h3>

        <p className="text-sm md:text-base leading-relaxed text-white/65 max-w-lg">
          {project.summary}
        </p>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap">
          {project.tags.map((tag: string) => (
            <span
              key={tag}
              className="font-mono text-[10px] tracking-wider px-3 py-1 border border-white/20 rounded-full text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stack */}
        <span className="font-mono text-[10px] md:text-[11px] tracking-widest uppercase text-muted-foreground">
          {project.stack}
        </span>

        {/* Achievement */}
        {project.achievement && (
          <span className="font-mono text-[10px] md:text-[11px] tracking-widest uppercase text-accent">
            {project.achievement}
          </span>
        )}
      </div>

      {/* Bottom: link + counter */}
      <div className="flex items-center justify-between">
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor-hover
          className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase border border-white/20 rounded-full px-6 py-3 hover:bg-foreground hover:text-background transition-colors duration-500"
        >
          {COPY.viewProject}
          <ArrowUpRight
            className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
            aria-hidden
          />
        </a>
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Vertical Editorial List (touch / reduced-motion / below-lg fallback)
// Preserved exactly from original — only floating preview position updated
// to use state-based coordinates instead of framer-motion spring values
// ─────────────────────────────────────────────────────────────────────────────

function VerticalWorks() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [floatPos, setFloatPos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setFloatPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
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
        <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">
          {sectionLabel}
        </p>
        <h2 className="font-sans text-3xl md:text-5xl font-light italic">
          {sectionTitle}
        </h2>
      </motion.div>

      {/* Projects List */}
      <div ref={containerRef} onMouseMove={handleMouseMove} className="relative">
        {projects.map((project: Project, index: number) => (
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
                  {project.tags.map((tag: string) => (
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

        {/* Floating Image Preview */}
        <motion.div
          className="absolute pointer-events-none z-50 w-64 h-40 md:w-80 md:h-48 overflow-hidden rounded-lg hidden md:block"
          style={{
            left: floatPos.x,
            top: floatPos.y,
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
              style={{ filter: "grayscale(50%) contrast(1.1)" }}
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

// ─────────────────────────────────────────────────────────────────────────────
// Root component — capability detection guards static prerender / SSR
// ─────────────────────────────────────────────────────────────────────────────

export function Works() {
  // null = not yet detected (SSR / first paint); render vertical (safe default).
  // On client, detect all three conditions: lg screen, fine pointer, no reduced-motion.
  const [useHorizontal, setUseHorizontal] = useState<boolean | null>(null)

  useEffect(() => {
    const lgMq = window.matchMedia("(min-width: 1024px)")
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)")

    const evaluate = () => {
      const lg = lgMq.matches
      const fine = window.matchMedia("(pointer: fine)").matches
      const reduced = motionMq.matches
      const touch =
        "ontouchstart" in window ||
        window.matchMedia("(hover: none)").matches
      setUseHorizontal(lg && fine && !reduced && !touch)
    }

    evaluate()
    lgMq.addEventListener("change", evaluate)
    motionMq.addEventListener("change", evaluate)

    return () => {
      lgMq.removeEventListener("change", evaluate)
      motionMq.removeEventListener("change", evaluate)
    }
  }, [])

  // SSR / first-paint: render the vertical list (no window access needed)
  if (useHorizontal === null) return <VerticalWorks />

  return useHorizontal ? <HorizontalWorks /> : <VerticalWorks />
}
