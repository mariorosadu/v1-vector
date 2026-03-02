"use client"

import React, { useMemo, useState, useEffect, useRef, useLayoutEffect } from 'react'
import { Activity, Layers, Globe, Cpu, Terminal, Zap, AlertTriangle, Boxes, Target } from 'lucide-react'

// --- DATA INGESTION ---
const rawCsvData = `SuperCategory,Category,Siblings
Front-end,Web Primitive,"HTML, CSS, JavaScript"
Front-end,Typed JavaScript,"TypeScript, Flow, JSDoc"
Front-end,UI Framework,"React, Angular, Vue, Svelte, Solid, Qwik"
Front-end,CSS Framework,"Tailwind CSS, Bootstrap, Bulma, Foundation, UIkit, Materialize"
Front-end,Frontend Build Tool,"Webpack, Vite, Rollup, esbuild, Parcel, Turbopack"
Front-end,JavaScript Package Manager,"npm, yarn, pnpm, bun"
Front-end,Web Browser,"Chrome, Safari, Edge, Firefox, Samsung Internet, Opera"
Back-end,Server Runtime,"Java (JVM), Node.js, Python, .NET, PHP, Go, Ruby, Rust"
Back-end,Runtime Ecosystem,"Java (JVM), Microsoft .NET, Node.js, Python, PHP, Go, Ruby, Rust"
Back-end,Web App Framework,"Next.js, Nuxt, Astro, Remix, Gatsby, SvelteKit"
Back-end,Web Server,"Nginx, Apache HTTP Server, Microsoft IIS, LiteSpeed, Caddy"
Back-end,Auth Protocol,"OAuth 2.0, OpenID Connect, SAML, LDAP, Kerberos, WebAuthn"
Back-end,Relational Database,"MySQL, PostgreSQL, SQL Server, Oracle Database, MariaDB, IBM Db2"
Back-end,Search Engine,"Elasticsearch, OpenSearch, Algolia, Apache Solr, Meilisearch, Typesense"
Back-end,Event Delivery Mechanism,"Webhooks, Pub/Sub (queues), WebSockets, Server-Sent Events, Event Streams, Polling, Long Polling"
Back-end,Serverless Functions (FaaS),"AWS Lambda, Azure Functions, Google Cloud Functions, Cloudflare Workers, Netlify Functions, Vercel Functions, Fastly Compute"
Infrastructure / DevOps,Operating System,"Windows, Linux, macOS"
Infrastructure / DevOps,Virtual Machines (IaaS Compute),"Amazon EC2, Azure Virtual Machines, Google Compute Engine, DigitalOcean Droplets, OVHcloud, Linode"
Infrastructure / DevOps,Container Platform,"Docker, containerd, Podman, LXC/LXD, rkt"
Infrastructure / DevOps,Container Orchestrator,"Kubernetes, Amazon ECS, HashiCorp Nomad, Docker Swarm, Apache Mesos/Marathon"
Infrastructure / DevOps,CI/CD Platform,"GitHub Actions, Jenkins, GitLab CI, Azure DevOps Pipelines, CircleCI, Bitbucket Pipelines"
Infrastructure / DevOps,Code Hosting Platform,"GitHub, GitLab, Bitbucket, Azure Repos, SourceHut"
Infrastructure / DevOps,Web App Hosting Platform,"Vercel, Netlify, Cloudflare Pages, Firebase Hosting, AWS Amplify, Render, Fly.io"
Cross-cutting,AI Chatbot,"ChatGPT, Claude, Gemini, GitHub Copilot, Perplexity"`

