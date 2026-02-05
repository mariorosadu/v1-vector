"use client"

import { SimpleHeader } from "@/components/simple-header"
import { Footer } from "@/components/footer"
import { Download } from "lucide-react"

// Elegant Document Icon Component
function DocumentIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
    >
      {/* Minimalist document outline */}
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white/40"
      />
      <path
        d="M14 2v6h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white/40"
      />
      {/* Subtle content lines */}
      <path
        d="M10 12h4M10 16h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-white/20"
      />
    </svg>
  )
}

const publications = [
  {
    id: 2,
    title: "Research Software Sustainability: Artefact Longevity via Intrinsic Quality + Extrinsic Ecosystem",
    description: "Examines how research software engineers define sustainability through intrinsic qualities and extrinsic conditions, providing guidance for treating software as enduring research infrastructure.",
    downloadUrl: "/papers/paper2.pdf",
  },
  {
    id: 3,
    title: "Cognitive Sight Theory",
    description: "Reframes cognition as resolution over a field, introducing sight bands, sound bands, and noise horizons to explain communication limitations and coordination failures across cognitive distances.",
    downloadUrl: "/papers/cognitive-sight-theory.pdf",
  },
  {
    id: 1,
    title: "Research Paper on Software Sustainability",
    description: "Explores developer perspectives on software sustainability, decomposing it into intrinsic factors like documentation and modularity, and extrinsic factors like maintenance and resourcing.",
    downloadUrl: "/papers/paper1.pdf",
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
          <div className="max-w-4xl mx-auto space-y-6">
            {publications.map((pub) => (
              <article 
                key={pub.id}
                className="bg-white/5 border border-white/10 rounded-lg p-6 md:p-8 hover:bg-white/[0.07] hover:border-white/20 transition-all group"
              >
                <div className="flex flex-col gap-4">
                  {/* Header with icon and title */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10 shrink-0 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                      <DocumentIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="text-white text-lg md:text-xl font-medium mb-2 leading-snug"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {pub.title}
                      </h3>
                      <p className="text-white/60 text-sm md:text-base leading-relaxed">
                        {pub.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Download button */}
                  <div className="flex justify-center pt-4">
                    <a
                      href={pub.downloadUrl}
                      download
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0f0f0f] text-sm font-medium rounded hover:bg-white/90 transition-colors group-hover:scale-105 transition-transform touch-manipulation"
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                        <path
                          d="M14 2v6h6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                        <path
                          d="M10 12h4M10 16h4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
