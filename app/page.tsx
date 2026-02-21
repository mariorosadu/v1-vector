import { NewHeader } from "@/components/new-header"
import { AboutSection } from "@/components/about-section"
import { ProcessSection } from "@/components/process-section"
import { Footer } from "@/components/footer"
import { MobileScrollReveal } from "@/components/mobile-scroll-reveal"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.vekthos.com',
  },
}

export default function HomePage() {
  return (
    <main className="relative bg-[#0f0f0f]">
      <MobileScrollReveal />
      <NewHeader />
      <AboutSection />
      <ProcessSection />
      <Footer />
    </main>
  )
}
