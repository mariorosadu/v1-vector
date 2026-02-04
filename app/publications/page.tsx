"use client"

import { SimpleHeader } from "@/components/simple-header"
import { Footer } from "@/components/footer"
import { Download, FileText } from "lucide-react"

const publications = [
  {
    id: 1,
    title: "Research Paper on Software Sustainability",
    description: "Interviewing 9 research software engineers, the paper finds developers define \"software sustainability\" primarily as the long-term reusability and maintainability of the software artifact (not the funding project), and it decomposes this into intrinsic factors (documentation, tests, readability, modularity, reuse of libraries/standards) and extrinsic factors (open availability, shared ownership, resourcing, active maintenance, support, infra-independence).",
    downloadUrl: "/papers/paper1.pdf",
  },
  {
    id: 2,
    title: "Research Software Sustainability: Artefact Longevity via Intrinsic Quality + Extrinsic Ecosystem",
    description: "The study shows that research software engineers define sustainability as the long-term usability and reuse of the software artefact itself, not the project that funded it, and empirically split it into intrinsic qualities (documentation, tests, readability, modularity, standards, usefulness) and extrinsic conditions (openness, community, resourcing, active maintenance, support, infra-independence). It distills these findings into concrete guidance: treat software as enduring research infrastructure by prioritizing quality, active maintenance, discoverability, and community-backed resourcing.",
    downloadUrl: "/papers/paper2.pdf",
  },
  {
    id: 3,
    title: "Cognitive Sight Theory",
    description: "Cognitive Sight Theory reframes cognition as resolution over a field (not a single \"IQ-like\" scalar): each person has a σ-center with a tight sight band (≈±1σ) where they can directly operate on structure, a wider sound band (≈±2σ) where they can only reconstruct via scaffolding, and beyond that a hard noise horizon where communication becomes non-decodable regardless of explanation quality—predicting persistent miscoordination and \"isolation at distance\" as an information-theoretic channel-capacity failure, and prescribing resolution cascades (e.g., 2σ relays) to preserve signal across institutions.",
    downloadUrl: "/papers/cognitive-sight-theory.pdf",
  },
]

export default function PublicationsPage() {
  return (
    <main className="bg-[#0f0f0f] min-h-screen">
      <SimpleHeader />
      
      {/* Main Content */}
      <div className="pt-32 md:pt-40 pb-20 px-6 md:px-12">
        <div className="container mx-auto">
          {/* Page Title */}
          <div className="text-center mb-16">
            <h1 
              className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-4 tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Publications
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
              Research papers and academic contributions on human cognition and AI decision intelligence.
            </p>
          </div>

          {/* Publications List */}
          <div className="max-w-3xl mx-auto space-y-6">
            {publications.map((pub) => (
              <div 
                key={pub.id}
                className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/[0.07] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <FileText className="w-6 h-6 text-white/60" />
                    </div>
                    <div>
                      <h3 
                        className="text-white text-xl font-medium mb-2"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {pub.title}
                      </h3>
                      <p className="text-white/50 text-sm">
                        {pub.description}
                      </p>
                    </div>
                  </div>
                  <a
                    href={pub.downloadUrl}
                    download
                    className="flex items-center gap-2 px-4 py-2 bg-white text-[#0f0f0f] text-sm font-medium rounded hover:bg-white/90 transition-colors shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
