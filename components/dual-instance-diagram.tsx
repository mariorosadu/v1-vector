'use client'

import React, { useState, useMemo } from 'react';
import { BarChart2, Crosshair, TrendingUp, Database, Activity, AlertTriangle } from 'lucide-react';

// --- DATA INGESTION ---
const rawCsvData = `Category,Siblings
Application Platform / Runtime Ecosystem,"Java (JVM), Microsoft .NET, Node.js, Python, PHP, Go, Ruby, Rust"
Web Server,"Nginx, Apache HTTP Server, Microsoft IIS, LiteSpeed, Caddy"
Operating System,"Windows, Linux, macOS"
Web Browser,"Chrome, Safari, Edge, Firefox, Samsung Internet, Opera"
UI Framework,"React, Angular, Vue, Svelte, Solid, Qwik"
Server Runtime,"Java (JVM), Node.js, Python, .NET, PHP, Go, Ruby, Rust"
Web Primitive,"HTML, CSS, JavaScript"
Relational Database,"MySQL, PostgreSQL, SQL Server, Oracle Database, MariaDB, IBM Db2"
CSS Framework,"Tailwind CSS, Bootstrap, Bulma, Foundation, UIkit, Materialize"
Web App Framework,"Next.js, Nuxt, Astro, Remix, Gatsby, SvelteKit"
Event Delivery Mechanism,"Webhooks, Pub/Sub (queues), WebSockets, Server-Sent Events, Event Streams, Polling, Long Polling"
Search Engine,"Elasticsearch, OpenSearch, Algolia, Apache Solr, Meilisearch, Typesense"
Auth Protocol,"OAuth 2.0, OpenID Connect, SAML, LDAP, Kerberos, WebAuthn"
JavaScript Package Manager,"npm, yarn, pnpm, bun"
Frontend Build Tool,"Webpack, Vite, Rollup, esbuild, Parcel, Turbopack"
Container Platform,"Docker, containerd, Podman, LXC/LXD, rkt"
Container Orchestrator,"Kubernetes, Amazon ECS, HashiCorp Nomad, Docker Swarm, Apache Mesos/Marathon"
CI/CD Platform,"GitHub Actions, Jenkins, GitLab CI, Azure DevOps Pipelines, CircleCI, Bitbucket Pipelines"
Code Hosting Platform,"GitHub, GitLab, Bitbucket, Azure Repos, SourceHut"
Web App Hosting Platform,"Vercel, Netlify, Cloudflare Pages, Firebase Hosting, AWS Amplify, Render, Fly.io"
Serverless Functions (FaaS),"AWS Lambda, Azure Functions, Google Cloud Functions, Cloudflare Workers, Netlify Functions, Vercel Functions, Fastly Compute"
Virtual Machines (IaaS Compute),"Amazon EC2, Azure Virtual Machines, Google Compute Engine, DigitalOcean Droplets, OVHcloud, Linode"`;

// --- CYNICAL ANALYST LEXICON ---
const diagnosticsDict = {
  "Docker": "Put it on your CV 15 times. Still the only way to prove 'it works on my machine' to the QA team. Containerization is just sweeping dependency hell under a localized rug.",
  "Kubernetes": "A platform built by Google so you can run your 3-container blog with the operational overhead of a Fortune 500 company. High risk of resume-driven development.",
  "React": "The UI framework you choose because nobody gets fired for choosing it. Excellent for rendering a static button with 4MB of JavaScript payload.",
  "Angular": "Enterprise Stockholm Syndrome. Heavy, opinionated, and beloved by people who miss writing Java in 2008.",
  "Next.js": "Re-inventing PHP templating, but this time with a Vercel subscription and endless hydration errors.",
  "Java (JVM)": "Write once, debug everywhere. The corporate cockroach that will survive a nuclear apocalypse and outlive us all. Reliable, but soulless.",
  "Node.js": "Because backend developers got tired of context-switching and decided to bring frontend chaos directly to the server.",
  "JavaScript": "A language designed in 10 days that somehow conquered the world. The duct tape holding the global economy together.",
  "Relational Database": "The only part of your stack that actually matters. Everything else is just a temporary, highly volatile UI for it.",
  "Web App Framework": "A constantly rotating carousel of meta-frameworks promising to fix the monumental architecture problems created by the previous meta-framework.",
  "Serverless Functions (FaaS)": "For when you want to pay AWS per millisecond to experience agonizing cold starts. Serverless just means 'someone else's servers that you have less control over'.",
  "Virtual Machines (IaaS Compute)": "Someone else's computer, but you still have to patch the OS. Truly the worst of both worlds.",
  "CI/CD Platform": "Highly sophisticated automated pipelines designed to deploy your bugs to production faster and with more confidence than ever before.",
  "JavaScript Package Manager": "A mechanism to download half the internet into a 'node_modules' folder just to center a div. The primary vector for supply chain attacks.",
  "Webhooks": "The lazy engineer's event bus. 'Just throw an HTTP POST at it and hope they acknowledge it.'",
  "HTML": "The one thing browsers actually understand before we bury it in 15 layers of abstraction and virtual DOMs.",
  "Vercel": "Excellent developer experience, assuming you enjoy mortgaging your house to pay for bandwidth overages.",
  "Tailwind CSS": "Inline styles but with a build step. We've come full circle and we're pretending it's innovation.",
  "Rust": "The veganism of programming languages. Don't worry, the developer will tell you they use it within 5 minutes of meeting them.",
  "default": "Market saturation is high. Expect 2-3 of these competitors to be deprecated or acquired by Broadcom within the next 36 months."
};

