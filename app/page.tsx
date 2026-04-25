import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { CustomCursor } from "@/components/custom-cursor"
import { SmoothScroll } from "@/components/smooth-scroll"
import { SectionBlend } from "@/components/section-blend"

const Experience = dynamic(() => import("@/components/experience").then((m) => m.Experience))
const Stats = dynamic(() => import("@/components/stats").then((m) => m.Stats))
const Works = dynamic(() => import("@/components/works").then((m) => m.Works))
const Recognition = dynamic(() => import("@/components/recognition").then((m) => m.Recognition))
const TechMarquee = dynamic(() => import("@/components/tech-marquee").then((m) => m.TechMarquee))
const Footer = dynamic(() => import("@/components/footer").then((m) => m.Footer))

export default function Home() {
  return (
    <SmoothScroll>
      <CustomCursor />
      <Navbar />
      <main id="main">
        <Hero />
        <SectionBlend />
        <About />
        <Experience />
        <Stats />
        <Works />
        <Recognition />
        <TechMarquee />
        <Footer />
      </main>
    </SmoothScroll>
  )
}
