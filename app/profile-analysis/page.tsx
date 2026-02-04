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
            {/* Spotlight effect in center */}
            <div className="ticker-spotlight" />
            
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
        
        @keyframes spotlight-pulse {
          0% {
            box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.4), 
                        inset 0 0 40px rgba(59, 130, 246, 0.2);
          }
          25% {
            box-shadow: inset 0 0 60px rgba(59, 130, 246, 0.8), 
                        inset 0 0 100px rgba(59, 130, 246, 0.4),
                        0 0 60px rgba(59, 130, 246, 0.6);
          }
          30% {
            box-shadow: inset 0 0 15px rgba(59, 130, 246, 0.2), 
                        inset 0 0 30px rgba(59, 130, 246, 0.1);
          }
          55% {
            box-shadow: inset 0 0 50px rgba(59, 130, 246, 0.7), 
                        inset 0 0 80px rgba(59, 130, 246, 0.3),
                        0 0 50px rgba(59, 130, 246, 0.5);
          }
          60% {
            box-shadow: inset 0 0 15px rgba(59, 130, 246, 0.2), 
                        inset 0 0 30px rgba(59, 130, 246, 0.1);
          }
          100% {
            box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.4), 
                        inset 0 0 40px rgba(59, 130, 246, 0.2);
          }
        }
        
        .ticker-container {
          position: relative;
          animation: ticker 45s linear infinite;
        }
        
        .ticker-container:hover {
          animation-play-state: paused;
        }
        
        /* Animated spotlight effect */
        .ticker-spotlight {
          position: absolute;
          top: 0;
          left: 50%;
          width: 300px;
          height: 100%;
          transform: translateX(-50%);
          pointer-events: none;
          z-index: 5;
          animation: spotlight-pulse 1.5s ease-in-out infinite;
          border-radius: 50%;
          filter: blur(40px);
        }
        
        .ticker-item {
          position: relative;
          z-index: 1;
          transition: all 0.3s ease;
        }
        
        /* Center items get enhanced styling */
        .ticker-container:nth-child(1) {
          perspective: 1000px;
        }
        
        .ticker-item:hover span:first-child {
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 0 10px rgba(30, 58, 138, 0.6);
        }
      `}</style>
    </main>
  )
}
