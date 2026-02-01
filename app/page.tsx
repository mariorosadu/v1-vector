import { StickyHeader } from "@/components/sticky-header"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { ProcessSection } from "@/components/process-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="bg-[#0f0f0f]">
      <StickyHeader />
      <HeroSection />
      <AboutSection />
      <ProcessSection />
      <Footer />
    </main>
  )
}
