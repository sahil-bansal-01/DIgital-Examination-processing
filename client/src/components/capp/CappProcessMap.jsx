import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Activity, 
  CheckCircle2, 
  Server, 
  Database, 
  ShieldCheck, 
  Layers, 
  Terminal,
  Zap,
  Sparkles
} from 'lucide-react';

export const CappProcessMap = () => {
  const [selectedNode, setSelectedNode] = useState('workers'); // default highlight on workers
  const [isSimulating, setIsSimulating] = useState(false);

  // Nodes metadata matching specification
  const nodes = [
    {
      id: 'exam',
      label: 'EXAM',
      sub: '01 / CONFIG',
      side: 'left',
      yPos: '22%',
      xPos: '8%',
      icon: Layers,
      highlight: false,
      color: '#00F2FF',
      metrics: {
        title: 'EXAM 01 / CONFIGURATION ENGINE',
        status: 'READY & SYNCED',
        detail: 'Active Exam Blueprints: 8 | Dynamic Matrix Parsing | Anti-Collision Seating & Roll Scheduling',
        throughput: '2,400 configurations/sec',
      },
    },
    {
      id: 'audit',
      label: 'AUDIT',
      sub: '05 / TRACK',
      side: 'left',
      yPos: '50%',
      xPos: '8%',
      icon: ShieldCheck,
      highlight: false,
      color: '#A855F7',
      metrics: {
        title: 'AUDIT 05 / CRYPTOGRAPHIC AUDIT BUS',
        status: 'IMMUTABLE RECORDING',
        detail: 'SHA-256 Ledger Active | 0 Tamper Events | Granular Marks Modification Trail',
        throughput: '100% Verified Log Chain',
      },
    },
    {
      id: 'results',
      label: 'RESULTS',
      sub: '04 / OUTPUT',
      side: 'left',
      yPos: '78%',
      xPos: '8%',
      icon: CheckCircle2,
      highlight: false,
      color: '#10B981',
      metrics: {
        title: 'RESULTS 04 / ANALYTICS & OUTPUT',
        status: 'STREAM DISPATCH READY',
        detail: 'Automatic SGPA/CGPA Aggregation | Grade Bell-Curve Analytics | Instant Marksheet Generation',
        throughput: '9,800 records/sec',
      },
    },
    {
      id: 'answers',
      label: 'ANSWERS',
      sub: '02 / INGEST',
      side: 'right',
      yPos: '22%',
      xPos: '8%',
      icon: Database,
      highlight: false,
      color: '#00F2FF',
      metrics: {
        title: 'ANSWERS 02 / PARALLEL INGESTION',
        status: 'HIGH-BANDWIDTH STREAM',
        detail: 'Bulk PDF & OMR Ingestion Pipeline | CRC32 Validation | Zero Data Packet Loss',
        throughput: '14,200 papers/min',
      },
    },
    {
      id: 'workers',
      label: 'WORKERS',
      sub: '24 / ACTIVE',
      side: 'right',
      yPos: '50%',
      xPos: '8%',
      icon: Cpu,
      highlight: true, // HIGHLIGHTED CYAN BOX per spec
      color: '#00F2FF',
      metrics: {
        title: 'WORKERS 24 / PARALLEL COMPUTE CLUSTER',
        status: 'PEAK EFFICIENCY // 24 THREADS',
        detail: 'SIMD Vector Batching | 24 Active Worker Cores | Zero Deadlocks | 99.4% CPU Saturation',
        throughput: 'Sub-millisecond latency per sheet chunk',
      },
    },
    {
      id: 'validation',
      label: 'VALIDATION',
      sub: '03 / VERIFY',
      side: 'right',
      yPos: '78%',
      xPos: '8%',
      icon: Activity,
      highlight: false,
      color: '#00F2FF',
      metrics: {
        title: 'VALIDATION 03 / AUTOMATED VERIFICATION',
        status: 'RULESETS ENFORCED',
        detail: 'Double-Blind Discrepancy Checks | Bounds Validation (0-100) | Teacher Sign-Off Gateway',
        throughput: '0 Anomalies Detected',
      },
    },
  ];

  const currentNode = nodes.find((n) => n.id === selectedNode) || nodes[4];

  const triggerComputePulse = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between font-mono select-none">
      {/* 1. Header Bar of Process Map */}
      <div className="flex items-center justify-between pb-3 border-b border-[#00F2FF]/20 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00F2FF] animate-pulse shadow-[0_0_10px_#00F2FF]" />
          <span className="text-white font-bold tracking-wider">// LIVE PROCESS MAP</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={triggerComputePulse}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-[10px] text-cyan-300 hover:text-white hover:border-[#00F2FF] transition cursor-pointer"
          >
            <Zap className={`w-3 h-3 text-[#00F2FF] ${isSimulating ? 'animate-bounce' : ''}`} />
            <span>PULSE BUS</span>
          </button>
          <span className="text-[10px] text-cyan-400/80 hidden sm:inline">DIFF / 07.12.83</span>
        </div>
      </div>

      {/* 2. Interactive SVG Graph Stage */}
      <div className="relative flex-1 flex items-center justify-center my-4 min-h-[340px] sm:min-h-[380px] w-full">
        {/* SVG Connecting Ray Lines & Circuit Pathways */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none" 
          viewBox="0 0 700 400" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="cyanLineGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F2FF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#00F2FF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00F2FF" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="purpleLineGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#00F2FF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0.8" />
            </linearGradient>

            <filter id="svgGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Lines from Center (350, 200) to Left Branches */}
          {/* Top-Left: EXAM 01 */}
          <path
            d="M350,200 L260,200 L210,90 L95,90"
            stroke={selectedNode === 'exam' ? '#00F2FF' : '#00F2FF'}
            strokeWidth={selectedNode === 'exam' ? '2.5' : '1.5'}
            strokeOpacity={selectedNode === 'exam' ? '1' : '0.45'}
            fill="none"
            strokeDasharray={selectedNode === 'exam' || isSimulating ? '6 4' : 'none'}
            className={selectedNode === 'exam' || isSimulating ? 'animate-pulse' : ''}
            filter="url(#svgGlow)"
          />

          {/* Mid-Left: AUDIT 05 */}
          <path
            d="M350,200 L95,200"
            stroke={selectedNode === 'audit' ? '#A855F7' : '#00F2FF'}
            strokeWidth={selectedNode === 'audit' ? '2.5' : '1.5'}
            strokeOpacity={selectedNode === 'audit' ? '1' : '0.45'}
            fill="none"
            strokeDasharray={selectedNode === 'audit' || isSimulating ? '6 4' : 'none'}
            filter="url(#svgGlow)"
          />

          {/* Bottom-Left: RESULTS 04 */}
          <path
            d="M350,200 L260,200 L210,310 L95,310"
            stroke={selectedNode === 'results' ? '#10B981' : '#00F2FF'}
            strokeWidth={selectedNode === 'results' ? '2.5' : '1.5'}
            strokeOpacity={selectedNode === 'results' ? '1' : '0.45'}
            fill="none"
            strokeDasharray={selectedNode === 'results' || isSimulating ? '6 4' : 'none'}
            filter="url(#svgGlow)"
          />

          {/* Lines from Center (350, 200) to Right Branches */}
          {/* Top-Right: ANSWERS 02 */}
          <path
            d="M350,200 L440,200 L490,90 L605,90"
            stroke={selectedNode === 'answers' ? '#00F2FF' : '#00F2FF'}
            strokeWidth={selectedNode === 'answers' ? '2.5' : '1.5'}
            strokeOpacity={selectedNode === 'answers' ? '1' : '0.45'}
            fill="none"
            strokeDasharray={selectedNode === 'answers' || isSimulating ? '6 4' : 'none'}
            filter="url(#svgGlow)"
          />

          {/* Mid-Right: WORKERS 24 (Highlighted Active Line) */}
          <path
            d="M350,200 L605,200"
            stroke="#00F2FF"
            strokeWidth="3"
            strokeOpacity="0.95"
            fill="none"
            filter="url(#svgGlow)"
          />

          {/* Bottom-Right: VALIDATION 03 */}
          <path
            d="M350,200 L440,200 L490,310 L605,310"
            stroke={selectedNode === 'validation' ? '#00F2FF' : '#00F2FF'}
            strokeWidth={selectedNode === 'validation' ? '2.5' : '1.5'}
            strokeOpacity={selectedNode === 'validation' ? '1' : '0.45'}
            fill="none"
            strokeDasharray={selectedNode === 'validation' || isSimulating ? '6 4' : 'none'}
            filter="url(#svgGlow)"
          />

          {/* Solder Via Nodes on Junctions */}
          <circle cx="210" cy="90" r="3" fill="#00F2FF" />
          <circle cx="210" cy="310" r="3" fill="#00F2FF" />
          <circle cx="490" cy="90" r="3" fill="#00F2FF" />
          <circle cx="490" cy="310" r="3" fill="#00F2FF" />
        </svg>

        {/* Central Glowing Circle: "CAPP ENGINE - COMPUTE ACTIVE" */}
        <div className="relative z-10 flex flex-col items-center justify-center p-5 rounded-full bg-gradient-to-tr from-[#050912] via-[#0F172A] to-[#050912] border-2 border-[#00F2FF] shadow-[0_0_35px_rgba(0,242,255,0.45)] w-36 h-36 sm:w-40 sm:h-40">
          {/* Animated Glowing Outer Ring */}
          <div 
            className="absolute inset-[-6px] rounded-full border border-purple-500/40 animate-ping opacity-40 pointer-events-none" 
            style={{ animationDuration: '4s' }} 
          />
          <div 
            className="absolute inset-[-12px] rounded-full border border-[#00F2FF]/20 border-dashed animate-spin pointer-events-none" 
            style={{ animationDuration: '28s' }} 
          />

          {/* Inner Content */}
          <div className="text-center font-mono relative z-20">
            <span className="block text-sm sm:text-base font-black text-white tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
              CAPP
            </span>
            <span className="block text-xs sm:text-sm font-black text-[#00F2FF] text-glow-cyan tracking-wider">
              ENGINE
            </span>
            <div className="mt-1.5 flex items-center justify-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10B981]" />
              <span className="text-[8px] uppercase font-bold tracking-widest text-emerald-300">
                COMPUTE ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Left Section Branch Nodes */}
        {/* 1. EXAM 01 / CONFIG */}
        <div 
          onClick={() => setSelectedNode('exam')}
          className={`absolute left-[3%] sm:left-[5%] top-[14%] p-2 sm:p-2.5 rounded-lg border transition-all cursor-pointer font-mono text-center z-10 ${
            selectedNode === 'exam'
              ? 'bg-cyan-950/80 border-[#00F2FF] shadow-[0_0_18px_rgba(0,242,255,0.4)] scale-105'
              : 'bg-[#080D1A]/90 border-cyan-500/30 hover:border-[#00F2FF] hover:bg-cyan-950/40'
          }`}
        >
          <p className="text-[11px] font-bold text-white tracking-wider">EXAM</p>
          <p className="text-[9px] text-cyan-400 font-semibold">01 / CONFIG</p>
        </div>

        {/* 2. AUDIT 05 / TRACK */}
        <div 
          onClick={() => setSelectedNode('audit')}
          className={`absolute left-[3%] sm:left-[5%] top-[45%] p-2 sm:p-2.5 rounded-lg border transition-all cursor-pointer font-mono text-center z-10 ${
            selectedNode === 'audit'
              ? 'bg-purple-950/80 border-purple-400 shadow-[0_0_18px_rgba(168,85,247,0.4)] scale-105'
              : 'bg-[#080D1A]/90 border-cyan-500/30 hover:border-purple-400 hover:bg-purple-950/30'
          }`}
        >
          <p className="text-[11px] font-bold text-white tracking-wider">AUDIT</p>
          <p className="text-[9px] text-purple-400 font-semibold">05 / TRACK</p>
        </div>

        {/* 3. RESULTS 04 / OUTPUT */}
        <div 
          onClick={() => setSelectedNode('results')}
          className={`absolute left-[3%] sm:left-[5%] bottom-[14%] p-2 sm:p-2.5 rounded-lg border transition-all cursor-pointer font-mono text-center z-10 ${
            selectedNode === 'results'
              ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.4)] scale-105'
              : 'bg-[#080D1A]/90 border-cyan-500/30 hover:border-emerald-400 hover:bg-emerald-950/30'
          }`}
        >
          <p className="text-[11px] font-bold text-white tracking-wider">RESULTS</p>
          <p className="text-[9px] text-emerald-400 font-semibold">04 / OUTPUT</p>
        </div>

        {/* Right Section Branch Nodes */}
        {/* 4. ANSWERS 02 / INGEST */}
        <div 
          onClick={() => setSelectedNode('answers')}
          className={`absolute right-[3%] sm:right-[5%] top-[14%] p-2 sm:p-2.5 rounded-lg border transition-all cursor-pointer font-mono text-center z-10 ${
            selectedNode === 'answers'
              ? 'bg-cyan-950/80 border-[#00F2FF] shadow-[0_0_18px_rgba(0,242,255,0.4)] scale-105'
              : 'bg-[#080D1A]/90 border-cyan-500/30 hover:border-[#00F2FF] hover:bg-cyan-950/40'
          }`}
        >
          <p className="text-[11px] font-bold text-white tracking-wider">ANSWERS</p>
          <p className="text-[9px] text-cyan-400 font-semibold">02 / INGEST</p>
        </div>

        {/* 5. WORKERS 24 / ACTIVE (HIGHLIGHTED CYAN BOX per spec) */}
        <div 
          onClick={() => setSelectedNode('workers')}
          className={`absolute right-[3%] sm:right-[5%] top-[45%] p-2.5 sm:p-3 rounded-lg border-2 border-[#00F2FF] font-mono text-center transition-all cursor-pointer z-10 ${
            selectedNode === 'workers'
              ? 'bg-cyan-950/90 shadow-[0_0_25px_rgba(0,242,255,0.6)] scale-105'
              : 'bg-cyan-950/70 shadow-[0_0_15px_rgba(0,242,255,0.35)]'
          }`}
        >
          <div className="flex items-center gap-1.5 justify-center">
            <span className="w-2 h-2 rounded-full bg-[#00F2FF] animate-ping" />
            <p className="text-xs font-black text-[#00F2FF] tracking-wider">WORKERS</p>
          </div>
          <p className="text-[10px] font-extrabold text-white mt-0.5 tracking-wider">24 / ACTIVE</p>
        </div>

        {/* 6. VALIDATION 03 / VERIFY */}
        <div 
          onClick={() => setSelectedNode('validation')}
          className={`absolute right-[3%] sm:right-[5%] bottom-[14%] p-2 sm:p-2.5 rounded-lg border transition-all cursor-pointer font-mono text-center z-10 ${
            selectedNode === 'validation'
              ? 'bg-cyan-950/80 border-[#00F2FF] shadow-[0_0_18px_rgba(0,242,255,0.4)] scale-105'
              : 'bg-[#080D1A]/90 border-cyan-500/30 hover:border-[#00F2FF] hover:bg-cyan-950/40'
          }`}
        >
          <p className="text-[11px] font-bold text-white tracking-wider">VALIDATION</p>
          <p className="text-[9px] text-cyan-400 font-semibold">03 / VERIFY</p>
        </div>
      </div>

      {/* 3. Interactive Telemetry Readout for Selected Node */}
      <div className="mt-2 p-2.5 rounded-lg bg-[#070D18]/90 border border-[#00F2FF]/25 text-[10px] font-mono text-slate-300">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 font-bold text-[#00F2FF]">
            <currentNode.icon className="w-3.5 h-3.5 text-[#00F2FF]" />
            <span>{currentNode.metrics.title}</span>
          </div>
          <span className="text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-500/30 text-[9px]">
            {currentNode.metrics.status}
          </span>
        </div>
        <p className="text-slate-400 leading-tight">
          {currentNode.metrics.detail}
        </p>
      </div>

      {/* 4. Process Map Footer Bar */}
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#00F2FF]/20 text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>FLOW: ACTIVE</span>
        </div>
        <div className="text-cyan-400 font-bold">WORKERS: 24/24 READY</div>
        <div className="text-[#00F2FF]">LATENCY: 14MS</div>
      </div>
    </div>
  );
};
