import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Cpu,
  Layers,
  Database,
  Radio,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  Workflow,
  Sliders,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Modular CAPP Components
import { PipelineDiagram } from '../components/capp-insights/PipelineDiagram';
import { BusArbitrationViewer } from '../components/capp-insights/BusArbitrationViewer';
import { LruCacheViewer } from '../components/capp-insights/LruCacheViewer';
import { MesiCoherenceMatrix } from '../components/capp-insights/MesiCoherenceMatrix';
import { TimingChartSummary } from '../components/capp-insights/TimingChartSummary';

export const CappInsights = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [demoSummary, setDemoSummary] = useState(null);

  // Core state from backend
  const [pipelineData, setPipelineData] = useState(null);
  const [busTelemetry, setBusTelemetry] = useState(null);
  const [busLogs, setBusLogs] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);
  const [cacheEntries, setCacheEntries] = useState(null);
  const [coherenceData, setCoherenceData] = useState(null);
  const [timingData, setTimingData] = useState(null);

  // Fetch initial state for all 4 subsystems
  const fetchAllData = async () => {
    try {
      const [busTelRes, busLogRes, cacheStatRes, cacheEntRes, cohRes] = await Promise.all([
        api.get('/capp-insights/bus/telemetry').catch(() => null),
        api.get('/capp-insights/bus/logs?limit=25').catch(() => null),
        api.get('/capp-insights/cache/stats').catch(() => null),
        api.get('/capp-insights/cache/entries?limit=8').catch(() => null),
        api.get('/capp-insights/coherence/matrix').catch(() => null),
      ]);

      if (busTelRes?.success) setBusTelemetry(busTelRes.data);
      if (busLogRes?.success) setBusLogs(busLogRes.data);
      if (cacheStatRes?.success) setCacheStats(cacheStatRes.data);
      if (cacheEntRes?.success) setCacheEntries(cacheEntRes.data);
      if (cohRes?.success) setCoherenceData(cohRes.data);
    } catch (err) {
      console.error('Failed to load CAPP Insights telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // "Run Demo" Master Trigger: Generates 50 sample records and triggers live run across all metrics
  const handleRunDemo = async () => {
    try {
      setIsRunningDemo(true);
      toast?.info?.('Triggering live CAPP demonstration: Generating 50 student records across worker cores...');

      const response = await api.post('/capp-insights/run-demo', {});

      if (response.success && response.data) {
        const d = response.data;
        setPipelineData(d.pipeline);
        setBusTelemetry(d.bus);
        setBusLogs(d.busLogs);
        setCacheStats(d.cache);
        setCacheEntries(d.cacheEntries);
        setCoherenceData(d.coherence);
        setTimingData(d.timingComparison);

        setDemoSummary({
          recordCount: d.recordCount,
          workerCount: d.workerCount,
          speedup: d.timingComparison.speedup,
          efficiency: d.timingComparison.efficiency,
          durationMs: d.demoDurationMs,
          throughput: d.pipeline.throughputRecordsPerSec,
        });

        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00F2FE', '#8B5CF6', '#10B981', '#F59E0B'],
        });

        toast?.success?.(
          `Demo completed in ${d.demoDurationMs}ms! Processed 50 records with ${d.timingComparison.speedup}x parallel speedup.`
        );
      }
    } catch (err) {
      toast?.error?.(`Demo run failed: ${err.message}`);
    } finally {
      setIsRunningDemo(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center font-mono text-xs text-cyan-400 gap-3">
        <Cpu className="w-8 h-8 animate-spin text-cyan-400" />
        <p className="tracking-widest uppercase">INITIALIZING CAPP ARCHITECTURAL TELEMETRY...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Banner & Control Deck */}
      <div className="hud-panel rounded-2xl p-6 border border-cyan-500/20 bg-[#080C14]/90 backdrop-blur-xl relative overflow-hidden tech-corners">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 tracking-widest uppercase mb-1">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>COMPUTER ARCHITECTURE & PARALLEL PROCESSING // TELEMETRY COCKPIT</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight uppercase">
              CAPP Insights & Memory Hierarchy
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-3xl">
              Live observability cockpit for hardware-level computer architecture: multi-master shared bus arbitration
              with fair round-robin starvation fallback, multi-tier LRU cache locality, Illinois MESI cache coherence
              directory with optimistic write locking, and synchronous 5-stage pipeline concurrency.
            </p>
          </div>

          {/* Master "RUN DEMO (50 RECORDS)" Button */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={fetchAllData}
              disabled={isRunningDemo}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-cyan-500/40 font-mono text-xs transition"
              title="Refresh telemetry"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
            </button>

            <button
              onClick={handleRunDemo}
              disabled={isRunningDemo}
              className="relative group px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(0,242,254,0.3)] hover:shadow-[0_0_35px_rgba(0,242,254,0.5)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5"
            >
              <Sparkles className={`w-4 h-4 ${isRunningDemo ? 'animate-spin' : 'animate-pulse'}`} />
              <span>{isRunningDemo ? 'PROCESSING 50 RECORDS...' : 'RUN DEMO (50 RECORDS)'}</span>
            </button>
          </div>
        </div>

        {/* Live Demo Metric Summary Bar (if run has executed) */}
        {demoSummary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 pt-4 border-t border-cyan-500/15 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs"
          >
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-emerald-500/30">
              <span className="text-[10px] text-slate-400">// SAMPLE RECORDS</span>
              <div className="text-base font-bold text-emerald-300">{demoSummary.recordCount} SCRIPTS</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-cyan-500/30">
              <span className="text-[10px] text-slate-400">// PARALLEL SPEEDUP</span>
              <div className="text-base font-bold text-cyan-300">{demoSummary.speedup}x GAIN</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-purple-500/30">
              <span className="text-[10px] text-slate-400">// PARALLEL EFFICIENCY</span>
              <div className="text-base font-bold text-purple-300">{demoSummary.efficiency}%</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-amber-500/30">
              <span className="text-[10px] text-slate-400">// THROUGHPUT</span>
              <div className="text-base font-bold text-amber-300">{demoSummary.throughput} SCRIPT/S</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* 1. Live Visual Pipeline Diagram (Submit -> Validate -> Evaluate -> Total Marks -> Result) */}
      <PipelineDiagram
        pipelineData={pipelineData}
        isRunningDemo={isRunningDemo}
      />

      {/* 2. Sequential vs Parallel Timing Chart Summary */}
      <TimingChartSummary timingData={timingData} />

      {/* 3. LRU Cache & Memory Hierarchy Cards */}
      <LruCacheViewer
        cacheStats={cacheStats}
        cacheEntriesData={cacheEntries}
        onRefresh={fetchAllData}
      />

      {/* 4. Shared Bus with Arbitration (Priority & Starvation Fallback) */}
      <BusArbitrationViewer
        busTelemetry={busTelemetry}
        busLogs={busLogs}
        onRefresh={fetchAllData}
      />

      {/* 5. Cache Coherence: Illinois MESI Matrix & Optimistic Locking */}
      <MesiCoherenceMatrix
        coherenceData={coherenceData}
        onRefresh={fetchAllData}
      />
    </div>
  );
};

export default CappInsights;