function getDiagnostic(label) {
  for (const [key, value] of Object.entries(diagnosticsDict)) {
    if (label.toLowerCase().includes(key.toLowerCase())) return value;
  }
  return diagnosticsDict.default;
}

// Generates a mock "price/trend" for the ticker items
const generateMockTrend = (label) => {
  const hash = label.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const isUp = hash % 2 === 0;
  const change = ((hash % 150) / 10).toFixed(1);
  return { isUp, change };
};

export function DualInstanceDiagram() {
  const [selectedNode, setSelectedNode] = useState(null);

  // 1. Parse Data into Rows
  const rows = useMemo(() => {
    const lines = rawCsvData.trim().split('\n').slice(1);
    const parsedRows = [];

    lines.forEach((line, i) => {
      const match = line.match(/^([^,]+),"(.*)"$/);
      if (!match) return;
      
      const categoryLabel = match[1].trim();
      const siblingsStr = match[2].trim();
      const siblings = siblingsStr.split(',').map(s => s.trim());
      
      parsedRows.push({
        id: `cat_${i}`,
        category: categoryLabel,
        items: siblings.map(sib => ({
          id: `sib_${sib.replace(/\s+/g, '_')}`,
          label: sib,
          category: categoryLabel,
          trend: generateMockTrend(sib)
        }))
      });
    });

    return parsedRows;
  }, []);

  // 2. Compute related nodes for Inspector
  const relatedNodes = useMemo(() => {
    if (!selectedNode) return [];
    const row = rows.find(r => r.category === selectedNode.category);
    return row ? row.items.filter(item => item.id !== selectedNode.id) : [];
  }, [selectedNode, rows]);

  return (
    <div className="flex h-screen w-full bg-[#0a0f18] text-slate-300 font-sans overflow-hidden selection:bg-cyan-900">
      
      {/* LEFT: Ticker Board */}
      <div className="flex-1 flex flex-col border-r border-slate-800 bg-[#05080f] relative z-10">
        
        {/* Terminal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#0a0f18] flex justify-between items-center shadow-md z-20">
          <div className="flex items-center gap-3 text-cyan-500 font-mono text-sm tracking-widest uppercase">
            <BarChart2 size={18} />
            <span>Market Ontology Terminal</span>
            <span className="text-xs text-slate-600 ml-4 border border-slate-700 px-2 py-0.5 rounded-full animate-pulse">LIVE EXCHANGES</span>
          </div>
          <div className="text-slate-500 font-mono text-[10px]">
            SYS_ID: TRM-99 | ASSETS TRACKED: {rows.reduce((acc, row) => acc + row.items.length, 0)}
          </div>
        </div>

        {/* Ticker Rows */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wMykiLz48L3N2Zz4=')] mix-blend-screen opacity-50 z-0"></div>
          
          <div className="divide-y divide-slate-800/60 z-10 relative">
            {rows.map((row, rowIndex) => {
              // Duplicate items to create seamless loop
              const loopedItems = [...row.items, ...row.items];
              // Randomize animation speed slightly per row
              const duration = 25 + (row.items.length * 2) + (rowIndex % 3) * 5; 

              return (
                <div key={row.id} className="flex group hover:bg-slate-800/30 transition-colors duration-300">
                  {/* Category Title Fixed on Left */}
                  <div className="w-64 flex-shrink-0 px-4 py-3 border-r border-slate-800/60 bg-[#080c14] z-10 flex flex-col justify-center">
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">Sector</span>
                    <span className="font-semibold text-slate-200 text-sm leading-tight group-hover:text-cyan-400 transition-colors">
                      {row.category}
                    </span>
                  </div>

                  {/* Scrolling Ticker Container */}
                  <div className="flex-1 overflow-hidden relative flex items-center bg-[#03050a] pause-on-hover cursor-pointer mask-edges">
                    <div 
                      className="flex animate-ticker whitespace-nowrap"
                      style={{ animationDuration: `${duration}s` }}
                    >
                      {loopedItems.map((item, idx) => {
                        const isSelected = selectedNode?.id === item.id;
                        
                        return (
                          <div 
                            key={`${item.id}_${idx}`}
                            onClick={() => setSelectedNode(item)}
                            className={`flex items-center gap-2 px-6 py-2 border-r border-slate-800/40 transition-all duration-200
                              ${isSelected ? 'bg-cyan-950/50 text-cyan-300 shadow-[inset_0_0_15px_rgba(6,182,212,0.2)]' : 'hover:bg-slate-800/50 hover:text-white'}
                            `}
                          >
                            <span className="font-mono font-medium text-sm">{item.label}</span>
                            <div className={`flex items-center text-[10px] font-mono ${item.trend.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {item.trend.isUp ? '▲' : '▼'} {item.trend.change}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: Inspector Panel */}
      <div className="w-[420px] bg-[#080c14] flex flex-col shadow-2xl relative z-20 border-l border-slate-800">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-[#0a0f18]">
          <div className="flex items-center gap-3 text-slate-500 mb-3 font-mono text-xs uppercase tracking-widest">
            <Crosshair size={14} className="text-cyan-500" />
            <span>Asset Inspector</span>
          </div>
          {selectedNode ? (
            <div>
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-3xl font-bold text-slate-100 tracking-tight leading-tight">
                  {selectedNode.label}
                </h2>
                <div className={`flex flex-col items-end ${selectedNode.trend.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <span className="font-mono text-lg font-bold flex items-center gap-1">
                    {selectedNode.trend.isUp ? '▲' : '▼'} {selectedNode.trend.change}%
                  </span>
                  <span className="text-[10px] uppercase text-slate-500">24H Volatility</span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-2 py-1 rounded text-[10px] font-mono uppercase tracking-widest bg-purple-950/50 text-purple-400 border border-purple-900/50">
                  {selectedNode.category}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-24 flex items-center text-slate-600 font-mono italic text-sm">
              Awaiting asset lock... Click any ticker item.
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          
          {selectedNode && (
            <>
              {/* Analyst Notes Segment */}
              <div className="bg-slate-900/50 rounded-lg p-5 border border-amber-900/30 relative overflow-hidden group shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                <div className="flex items-center gap-2 mb-3 text-amber-500">
                  <AlertTriangle size={16} />
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider">Analyst Diagnostics</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-mono">
                  {getDiagnostic(selectedNode.label)}
                </p>
              </div>

              {/* Related Topology Segment */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <TrendingUp size={16} />
                    <h3 className="font-mono text-xs font-bold uppercase tracking-wider">
                      Sector Competitors
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">Lateral View</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  {relatedNodes.map(node => (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className="flex justify-between items-center px-4 py-2.5 rounded-md font-medium transition-all duration-200 border bg-[#05080f] text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-600 group"
                    >
                      <span className="text-sm font-mono group-hover:text-cyan-400">{node.label}</span>
                      <span className={`text-xs font-mono ${node.trend.isUp ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                        {node.trend.isUp ? '+' : '-'}{node.trend.change}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Metadata Mock Segment */}
              <div className="mt-auto pt-6 border-t border-slate-800/50">
                <div className="flex items-center gap-2 mb-3 text-slate-500">
                  <Database size={14} />
                  <h3 className="font-mono text-xs uppercase tracking-wider">System Metadata</h3>
                </div>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 font-mono text-[11px]">
                  <div className="bg-[#05080f] p-2 rounded border border-slate-800">
                    <span className="block text-slate-600 mb-1">Status</span>
                    <span className="text-emerald-400 font-bold tracking-wider">OPERATIONAL</span>
                  </div>
                  <div className="bg-[#05080f] p-2 rounded border border-slate-800">
                    <span className="block text-slate-600 mb-1">Market Saturation</span>
                    <span className="text-rose-400 font-bold tracking-wider">HIGH RISK</span>
                  </div>
                  <div className="bg-[#05080f] p-2 rounded border border-slate-800">
                    <span className="block text-slate-600 mb-1">Debt Load</span>
                    <span className="text-amber-400 font-bold tracking-wider">CRITICAL</span>
                  </div>
                  <div className="bg-[#05080f] p-2 rounded border border-slate-800">
                    <span className="block text-slate-600 mb-1">Asset Hash</span>
                    <span className="text-slate-500 truncate w-full block">{selectedNode.id}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {!selectedNode && (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-4">
              <div className="w-16 h-16 rounded-full border border-slate-800 flex items-center justify-center bg-[#05080f]">
                <Activity size={24} className="text-slate-600 animate-pulse" />
              </div>
              <div>
                <p className="font-mono text-sm mb-1 text-slate-400">Monitoring Ecosystem.</p>
                <p className="text-xs text-slate-600 px-4">Intercepting high-frequency data from the framework wars. Select a technology to run deep diagnostics.</p>
              </div>
            </div>
          )}

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        /* Infinite Ticker Animation */
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-ticker {
          animation-name: ticker;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          width: fit-content;
        }

        /* Hover to pause all scrolling inside that row */
        .pause-on-hover:hover .animate-ticker {
          animation-play-state: paused;
        }

        /* Gradient mask to fade out the edges of the ticker */
        .mask-edges {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }

        /* Dark, slim scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #334155;
        }
      `}} />
    </div>
  );
}
