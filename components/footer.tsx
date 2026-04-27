"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { footer } from "@/lib/content"

export function Footer() {
  const [time, setTime] = useState("")
  const [isHovered, setIsHovered] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(footer.email).catch(() => {})
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      const seconds = now.getSeconds().toString().padStart(2, "0")
      setTime(`${hours}:${minutes}:${seconds}`)
    }

    updateTime()
    let interval: number | undefined
    const start = () => {
      if (interval === undefined) interval = window.setInterval(updateTime, 1000)
    }
    const stop = () => {
      if (interval !== undefined) {
        clearInterval(interval)
        interval = undefined
      }
    }
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        updateTime()
        start()
      } else {
        stop()
      }
    }
    start()
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      stop()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return (
    <footer id="contact" className="relative">
      {/* Main CTA */}
      <motion.a
        href={`mailto:${footer.email}`}
        data-cursor-hover
        className="relative block overflow-hidden"
        onClick={handleContactClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Curtain */}
        <motion.div
          className="absolute inset-0 bg-[#2563eb]"
          initial={{ y: "100%" }}
          animate={{ y: isHovered ? "0%" : "100%" }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        />

        {/* Content */}
        <div className="relative py-16 md:py-24 px-8 md:px-12 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col gap-4 text-center md:text-left">
              <motion.h2
                className="font-sans text-4xl md:text-6xl lg:text-8xl font-light tracking-tight"
                animate={{
                  color: isHovered ? "#050505" : "#fafafa",
                }}
                transition={{ duration: 0.3 }}
              >
                {footer.heading1} <span className="italic">{footer.heading2}</span>
              </motion.h2>
              <motion.span
                className="font-mono text-xs tracking-widest"
                animate={{ color: isHovered ? "#050505" : "#a1a1a1" }}
                transition={{ duration: 0.3 }}
              >
                {copied ? "EMAIL COPIED — OPENING MAIL CLIENT…" : `${footer.email.toUpperCase()} · CLICK TO COPY`}
              </motion.span>
            </div>

            <motion.div
              animate={{
                rotate: isHovered ? 45 : 0,
                color: isHovered ? "#050505" : "#fafafa",
              }}
              transition={{ duration: 0.3 }}
            >
              <ArrowUpRight className="w-12 h-12 md:w-16 md:h-16" />
            </motion.div>
          </div>
        </div>
      </motion.a>

      {/* Footer Info */}
      <div className="px-8 md:px-12 py-10 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 items-start md:items-center gap-8 md:gap-4">
          {/* Location + Time */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-xs tracking-widest text-muted-foreground">
              {footer.location}
            </span>
            <span className="font-mono text-xs tracking-widest text-muted-foreground">
              <span className="mr-2">LOCAL TIME</span>
              <span className="text-white tabular-nums">{time}</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-6 md:gap-8 md:justify-center">
            {footer.socials.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                data-cursor-hover
                className="group relative font-mono text-xs tracking-widest text-muted-foreground hover:text-white transition-colors duration-300"
              >
                {link.label.toUpperCase()}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="font-mono text-xs tracking-widest text-muted-foreground md:text-right">
            © {new Date().getFullYear()} · NGUYEN TRAN
          </p>
        </div>
      </div>
    </footer>
  )
}
