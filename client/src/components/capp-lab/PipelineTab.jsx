import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitFork,
  Database,
  CheckCircle,
  Cpu,
  Layers,
  Save,
  Play,
  RotateCcw,
  Zap,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const PipelineTab = ({ externalRun }) => {
  const [latestRun, setLatestRun] = useState(externalRun || null);
  const [activeStage, setActiveStage] = useState(-1); // -1: idle, 0..4: active stage
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedMode, setSelectedMode] = useState('parallel');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchLatestRun = async () => {
    try {
      setLoading(true);
      const res = await api.get('/capp-lab/latest-run');
      if (res.success && res.data) {
        setLatestRun(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch latest run:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!latestRun) {
      fetchLatestRun();
    }
  }, []);

  useEffect(() => {
    if (externalRun) {
      setLatestRun(externalRun);
    }
  }, [externalRun]);

  const timings = latestRun?.stageTimings || {
    fetch: 8.5,
    validate: 12.3,
    compute: 45.8,
    merge: 6.2,
    rank: 9.4,
    save: 18.0,
  };

  const totalTime = Math.max(1, latestRun?.totalTimeMs || 100);

  const stages = [
    {
      id: 0,
      name: 'FETCH & INGEST',
      sub: 'Stage 1: DB Extraction',
      icon: Database,
      timeMs: timings.fetch || 8.5,
      description: 'Stream raw examination marks and academic subject credits from MongoDB into memory.',
    },
    {
      id: 1,
      name: 'VALIDATE & DECOMPOSE',
      sub: 'Stage 2: Chunk Partitioning',
      icon: Layers,
      timeMs: timings.validate || 12.3,
      description: 'Data sanitation, validation against max marks, and domain decomposition into chunk arrays.',
    },
    {
      id: 2,
      name: 'PARALLEL COMPUTE',
      sub: 'Stage 3: Worker Threads Execution',
      icon: Cpu,
      timeMs: timings.compute || 45.8,
      isParallelSplit: true,
      description: 'SGPA/CGPA evaluation, relative boundary calculation, and cryptographic SHA-256 seal generation.',
    },
    {
      id: 3,
      name: 'MERGE & RANK',
      sub: 'Stage 4: Barrier Synchronization',
      icon: GitFork,
      timeMs: Number(((timings.merge || 0) + (timings.rank || 0)).toFixed(1)),
      description: 'Thread join barrier: results are collected, sorted, and section-wise and overall ranks are computed.',
    },
    {
      id: 4,
      name: 'PERSIST & COMMIT',
      sub: 'Stage 5: Bulk Database Save',
      icon: Save,
      timeMs: timings.save || 18.0,
      description: 'Atomic batch insertion of finalized transcripts into certified records ledger.',
    },
  ];

  // Replay animation step-by-step
  const triggerPipelineAnimation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);

    for (let i = 0; i < stages.length; i++) {
      setActiveStage(i);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    await new Promise((resolve) => setTimeout(resolve, 600));
    setActiveStage(-1);
    setIsSimulating(false);
  };

  // Trigger real backend run and animate
  const handleRunAndAnimate = async (mode) => {
    if (isSimulating) return;
    setSelectedMode(mode);
    setIsSimulating(true);
    setActiveStage(0);

    try {
      const stepPromise = (async () => {
        for (let i = 0; i < stages.length; i++) {
          setActiveStage(i);
          await new Promise((r) => setTimeout(r, 700));
        }
      })();

      const res = await api.post('/capp-lab/trigger-run', {
        mode,
        workerCount: mode === 'parallel' ? 4 : 1,
        recordCount: 5000,
        workloadIntensity: 2,
      });

      await stepPromise;

      if (res.success && res.data) {
        setLatestRun(res.data);
        toast.success(`Pipeline finished: ${res.data.totalTimeMs}ms (${res.data.mode})`);
      }
    } catch (err) {
      toast.error(`Run failed: ${err.message}`);
    } finally {
      setActiveStage(-1);
      setIsSimulating(false);
    }
  };

  const workerCount = latestRun?.mode === 'parallel' ? (latestRun?.workerCount || 4) : 1;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="hud-panel p-5 border border-purple-500/30 rounded-lg bg-slate-950/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-purple-400 uppercase tracking-widest mb-1">
            <GitFork className="w-3.5 h-3.5" />
            <span>PIPELINE CONCURRENCY & FORK-JOIN MODEL</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide font-mono uppercase">
            5-Stage Result Processing Pipeline
          </h2>
          <p className="text-slate-400 text-xs font-sans mt-0.5">
            Illustrating stage isolation, data flow, and how the critical Compute stage forks into
            concurrent worker threads and synchronizes at the Merge barrier.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleRunAndAnimate('sequential')}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-amber-300 transition-all"
          >
            <Play className="w-3 h-3 text-amber-400" />
            <span>Simulate Sequential</span>
          </button>

          <button
            onClick={() => handleRunAndAnimate('parallel')}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/60 text-xs font-mono text-cyan-300 transition-all shadow-[0_0_10px_rgba(0,242,254,0.2)]"
          >
            <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Simulate Parallel Fork-Join</span>
          </button>

          <button
            onClick={triggerPipelineAnimation}
            disabled={isSimulating}
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
            title="Replay visual animation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Pipeline Visualizer */}
      <div className="hud-panel p-6 border border-purple-500/30 rounded-lg bg-slate-950/80 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">CURRENT RUN TELEMETRY:</span>
            <span className="text-white font-bold">{latestRun?.examTitle || 'Live Benchmark Run'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              MODE: <span className="text-cyan-400 font-bold uppercase">{latestRun?.mode || 'parallel'}</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              WALL TIME: <span className="text-emerald-400 font-bold">{latestRun?.totalTimeMs || 0} ms</span>
            </span>
          </div>
        </div>

        {/* Pipeline Diagram (Horizontal Flow on Desktop, Vertical on Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = activeStage === idx;
            const percentOfTotal = Math.round((stage.timeMs / totalTime) * 100);

            return (
              <motion.div
                key={stage.id}
                animate={{
                  scale: isActive ? 1.03 : 1,
                  boxShadow: isActive
                    ? '0 0 20px rgba(0, 242, 254, 0.35)'
                    : '0 0 0px rgba(0,0,0,0)',
                }}
                className={`p-4 rounded-lg border flex flex-col justify-between transition-all duration-300 relative ${
                  isActive
                    ? 'bg-cyan-950/60 border-cyan-400'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Arrow connector between stages (desktop only) */}
                {idx < stages.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-slate-600">
                    <ArrowRight className="w-5 h-5 text-purple-400/60" />
                  </div>
                )}

                <div>
                  {/* Top Index & Icon */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-slate-500 font-bold">
                      [0{idx + 1}]
                    </span>
                    <div
                      className={`p-2 rounded ${
                        isActive
                          ? 'bg-cyan-500 text-black'
                          : 'bg-slate-950 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Stage Name */}
                  <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                    {stage.name}
                  </h4>
                  <div className="text-[10px] font-mono text-purple-300 mb-2">{stage.sub}</div>

                  {/* Parallel Fork Visualization inside Stage 3 */}
                  {stage.isParallelSplit ? (
                    <div className="my-2 p-2 rounded bg-slate-950/80 border border-cyan-500/30 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400">
                        <span>FORK: {workerCount} WORKERS</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[9px] font-mono">
                        {Array.from({ length: Math.min(6, workerCount) }).map((_, wIdx) => (
                          <div
                            key={wIdx}
                            className={`p-1 rounded text-center border ${
                              isActive
                                ? 'bg-cyan-900/60 border-cyan-400 text-cyan-200'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            Lane #{wIdx + 1}
                          </div>
                        ))}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono text-center">
                        Async Chunk Evaluation
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 font-sans my-2 leading-relaxed">
                      {stage.description}
                    </p>
                  )}
                </div>

                {/* Bottom Timing Metric */}
                <div className="pt-3 border-t border-slate-800/80 mt-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Latency:</span>
                    <span className="text-cyan-300 font-bold">{stage.timeMs} ms</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(5, percentOfTotal))}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-right font-mono text-slate-500 mt-0.5">
                    {percentOfTotal}% of total run
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Architectural Takeaway Panel */}
      <div className="hud-panel p-5 border border-purple-500/20 rounded-lg bg-slate-950/50 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans text-slate-300">
        <div>
          <span className="font-mono text-cyan-400 font-bold block mb-1 uppercase">
            1. Pipelining vs Pure Parallelism:
          </span>
          Pipelining divides the lifecycle into linear stages (Fetch, Decompose, Compute, Rank, Save).
          While stages are sequential for a single batch, successive exam batches can overlap
          (instruction pipeline parallelism).
        </div>
        <div>
          <span className="font-mono text-purple-400 font-bold block mb-1 uppercase">
            2. The Compute Fork-Join Bottleneck:
          </span>
          Stage 3 (Compute) accounts for ~65-75% of processing workload. By forking it across N worker
          threads, we scale throughput. However, Stage 4 (Merge & Rank) acts as a strict synchronization
          barrier.
        </div>
        <div>
          <span className="font-mono text-emerald-400 font-bold block mb-1 uppercase">
            3. Amdahl's Law in the Pipeline:
          </span>
          Stages 1, 2, 4, and 5 contain serial I/O and global sorting operations. Because these serial
          stages cannot be parallelized without risk of race conditions, they define the fundamental
          speedup ceiling.
        </div>
      </div>
    </div>
  );
};
