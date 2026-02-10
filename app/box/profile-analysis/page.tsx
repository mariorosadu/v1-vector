"use client"

import { SimpleHeader } from "@/components/simple-header"
import { RadarGraph } from "@/components/radar-graph"
import { Footer } from "@/components/footer"

const dimensions = [
  "SENIORIDADE REAL",
  "ESCOPO DE IMPACTO",
  "ARQUITETURA DE SISTEMAS",
  "PRODUTO & NEGÓCIO",
  "GROWTH / MÉTRICAS / ROI",
  "CLOUD & INFRA",
  "DATA ENGINEERING",
  "ML / AI APLICADO",
  "PESQUISA ACADÊMICA",
  "LIDERANÇA / OWNERSHIP",
  "COMUNICAÇÃO EXECUTIVA",
  "RARIDADE DE PERFIL",
  "ADERÊNCIA ATS GENÉRICO",
  "MLOPs",
  "LAKEHOUSE ENGINEERING",
  "MODELAGEM ESTATÍSTICA APLICADA",
]

export default function ProfileAnalysisPage() {
  return (
    <main className="bg-[#0f0f0f] min-h-screen">
      <SimpleHeader />
      
      {/* Main Content */}
      <div className="pt-32 md:pt-40 pb-20 px-6 md:px-12">
        <div className="container mx-auto">
          {/* Page Title - Minimal */}
          <div className="text-center mb-12">
            <h1 
              className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-4 tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Profile Analysis
            </h1>
          </div>

          {/* Ticker */}
          <div className="mb-12 overflow-hidden relative border-y border-white/10 bg-white/5">
            <div className="flex animate-ticker whitespace-nowrap py-4 ticker-container">
              {/* Double the dimensions array for seamless loop */}
              {[...dimensions, ...dimensions].map((dim, index) => (
                <div
                  key={index}
                  className="inline-flex items-center mx-3 ticker-item"
                  style={{
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  <span className="text-white/40 text-xs font-light tracking-widest transition-all duration-300">
                    {dim}
                  </span>
                  <span className="mx-3 text-white/20">•</span>
                </div>
              ))}
            </div>
          </div>

          {/* Radar Graph */}
          <RadarGraph />
        </div>
      </div>

      <Footer />
      
      <style jsx>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .ticker-container {
          position: relative;
          animation: ticker 45s linear infinite;
        }
        
        .ticker-container:hover {
          animation-play-state: paused;
        }
        
        .ticker-item {
          position: relative;
          z-index: 1;
          transition: all 0.3s ease;
        }
        
        .ticker-item:hover span:first-child {
          color: rgba(255, 255, 255, 0.9);
        }
      `}</style>
    </main>
  )
}
