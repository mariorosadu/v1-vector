"use client"

import { StickyHeader } from "@/components/sticky-header"
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
      <StickyHeader />
      
      {/* Main Content */}
      <div className="pt-64 md:pt-80 pb-20 px-6 md:px-12">
        <div className="container mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 
              className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-6 tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Profile Analysis
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
              {'Visualize professional competence across multiple dimensions using AI-powered analysis.'}
            </p>
          </div>

          {/* Ticker */}
          <div className="mb-12 overflow-hidden relative border-y border-white/10 bg-white/5">
            <div className="flex animate-ticker whitespace-nowrap py-3">
              {/* Double the dimensions array for seamless loop */}
              {[...dimensions, ...dimensions].map((dim, index) => (
                <div
                  key={index}
                  className="inline-flex items-center mx-2"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    animation: `color-pulse 32s ease-in-out infinite`,
                    animationDelay: `${(index % dimensions.length) * (32 / dimensions.length)}s`,
                  }}
                >
                  <span className="text-white/50 text-xs font-light tracking-widest glow-text">
                    {dim}
                  </span>
                  <span className="mx-2 text-white/20">•</span>
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
        
        @keyframes color-pulse {
          0%, 100% {
            color: rgba(255, 255, 255, 0.5);
          }
          50% {
            color: rgba(0, 0, 0, 1);
          }
        }
        
        .animate-ticker {
          animation: ticker 45s linear infinite;
        }
        
        .animate-ticker:hover {
          animation-play-state: paused;
        }
        
        .glow-text {
          transition: color 0.3s ease;
        }
      `}</style>
    </main>
  )
}
