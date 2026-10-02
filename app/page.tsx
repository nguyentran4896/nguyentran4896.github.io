import { Hero } from "@/components/hero"
import { QuickAccess } from "@/components/quick-access"
import { About } from "@/components/about"
import { Experience } from "@/components/experience"
import { Works } from "@/components/works"
import { Writing } from "@/components/writing"
import { Recognition } from "@/components/recognition"
import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <QuickAccess />
        <About />
        <Experience />
        <Works />
        <Writing />
        <Recognition />
      </main>
      <Footer />
    </>
  )
}
