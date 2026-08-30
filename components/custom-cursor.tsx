"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [enabled, setEnabled] = useState(false)

  // Raw pointer position as motion values — updated imperatively so pointer
  // movement never triggers a React re-render (previously setPosition() fired
  // on every mousemove, re-rendering both cursor layers at pointer frequency).
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  // Dot and ring follow the pointer with different spring feels.
  const dotX = useSpring(cursorX, { stiffness: 500, damping: 28, mass: 0.5 })
  const dotY = useSpring(cursorY, { stiffness: 500, damping: 28, mass: 0.5 })
  const ringX = useSpring(cursorX, { stiffness: 300, damping: 20, mass: 0.8 })
  const ringY = useSpring(cursorY, { stiffness: 300, damping: 20, mass: 0.8 })

  // Center each layer on the pointer (dot 12px, ring 48px).
  const dotOffsetX = useTransform(dotX, (v) => v - 6)
  const dotOffsetY = useTransform(dotY, (v) => v - 6)
  const ringOffsetX = useTransform(ringX, (v) => v - 24)
  const ringOffsetY = useTransform(ringY, (v) => v - 24)

  useEffect(() => {
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (coarse || reduced || "ontouchstart" in window) return
    setEnabled(true)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      // setState bails out once already true, so this re-renders at most once.
      setIsVisible(true)
    }

    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    const handleHoverStart = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("a, button, [data-cursor-hover]")) {
        setIsHovering(true)
      }
    }

    const handleHoverEnd = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("a, button, [data-cursor-hover]")) {
        setIsHovering(false)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseenter", handleMouseEnter)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseover", handleHoverStart)
    document.addEventListener("mouseout", handleHoverEnd)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseenter", handleMouseEnter)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseover", handleHoverStart)
      document.removeEventListener("mouseout", handleHoverEnd)
    }
  }, [enabled, cursorX, cursorY])

  if (!enabled) return null

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-white rounded-full pointer-events-none z-[10000] mix-blend-difference"
        style={{ x: dotOffsetX, y: dotOffsetY }}
        animate={{
          scale: isHovering ? 0 : 5,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
      />
      {/* Hover ring */}
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 border border-white rounded-full pointer-events-none z-[10000] mix-blend-difference"
        style={{ x: ringOffsetX, y: ringOffsetY }}
        animate={{
          scale: isHovering ? 1 : 0,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.8 }}
      />
    </>
  )
}
