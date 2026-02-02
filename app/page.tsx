import { NewHeader } from "@/components/new-header"
import { AboutSection } from "@/components/about-section"
import { ProcessSection } from "@/components/process-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="bg-[#0f0f0f]">
      <NewHeader />
      <AboutSection />
      <ProcessSection />
      <Footer />
    </main>
  )
}
