"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Link } from "next-view-transitions"
import { motion, AnimatePresence } from "framer-motion"
import { nav } from "@/lib/content"
import { toggleTerminal } from "@/lib/terminal-bus"
import { openPalette } from "@/components/command-palette"

const navLinks = nav.links

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const onHome = pathname === "/"
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeHref, setActiveHref] = useState<string>("")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close the mobile menu on Escape
  useEffect(() => {
    if (!isMenuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [isMenuOpen])

  useEffect(() => {
    if (!onHome) {
      const match = navLinks.find((l) => l.href === pathname || (l.href !== "/" && pathname.startsWith(l.href)))
      setActiveHref(match?.href ?? "")
      return
    }
    const ids = navLinks.map((l) => l.href).filter((h) => h.startsWith("#"))
    const targets = ids
      .map((id) => document.querySelector(id))
      .filter((el): el is Element => !!el)
    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActiveHref(`#${visible.target.id}`)
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    targets.forEach((t) => observer.observe(t))
    return () => observer.disconnect()
  }, [onHome, pathname])

  const scrollToSection = (href: string) => {
    setIsMenuOpen(false)
    if (href.startsWith("/")) {
      router.push(href)
      return
    }
    if (href.startsWith("#")) {
      if (!onHome) {
        router.push(`/${href}`)
        return
      }
      const element = document.querySelector(href)
      if (element) element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border" : ""
        }`}
      >
        {/* Scroll progress hairline */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 h-px bg-foreground/60 origin-left"
          style={{ width: "100%", transform: `scaleX(${progress})` }}
        />
        <nav className="flex items-center justify-between px-6 py-4 my-0 md:px-12 md:py-5">
          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => {
              if (onHome) {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
            }}
            className="group flex items-center gap-2"
          >
            <span className="font-mono text-xs tracking-widest text-muted-foreground">{nav.brand}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent group-hover:scale-150 transition-transform duration-300" />
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-5 lg:gap-8">
            {navLinks.map((link, index) => (
              <li key={link.label}>
                <button
                  onClick={() => scrollToSection(link.href)}
                  aria-current={activeHref === link.href ? "true" : undefined}
                  className={`group relative font-mono text-xs tracking-wider transition-colors duration-300 hover:text-foreground ${
                    activeHref === link.href ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span className="text-accent-text mr-1">0{index + 1}</span>
                  {link.label.toUpperCase()}
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300 ${
                      activeHref === link.href ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>

          {/* Right cluster: ⌘K hint + console trigger + availability status */}
          <div className="flex items-center gap-4">
            {/* Desktop-only quiet ⌘K trigger — hidden on mobile */}
            <button
              onClick={() => openPalette()}
              aria-label="Open command palette (Cmd + K)"
              title="Command palette — ⌘K"
              data-cursor-hover
              className="hidden md:inline-flex items-center gap-1.5 font-mono text-xs tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="hidden lg:inline">OPEN</span>
              <kbd className="border border-border rounded px-1 py-0.5 text-[10px] font-mono tracking-wider text-muted-foreground">
                ⌘K
              </kbd>
            </button>
            <button
              onClick={() => toggleTerminal()}
              aria-label="Open interactive console (Ctrl + `)"
              title="Interactive console — Ctrl + `"
              data-cursor-hover
              className="hidden md:inline-flex items-center gap-1.5 font-mono text-xs tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              <span aria-hidden>›_</span>
              <span className="hidden lg:inline">console</span>
            </button>
            <div className="hidden lg:flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              <span className="font-mono text-xs tracking-wider text-muted-foreground">{nav.status}</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <motion.span
              animate={isMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              className="w-6 h-px bg-foreground origin-center"
            />
            <motion.span
              animate={isMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
              className="w-6 h-px bg-foreground"
            />
            <motion.span
              animate={isMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
              className="w-6 h-px bg-foreground origin-center"
            />
          </button>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay — the wrapper is always in the DOM so the toggle
          button's aria-controls="mobile-menu" always resolves to a real element;
          the overlay itself mounts/unmounts (and animates) with AnimatePresence. */}
      <div id="mobile-menu" aria-hidden={!isMenuOpen} className="contents">
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-lg md:hidden"
          >
            <nav className="flex flex-col items-center justify-center h-full gap-8">
              {navLinks.map((link, index) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => scrollToSection(link.href)}
                  className="group text-4xl font-sans tracking-tight text-foreground"
                >
                  <span className="text-accent-text font-mono text-sm mr-2">0{index + 1}</span>
                  {link.label}
                </motion.button>
              ))}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: navLinks.length * 0.1 }}
                onClick={() => {
                  setIsMenuOpen(false)
                  toggleTerminal()
                }}
                className="group font-mono text-sm tracking-wider text-muted-foreground"
              >
                <span className="text-accent-text mr-2">›_</span>
                CONSOLE
              </motion.button>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 mt-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
                <span className="font-mono text-xs tracking-wider text-muted-foreground">{nav.status}</span>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </>
  )
}
