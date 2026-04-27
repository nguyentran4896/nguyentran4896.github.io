"use client"

import { motion } from "framer-motion"
import {
  Activity,
  Building2,
  Calendar,
  Cloud,
  Code2,
  Globe,
  GraduationCap,
  Lock,
  MapPin,
  Repeat,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react"
import { experience } from "@/lib/content"

const { roles, education, sectionLabel, sectionTitle } = experience

const ICONS: Record<string, LucideIcon> = {
  Server,
  ShieldCheck,
  Code2,
  Users,
  Globe,
  Sparkles,
  Lock,
  Activity,
  Cloud,
  Repeat,
}

function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] ?? Sparkles
  return <Cmp className={className} strokeWidth={1.25} aria-hidden />
}

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
                <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] uppercase text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" strokeWidth={1.25} aria-hidden />
                  {role.period}
                </span>
                {/* Dot on the timeline */}
                <span className="hidden md:block absolute top-[7px] -right-[5px] w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-background" />
              </div>

              {/* Content */}
              <div className="md:pl-12">
                <div className="flex items-start gap-4">
                  <span className="hidden md:inline-flex shrink-0 mt-2 w-10 h-10 items-center justify-center rounded-full border border-white/15 text-white/70">
                    <Icon name={role.icon} className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-sans text-2xl md:text-4xl lg:text-5xl font-light tracking-tight leading-tight">
                      {role.role}
                    </h3>
                    <p className="mt-2 font-mono text-xs md:text-sm tracking-[0.2em] uppercase text-accent inline-flex items-center gap-2 flex-wrap">
                      <Building2 className="w-3.5 h-3.5" strokeWidth={1.25} aria-hidden />
                      {role.company}
                      <span className="mx-1 text-muted-foreground">·</span>
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.25} aria-hidden />
                      <span className="text-muted-foreground">{role.location}</span>
                    </p>
                  </div>
                </div>

                <p className="mt-5 max-w-2xl text-sm md:text-base leading-relaxed text-white/70">
                  {role.summary}
                </p>

                {role.highlights && role.highlights.length > 0 && (
                  <dl className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl">
                    {role.highlights.map((h) => (
                      <div
                        key={h.label}
                        className="flex items-center gap-3 px-3 py-2.5 border border-white/10 rounded-lg"
                      >
                        <Icon name={h.icon} className="w-4 h-4 text-white/60 shrink-0" />
                        <div className="min-w-0">
                          <dt className="font-sans text-base leading-none italic">{h.value}</dt>
                          <dd className="mt-1 font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground truncate">
                            {h.label}
                          </dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                )}

                <ul className="mt-6 max-w-2xl space-y-1.5">
                  {role.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-sm leading-relaxed text-white/50">
                      <span className="text-accent mt-0.5 shrink-0">·</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
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
              <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] uppercase text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" strokeWidth={1.25} aria-hidden />
                {education.period}
              </span>
              <span className="hidden md:block absolute top-[7px] -right-[5px] w-2.5 h-2.5 rounded-full bg-white/30 ring-4 ring-background" />
            </div>

            <div className="md:pl-12">
              <div className="flex items-start gap-4">
                <span className="hidden md:inline-flex shrink-0 mt-2 w-10 h-10 items-center justify-center rounded-full border border-white/15 text-white/70">
                  <GraduationCap className="w-5 h-5" strokeWidth={1.25} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
                    Education
                  </p>
                  <h3 className="font-sans text-2xl md:text-4xl font-light italic leading-tight">
                    {education.degree}
                  </h3>
                  <p className="mt-2 font-mono text-xs md:text-sm tracking-[0.2em] uppercase text-white/80 inline-flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" strokeWidth={1.25} aria-hidden />
                    {education.school}
                  </p>
                  <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-3.5 h-3.5" strokeWidth={1.25} aria-hidden />
                    {education.note}
                  </p>
                </div>
              </div>
            </div>
          </motion.li>
        </ol>
      </div>
    </section>
  )
}