// --- ANALYTICAL DIAGNOSTICS ---
const diagnosticsDict: Record<string, string> = {
  "Docker": "The industry's favorite localized rug. Essential for sweeping dependency chaos into a neat, 2GB black box that works 'on my machine'.",
  "Kubernetes": "The gold standard for over-engineering. It turns a simple deployment into a full-time career in YAML writing. High probability of resume-driven development.",
  "React": "Stockholm Syndrome as a service. Render 4MB of JS for a static page and call it 'innovation'. The industry's most successful experiment in complexity.",
  "TypeScript": "JavaScript with a hall monitor. You'll spend 40% of your day fighting the compiler just to realize the bug was a logic error anyway.",
  "AI Chatbot": "A statistical mirror reflecting our own technical laziness. Great for generating code that 'mostly' works but fails the security audit.",
  "Next.js": "The reincarnation of PHP but with a Vercel-shaped subscription tax. We've spent a decade moving back to where we started.",
  "Rust": "Memory safety at the cost of your sanity. The borrow checker is the final boss of professional software engineering.",
  "Java (JVM)": "The indestructible legacy. It will be running the world's global banking infrastructure long after the heat death of the universe.",
  "Serverless": "Paying Jeff Bezos per millisecond for the privilege of cold starts and proprietary vendor lock-in. There is no cloud, just someone else's computer.",
  "default": "Ecosystem Status: Volatile. High probability of this asset being deprecated by an influencer before you finish the tutorial."
}

function getDiagnostic(label: string): string {
  for (const [key, value] of Object.entries(diagnosticsDict)) {
    if (label.toLowerCase().includes(key.toLowerCase())) return value
  }
  return diagnosticsDict.default
}

type Asset = { id: string; label: string; diagnostic: string }
type Sector = { id: string; label: string; assets: Asset[] }
type SuperCategory = { id: string; label: string; sectors: Sector[] }

