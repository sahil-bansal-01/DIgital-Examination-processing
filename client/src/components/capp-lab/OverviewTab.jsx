import React from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Layers,
  GitFork,
  Binary,
  Gauge,
  TrendingUp,
  ArrowRight,
  Terminal,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export const OverviewTab = ({ onNavigateTab }) => {
  const concepts = [
    {
      id: 'multicore',
      title: 'Parallel Processing & Multi-Core Architecture',
      subtitle: 'HARDWARE ACCELERATION',
      icon: Cpu,
      accentColor: 'from-cyan-500/20 to-cyan-500/5',
      borderColor: 'border-cyan-500/40 hover:border-cyan-400',
      badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30',
      definition:
        'Executing computational workloads across multiple hardware CPU cores concurrently to collapse wall-clock processing latency.',
      implementation:
        'Node.js worker_threads pool maintains pre-spawned worker threads across available OS CPU cores, avoiding kernel thread recreation overhead.',
      codeRef: 'server/src/workers/workerPool.js',
      targetTab: 'multi-core',
      demoLabel: 'Multi-Core Monitor',
    },
    {
      id: 'chunking',
      title: 'Data Parallelism & Task Decomposition',
      subtitle: 'DOMAIN DECOMPOSITION',
      icon: Layers,
      accentColor: 'from-purple-500/20 to-purple-500/5',
      borderColor: 'border-purple-500/40 hover:border-purple-400',
      badgeColor: 'text-purple-400 bg-purple-950/60 border-purple-500/30',
      definition:
        'Partitioning large homogeneous datasets into balanced chunks so that separate processing units can compute results independently.',
      implementation:
        'Result records are split into balanced batches (fixed-batch / dynamic worker distribution) and enqueued to worker threads.',
      codeRef: 'server/src/workers/chunker.js',
      targetTab: 'timeline',
      demoLabel: 'Execution Timeline',
    },
    {
      id: 'pipeline',
      title: 'Pipeline Processing Architecture',
      subtitle: 'MULTI-STAGE FLOW',
      icon: GitFork,
      accentColor: 'from-emerald-500/20 to-emerald-500/5',
      borderColor: 'border-emerald-500/40 hover:border-emerald-400',
      badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
      definition:
        'Structuring computation as an ordered series of distinct stages, transforming raw academic inputs into certified institutional results.',
      implementation:
        '5-Stage Pipeline: (1) Fetch Raw Marks → (2) Partition & Validate → (3) Parallel SGPA/Cryptographic Compute → (4) Merge & Rank → (5) Atomic Save.',
      codeRef: 'server/src/services/processingEngine.js',
      targetTab: 'pipeline',
      demoLabel: 'Pipeline Visualizer',
    },
    {
      id: 'flynn',
      title: "Flynn's Taxonomy (SISD vs. MIMD)",
      subtitle: 'ARCHITECTURAL TAXONOMY',
      icon: Binary,
      accentColor: 'from-indigo-500/20 to-indigo-500/5',
      borderColor: 'border-indigo-500/40 hover:border-indigo-400',
      badgeColor: 'text-indigo-400 bg-indigo-950/60 border-indigo-500/30',
      definition:
        'Classification of computer systems based on concurrency in instruction streams and data streams.',
      implementation:
        'Sequential mode runs as SISD (Single Instruction, Single Data) on the event loop; Parallel mode operates as MIMD (Multiple Instruction, Multiple Data) with independent threads.',
      codeRef: 'server/src/workers/resultWorker.js',
      targetTab: 'multi-core',
      demoLabel: 'Compare SISD vs MIMD',
    },
    {
      id: 'overhead',
      title: 'Speedup, Efficiency & Synchronization Overhead',
      subtitle: 'PERFORMANCE METRICS',
      icon: Gauge,
      accentColor: 'from-cyan-500/20 to-purple-500/10',
      borderColor: 'border-cyan-500/40 hover:border-purple-400',
      badgeColor: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30',
      definition:
        'Speedup S = T_seq / T_par, Efficiency E = S / N, with total runtime accounting for IPC serialization and barrier synchronization idle gaps.',
      implementation:
        'Measures thread synchronization barriers, serialization latency of structured clone IPC, and final ranking merge overhead.',
      codeRef: 'server/src/services/processingEngine.js:201',
      targetTab: 'timeline',
      demoLabel: 'Gantt Overhead View',
    },
    {
      id: 'amdahl',
      title: "Amdahl's Law & Speedup Bounds",
      subtitle: 'THEORETICAL CEILING',
      icon: TrendingUp,
      accentColor: 'from-purple-500/20 to-pink-500/10',
      borderColor: 'border-purple-500/40 hover:border-pink-400',
      badgeColor: 'text-pink-400 bg-pink-950/60 border-pink-500/30',
      definition:
        'Mathematical law showing that overall program speedup is strictly bounded by the non-parallelizable serial fraction (1 - P).',
      implementation:
        'Interactive calculation modeling the parallel fraction P (~85-90%) against real database I/O and merge barrier bottlenecks.',
      codeRef: 'server/src/controllers/performanceController.js:184',
      targetTab: 'amdahl',
      demoLabel: "Amdahl's Law Calculator",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="hud-panel p-6 border border-purple-500/30 rounded-lg relative overflow-hidden bg-gradient-to-r from-purple-950/30 via-slate-900/40 to-cyan-950/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-purple-400 uppercase tracking-widest mb-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>THEORETICAL FOUNDATIONS & ARCHITECTURAL MAPPING</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide font-mono uppercase">
              CAPP Concepts Implemented in this Core
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl font-sans">
              Digital EPS combines university-scale examination management with real Computer
              Architecture and Parallel Processing paradigms. Each module leverages tangible
              principles of hardware threading, domain decomposition, pipelining, and performance
              modeling.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-slate-950/60 px-3 py-2 rounded border border-purple-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>6/6 CONCEPTS OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* Grid of Concept Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {concepts.map((concept) => {
          const Icon = concept.icon;
          return (
            <motion.div
              key={concept.id}
              variants={cardVariants}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className={`hud-panel tech-corners p-5 rounded-lg border bg-gradient-to-br ${concept.accentColor} ${concept.borderColor} flex flex-col justify-between transition-all duration-300 shadow-lg relative group`}
            >
              <div>
                {/* Top Badge & Icon */}
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-700/60 text-slate-200 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider ${concept.badgeColor}`}
                  >
                    {concept.subtitle}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white tracking-wide font-mono uppercase mb-2">
                  {concept.title}
                </h3>

                {/* Definition */}
                <div className="mb-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-0.5">
                    Concept Definition:
                  </span>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {concept.definition}
                  </p>
                </div>

                {/* Where used in project */}
                <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800/80 mb-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Applied in CAPP Engine:</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    {concept.implementation}
                  </p>
                  <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-cyan-400" />
                    <span className="text-slate-500">File:</span>
                    <span className="text-cyan-300">{concept.codeRef}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onNavigateTab(concept.targetTab)}
                className="w-full flex items-center justify-between px-3 py-2 rounded bg-slate-900/90 hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-400 text-xs font-mono text-slate-200 hover:text-cyan-300 transition-all duration-200 group-hover:border-cyan-500/60"
              >
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Open Demo: {concept.demoLabel}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
