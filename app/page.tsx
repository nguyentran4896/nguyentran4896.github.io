import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Experience } from "@/components/experience"
import { Works } from "@/components/works"
import { Writing } from "@/components/writing"
import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"
import { Swarm } from "@/components/swarm"

export default function Home() {
  return (
    <>
      <SiteHeader />
      <Swarm />
      <main id="main">
        <Hero />
        <About />
        <Works />
        <Experience />
        <Writing />
      </main>
      <Footer />
    </>
  )
}