export default function OntologyPage() {
  const [isBooted, setIsBooted] = useState(false)

  const [activeSuperId, setActiveSuperId] = useState<string | null>(null)
  const [activeSectorId, setActiveSectorId] = useState<string | null>(null)
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)

  const [displaySuperId, setDisplaySuperId] = useState<string | null>(null)
  const [isSectorFadingOut, setIsSectorFadingOut] = useState(false)
  const [isSectorReady, setIsSectorReady] = useState(false)

  const [displaySectorId, setDisplaySectorId] = useState<string | null>(null)
  const [isAssetFadingOut, setIsAssetFadingOut] = useState(false)
  const [isAssetReady, setIsAssetReady] = useState(false)

  const [hoveredAsset, setHoveredAsset] = useState<Asset | Sector | null>(null)

  const superTrackRef = useRef<HTMLDivElement>(null)
  const sectorTrackRef = useRef<HTMLDivElement>(null)
  const assetTrackRef = useRef<HTMLDivElement>(null)

  const data = useMemo<SuperCategory[]>(() => {
    const lines = rawCsvData.trim().split('\n').slice(1)
    const superMap = new Map<string, SuperCategory>()
    lines.forEach((line) => {
      const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      if (parts.length < 3) return
      const superCat = parts[0].trim()
      const sector = parts[1].trim()
      const siblings = parts[2].replace(/"/g, '').split(',').map((s) => s.trim())
      if (!superMap.has(superCat)) {
        superMap.set(superCat, { id: `super_${superCat.replace(/\s+/g, '_')}`, label: superCat, sectors: [] })
      }
      const currentSuper = superMap.get(superCat)!
      currentSuper.sectors.push({
        id: `sector_${sector.replace(/\s+/g, '_').replace(/\//g, '')}`,
        label: sector,
        assets: siblings.map((sib, j) => ({
          id: `asset_${sector.replace(/\s+/g, '_').replace(/\//g, '')}_${j}`,
          label: sib,
          diagnostic: getDiagnostic(sib)
        }))
      })
    })
    return Array.from(superMap.values())
  }, [])

  const alignTrack = (trackRef: React.RefObject<HTMLDivElement | null>, targetId: string | null, immediate = false) => {
    if (!targetId) return
    const track = trackRef.current
    const target = document.getElementById(targetId)
    if (!track || !target) return
    const targetCenter = target.offsetLeft + target.offsetWidth / 2
    const tx = -targetCenter
    if (immediate) {
      track.style.transition = 'none'
      track.style.transform = `translate3d(${tx}px, 0, 0)`
      void track.offsetHeight
      track.style.transition = ''
    } else {
      track.style.transform = `translate3d(${tx}px, 0, 0)`
    }
  }

  // 1. Boot sequence
  useEffect(() => {
    if (data.length > 0 && !isBooted) {
      const midSuper = data[Math.floor(data.length / 2)]
      const midSector = midSuper.sectors[Math.floor(midSuper.sectors.length / 2)]
      const midAsset = midSector.assets[Math.floor(midSector.assets.length / 2)]

      setActiveSuperId(midSuper.id)
      setDisplaySuperId(midSuper.id)
      setActiveSectorId(midSector.id)
      setDisplaySectorId(midSector.id)
      setSelectedAssetId(midAsset.id)

      requestAnimationFrame(() => {
        alignTrack(superTrackRef, midSuper.id, true)
        alignTrack(sectorTrackRef, midSector.id, true)
        alignTrack(assetTrackRef, midAsset.id, true)
        setIsSectorReady(true)
        setIsAssetReady(true)
        setIsBooted(true)
      })
    }
  }, [data, isBooted])

  const handleSuperClick = (supId: string) => {
    if (supId === activeSuperId) return
    setActiveSuperId(supId)
    alignTrack(superTrackRef, supId, false)
    const newSuper = data.find((s) => s.id === supId)
    if (newSuper) {
      const midSector = newSuper.sectors[Math.floor(newSuper.sectors.length / 2)]
      setActiveSectorId(midSector.id)
    }
  }

  const handleSectorClick = (secId: string) => {
    if (secId === activeSectorId) return
    setActiveSectorId(secId)
    alignTrack(sectorTrackRef, secId, false)
  }

  const handleAssetClick = (assetId: string) => {
    if (assetId === selectedAssetId) return
    setSelectedAssetId(assetId)
    alignTrack(assetTrackRef, assetId, false)
  }

  // 2. Sector cascade fade
  useEffect(() => {
    if (activeSuperId && displaySuperId && activeSuperId !== displaySuperId) {
      setIsSectorFadingOut(true)
      const timer = setTimeout(() => {
        setIsSectorReady(false)
        setDisplaySuperId(activeSuperId)
        setIsSectorFadingOut(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [activeSuperId, displaySuperId])

  // 3. Zero-paint re-alignment (sectors)
  useLayoutEffect(() => {
    if (displaySuperId && !isSectorFadingOut && !isSectorReady) {
      requestAnimationFrame(() => {
        alignTrack(sectorTrackRef, activeSectorId, true)
        requestAnimationFrame(() => setIsSectorReady(true))
      })
    }
  }, [displaySuperId, isSectorFadingOut, isSectorReady, activeSectorId])

  // 4. Asset cascade fade
  useEffect(() => {
    if (activeSectorId && displaySectorId && activeSectorId !== displaySectorId) {
      setIsAssetFadingOut(true)
      const timer = setTimeout(() => {
        setIsAssetReady(false)
        setDisplaySectorId(activeSectorId)
        setIsAssetFadingOut(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [activeSectorId, displaySectorId])

  // 5. Zero-paint re-alignment (assets)
  useLayoutEffect(() => {
    if (displaySectorId && !isAssetFadingOut && !isAssetReady) {
      const displaySectorData = data.flatMap((sup) => sup.sectors).find((s) => s.id === displaySectorId)
      if (displaySectorData) {
        const midIndex = Math.floor(displaySectorData.assets.length / 2)
        const midAssetId = displaySectorData.assets[midIndex].id
        setSelectedAssetId(midAssetId)
        requestAnimationFrame(() => {
          alignTrack(assetTrackRef, midAssetId, true)
          requestAnimationFrame(() => setIsAssetReady(true))
        })
      }
    }
  }, [displaySectorId, isAssetFadingOut, isAssetReady, data])

  const displaySuperData = useMemo(() => data.find((s) => s.id === displaySuperId), [data, displaySuperId])
  const displaySector = useMemo(
    () => data.flatMap((sup) => sup.sectors).find((s) => s.id === displaySectorId),
    [data, displaySectorId]
  )

  const getSequentialDelay = (index: number, total: number) => {
    const mid = Math.floor(total / 2)
    const distance = Math.abs(index - mid)
    if (distance === 0) return '0ms'
    return `${200 + distance * 50}ms`
  }

  return (
    <div className="flex h-screen w-full bg-[#010204] text-slate-300 font-mono overflow-hidden selection:bg-cyan-900">

      {/* HUD OVERLAYS */}
      <div className="absolute top-6 left-8 z-50 pointer-events-none">
        <div className="flex items-center gap-2 text-cyan-600 text-[11px] uppercase tracking-[0.4em]">
          <Activity size={14} className="animate-pulse" />
          <span>Centric Aperture v9.1</span>
        </div>
      </div>

      <div className="absolute top-6 right-8 text-right z-50 pointer-events-none opacity-40">
        <div className="text-cyan-700 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
          Virtual Conveyor Engine
        </div>
        <div className="text-slate-700 text-[8px] uppercase tracking-widest">
          Native Scrolling: Decommissioned
        </div>
      </div>

      <div
        className={`flex-1 flex flex-col items-center justify-center relative transition-opacity duration-700 ${
          isBooted ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '100px 100px'
          }}
        />

        {/* Center axis */}
        <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-cyan-500/10 -translate-x-1/2 pointer-events-none z-10 hidden md:block" />

        <div className="w-full z-20 flex flex-col items-center gap-14">

          {/* TRACK 1: SUPER-CATEGORIES */}
          <div className="w-full flex flex-col items-center gap-2">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.6em] text-slate-600">
              <Boxes size={12} className="text-slate-800" />
              <span>Domain Governance</span>
            </div>
            <div className="relative w-full h-14 overflow-hidden mask-aperture">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-full border-x border-cyan-500/20 bg-cyan-500/[0.02] pointer-events-none" />
              <div
                ref={superTrackRef}
                className="absolute top-0 left-1/2 h-full flex items-center gap-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-max"
              >
                {data.map((sup) => (
                  <button
                    key={sup.id}
                    id={sup.id}
                    onClick={() => handleSuperClick(sup.id)}
                    className={`flex-shrink-0 px-8 py-2 text-[12.5px] font-bold uppercase tracking-[0.2em] transition-all duration-500 rounded-sm border
                      ${activeSuperId === sup.id
                        ? 'bg-slate-100 text-slate-900 border-white shadow-[0_0_25px_rgba(255,255,255,0.2)] scale-105'
                        : 'bg-transparent text-slate-600 border-slate-900 hover:border-slate-700 hover:text-slate-400'
                      }`}
                  >
                    {sup.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* TRACK 2: SECTORS */}
          <div className="w-full flex flex-col items-center gap-2">
            <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.4em] text-slate-500">
              <Layers size={10} className="text-cyan-900" />
              <span>Strategic Sub-Sectors</span>
            </div>
            <div className="relative w-full h-16 overflow-hidden mask-aperture">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-full border-x border-cyan-500/10 pointer-events-none" />
              <div className={`absolute inset-0 transition-opacity duration-200 ${isSectorFadingOut ? 'opacity-0' : 'opacity-100'}`}>
                <div
                  key={`sector_track_${displaySuperId}`}
                  ref={sectorTrackRef}
                  className={`absolute top-0 left-1/2 h-full flex items-center gap-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-max ${
                    isSectorReady ? 'visible opacity-100' : 'invisible opacity-0'
                  }`}
                >
                  {displaySuperData?.sectors.map((sector, index) => {
                    const total = displaySuperData.sectors.length
                    const mid = Math.floor(total / 2)
                    const isTrunk = index === mid
                    const isLeftOfTrunk = index < mid
                    const isActive = activeSectorId === sector.id
                    const delay = getSequentialDelay(index, total)
                    const origin = isTrunk ? 'center' : isLeftOfTrunk ? 'right center' : 'left center'
                    return (
                      <button
                        key={sector.id}
                        id={sector.id}
                        onClick={() => handleSectorClick(sector.id)}
                        onMouseEnter={() => setHoveredAsset(sector)}
                        onMouseLeave={() => setHoveredAsset(null)}
                        style={{ animationDelay: isSectorReady ? delay : '0ms', transformOrigin: origin }}
                        className={`flex-shrink-0 px-5 py-1.5 text-[11px] font-bold uppercase tracking-tighter border rounded-sm whitespace-nowrap transition-colors duration-300 shadow-xl
                          ${isSectorReady ? (isTrunk ? 'trunk-spawn' : 'branch-spawn') : 'opacity-0'}
                          ${isActive
                            ? 'border-cyan-400 bg-cyan-950/40 text-cyan-100 shadow-cyan-500/20 scale-105'
                            : 'bg-[#05070a]/40 text-slate-600 border-slate-900/60 hover:border-cyan-800 hover:bg-slate-900 hover:text-slate-300'
                          }`}
                      >
                        {sector.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* TRACK 3: ASSETS */}
          <div className="w-full flex flex-col items-center gap-2">
            <div className="flex items-center gap-3 text-[8px] uppercase tracking-[0.3em] text-cyan-900">
              <Terminal size={10} />
              <span>Tactical Asset Deployment</span>
            </div>
            <div className="relative w-full h-24 overflow-hidden mask-aperture">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-[60%] border-x border-cyan-400/30 bg-cyan-400/[0.03] pointer-events-none rounded-sm" />
              <div className={`absolute inset-0 transition-opacity duration-200 ${isAssetFadingOut ? 'opacity-0' : 'opacity-100'}`}>
                <div
                  key={`asset_track_${displaySectorId}`}
                  ref={assetTrackRef}
                  className={`absolute top-0 left-1/2 h-full flex items-center gap-2 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-max ${
                    isAssetReady ? 'visible opacity-100' : 'invisible opacity-0'
                  }`}
                >
                  {displaySector?.assets.map((asset, index) => {
                    const total = displaySector.assets.length
                    const mid = Math.floor(total / 2)
                    const isTrunk = index === mid
                    const isLeftOfTrunk = index < mid
                    const isActive = selectedAssetId === asset.id
                    const delay = getSequentialDelay(index, total)
                    const origin = isTrunk ? 'center' : isLeftOfTrunk ? 'right center' : 'left center'
                    return (
                      <button
                        key={asset.id}
                        id={asset.id}
                        onClick={() => handleAssetClick(asset.id)}
                        onMouseEnter={() => setHoveredAsset(asset)}
                        onMouseLeave={() => setHoveredAsset(null)}
                        style={{ animationDelay: isAssetReady ? delay : '0ms', transformOrigin: origin }}
                        className={`flex-shrink-0 px-6 py-2.5 border rounded-sm transition-colors duration-300 shadow-xl
                          ${isAssetReady ? (isTrunk ? 'trunk-spawn' : 'branch-spawn') : 'opacity-0'}
                          ${isActive
                            ? 'border-cyan-400 bg-cyan-950/40 text-cyan-100 scale-105 shadow-cyan-500/20'
                            : 'border-slate-900/60 bg-[#05070a]/40 text-slate-600 hover:border-cyan-800 hover:bg-slate-900 hover:text-slate-300'
                          }`}
                      >
                        <span className="text-[13.5px] font-bold uppercase tracking-tight whitespace-nowrap">
                          {asset.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* DIAGNOSTICS */}
          <div className="h-28 w-full max-w-3xl flex flex-col items-center justify-center text-center mt-6">
            <div className={`transition-all duration-500 flex flex-col items-center gap-4 ${hoveredAsset ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="flex items-center gap-2 text-amber-500/60 text-[9px] uppercase tracking-[0.4em]">
                <AlertTriangle size={12} />
                <span>Analytical Diagnostics System</span>
              </div>
              <p className="text-[14px] min-h-[3rem] text-slate-200 leading-relaxed italic px-12">
                {hoveredAsset && 'diagnostic' in hoveredAsset ? `"${hoveredAsset.diagnostic}"` : ' '}
              </p>
            </div>
          </div>
        </div>

        {/* HUD FOOTER */}
        <div className="absolute bottom-8 left-12 right-12 flex items-center justify-between opacity-30 pointer-events-none">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.4em]">
              <Globe size={12} />
              <span>Architecture: Hardware_Composited</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.4em]">
              <Zap size={12} />
              <span>Stability: Absolute_X_Axis</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.4em]">
            <Target size={12} />
            <span>Aperture: Locked</span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .mask-aperture {
          mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 25%, rgba(0,0,0,1) 45%, rgba(0,0,0,1) 55%, rgba(0,0,0,0.3) 75%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 25%, rgba(0,0,0,1) 45%, rgba(0,0,0,1) 55%, rgba(0,0,0,0.3) 75%, transparent 100%);
        }
        @keyframes trunk-spawn {
          0% { opacity: 0; transform: translateY(-20px) scale(0.8); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes branch-spawn {
          0% { opacity: 0; transform: scaleX(0); }
          100% { opacity: 1; transform: scaleX(1); }
        }
        .trunk-spawn {
          opacity: 0;
          animation: trunk-spawn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .branch-spawn {
          opacity: 0;
          animation: branch-spawn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  )
}
