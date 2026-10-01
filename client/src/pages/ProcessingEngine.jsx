import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Layers,
  Zap,
  Play,
  CheckCircle2,
  Clock,
  HardDrive,
  BarChart2,
  ArrowRight,
  RefreshCw,
  Sliders,
  Award,
  Crosshair,
  Activity,
  Radio,
  Terminal
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';

const STAGES = [
  { id: 'fetch', label: '1. Ingestion', desc: 'Query marks lake' },
  { id: 'validate', label: '2. Decomposition', desc: 'Chunking & validation' },
  { id: 'compute', label: '3. Worker Pool', desc: 'Grades & SGPA core' },
  { id: 'merge', label: '4. Barrier Join', desc: 'Thread gather & sync' },
  { id: 'rank', label: '5. Global Sort', desc: 'Section & overall ranks' },
  { id: 'save', label: '6. Persistence', desc: 'Indexed results store' },
];

export const ProcessingEngine = () => {
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(searchParams.get('examId') || '');
  const [mode, setMode] = useState('parallel'); // 'sequential' | 'parallel'
  const [workerCount, setWorkerCount] = useState(4);
  const [chunkStrategy, setChunkStrategy] = useState('fixed-batch'); // 'fixed-batch' | 'section'
  const [workloadIntensity, setWorkloadIntensity] = useState(2);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [lastRunResult, setLastRunResult] = useState(null);
  const [pastRuns, setPastRuns] = useState([]);
  const [loadingRuns, setLoadingRuns] = useState(false);

  useEffect(() => {
    const loadExams = async () => {
      try {
        const res = await api.get('/exams');
        if (res.success && res.exams?.length > 0) {
          setExams(res.exams);
          if (!selectedExamId) setSelectedExamId(res.exams[0]._id);
        }
      } catch (err) {
        toast.error('Failed to load exams');
      }
    };
    loadExams();
  }, []);

  const fetchPastRuns = async () => {
    setLoadingRuns(true);
    try {
      const res = await api.get('/processing/runs?limit=15');
      if (res.success) {
        setPastRuns(res.runs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRuns(false);
    }
  };

  useEffect(() => {
    fetchPastRuns();
  }, []);

  const handleStartProcessing = async () => {
    if (!selectedExamId) {
      toast.error('Please choose an examination to process');
      return;
    }

    setIsProcessing(true);
    setCurrentStageIndex(0);

    // Visual stage progression simulation while request processes
    const stageTimer = setInterval(() => {
      setCurrentStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 280);

    try {
      const res = await api.post(`/processing/exam/${selectedExamId}`, {
        mode,
        workerCount: mode === 'parallel' ? Number(workerCount) : 1,
        chunkStrategy,
        workloadIntensity: Number(workloadIntensity),
      });

      clearInterval(stageTimer);
      setCurrentStageIndex(STAGES.length - 1);

      if (res.success) {
        toast.success(`Result Processing Complete in ${res.summary.totalTimeMs}ms!`);
        setLastRunResult(res.run);
        fetchPastRuns();
      }
    } catch (err) {
      clearInterval(stageTimer);
      toast.error(err.message || 'Processing engine failure');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" />
              CAPP COMPUTATIONAL CORE // [05]
            </span>
            <Badge variant="cyan">MIMD MULTI-THREADED</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
            PARALLEL RESULT PROCESSING ENGINE
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
            Dispatch computational grade pipelines using domain decomposition chunking across Node.js worker_threads pools.
          </p>
        </div>

        <Link to="/performance-lab">
          <Button variant="gradient" icon={Zap}>
            PERFORMANCE LAB //
          </Button>
        </Link>
      </div>

      {/* Control Panel & Architecture Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
        {/* Left: Execution Parameter Form */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-2xl backdrop-blur-xl space-y-4 tech-corners">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>CORE CONFIGURATION</span>
            </h3>
            <span className="text-[10px] text-cyan-400/70">MIMD_v2.4</span>
          </div>

          <div>
            <label className="block text-[10px] text-slate-300 uppercase tracking-wider mb-1.5">
              SELECT EXAMINATION PROTOCOL
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-3 py-2 bg-[#080C14] border border-cyan-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 transition"
            >
              {exams.map((ex) => (
                <option key={ex._id} value={ex._id}>
                  {ex.title} [{ex.status?.toUpperCase()}]
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher: Sequential vs Parallel */}
          <div>
            <label className="block text-[10px] text-slate-300 uppercase tracking-wider mb-1.5">
              COMPUTATION PARADIGM
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('sequential')}
                className={`p-3 rounded-lg border text-left transition select-none ${
                  mode === 'sequential'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-[#080C14] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs uppercase">Sequential</span>
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-[10px] text-slate-400 font-sans">Single event-loop thread</p>
              </button>

              <button
                type="button"
                onClick={() => setMode('parallel')}
                className={`p-3 rounded-lg border text-left transition select-none ${
                  mode === 'parallel'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_16px_rgba(0,242,254,0.3)]'
                    : 'bg-[#080C14] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs uppercase text-cyan-300">Parallel Core</span>
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <p className="text-[10px] text-slate-400 font-sans">worker_threads pool</p>
              </button>
            </div>
          </div>

          {/* Parallel Specific Options */}
          {mode === 'parallel' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 pt-2 border-t border-cyan-500/20"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[10px] text-slate-300 uppercase tracking-wider">WORKER THREAD COUNT</span>
                  <span className="font-bold text-cyan-400">{workerCount} ACTIVE CORES</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 4, 8].map((cores) => (
                    <button
                      key={cores}
                      type="button"
                      onClick={() => setWorkerCount(cores)}
                      className={`py-2 rounded-lg text-xs font-bold border transition ${
                        workerCount === cores
                          ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                          : 'bg-[#080C14] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cores}P
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-300 uppercase tracking-wider mb-1.5">
                  DECOMPOSITION STRATEGY
                </label>
                <select
                  value={chunkStrategy}
                  onChange={(e) => setChunkStrategy(e.target.value)}
                  className="w-full px-3 py-2 bg-[#080C14] border border-cyan-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 transition"
                >
                  <option value="fixed-batch">Fixed Batch Slices (Uniform Load Distribution)</option>
                  <option value="section">Academic Section Cohorts (Natural Domain Boundary)</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* Trigger Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full py-3 mt-2"
            icon={Play}
            loading={isProcessing}
            onClick={handleStartProcessing}
          >
            {isProcessing ? 'PIPELINE DISPATCH ACTIVE...' : `INITIALISE ${mode.toUpperCase()} RUN`}
          </Button>
        </div>

        {/* Right: Real-time Pipeline Stage Diagram */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-2xl backdrop-blur-xl flex flex-col justify-between tech-corners">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span>PIPELINE EXECUTION TELEMETRY</span>
              </h3>
              <Badge variant={isProcessing ? 'cyan' : 'emerald'}>
                {isProcessing ? 'COMPUTING' : 'IDLE / READY'}
              </Badge>
            </div>

            {/* Stages Grid with Animated Lighting */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3">
              {STAGES.map((stg, idx) => {
                const isActive = currentStageIndex === idx && isProcessing;
                const isCompleted = currentStageIndex > idx;

                return (
                  <motion.div
                    key={stg.id}
                    animate={{
                      scale: isActive ? 1.02 : 1,
                      borderColor: isActive ? '#00F2FE' : isCompleted ? '#10B981' : 'rgba(255,255,255,0.08)',
                      boxShadow: isActive ? '0 0 16px rgba(0, 242, 254, 0.4)' : 'none',
                    }}
                    className={`p-3 rounded-lg border transition-all ${
                      isActive
                        ? 'bg-cyan-950/60 text-cyan-200'
                        : isCompleted
                        ? 'bg-emerald-950/30 text-emerald-200 border-emerald-500/40'
                        : 'bg-[#080C14]/60 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{stg.label}</span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : isActive ? (
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans">{stg.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Last Run Metrics Preview Card */}
          {lastRunResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-[#080C14]/90 border border-cyan-500/40"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-cyan-400">
                  // TELEMETRY SNAPSHOT: {lastRunResult.runId}
                </span>
                <Link to={`/results?examId=${selectedExamId}`}>
                  <Button size="sm" variant="outline" icon={Award}>
                    VIEW DISPATCH
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded bg-slate-900 border border-cyan-500/20">
                  <p className="text-[9px] uppercase text-slate-400">TOTAL TIME</p>
                  <p className="text-sm font-bold text-white">{lastRunResult.totalTimeMs} ms</p>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-cyan-500/20">
                  <p className="text-[9px] uppercase text-slate-400">THROUGHPUT</p>
                  <p className="text-sm font-bold text-emerald-400">
                    {lastRunResult.throughput?.toLocaleString()} rec/s
                  </p>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-cyan-500/20">
                  <p className="text-[9px] uppercase text-slate-400">HEAP DELTA</p>
                  <p className="text-sm font-bold text-purple-400">
                    {lastRunResult.memoryUsage?.heapUsedMB} MB
                  </p>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-cyan-500/20">
                  <p className="text-[9px] uppercase text-slate-400">SPEEDUP</p>
                  <p className="text-sm font-bold text-cyan-400">
                    {lastRunResult.speedup}x
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Historical Processing Runs Audit Table */}
      <div className="rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-2xl overflow-hidden backdrop-blur-xl tech-corners font-mono">
        <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>CAPP RUN REGISTRY & HISTORICAL TELEMETRY</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">Multi-core execution benchmarks and stage timings</p>
          </div>
          <Button size="sm" variant="ghost" icon={RefreshCw} onClick={fetchPastRuns}>
            REFRESH
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[10px] text-slate-400 uppercase tracking-wider border-b border-cyan-500/20">
              <tr>
                <th className="px-4 py-3">RUN ID</th>
                <th className="px-4 py-3">PARADIGM</th>
                <th className="px-4 py-3">CORES</th>
                <th className="px-4 py-3">RECORDS</th>
                <th className="px-4 py-3">WALL TIME</th>
                <th className="px-4 py-3">COMPUTE</th>
                <th className="px-4 py-3">THROUGHPUT</th>
                <th className="px-4 py-3">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pastRuns.map((run) => (
                <tr key={run._id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-bold text-cyan-400">{run.runId}</td>
                  <td className="px-4 py-3">
                    <Badge variant={run.mode === 'parallel' ? 'cyan' : 'amber'}>
                      {run.mode.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{run.workerCount}P</td>
                  <td className="px-4 py-3 font-bold text-white">{run.recordCount}</td>
                  <td className="px-4 py-3 font-bold text-white">{run.totalTimeMs} ms</td>
                  <td className="px-4 py-3 text-slate-400">{run.stageTimings?.compute || 0} ms</td>
                  <td className="px-4 py-3 font-bold text-emerald-400">{run.throughput} rec/s</td>
                  <td className="px-4 py-3 text-slate-400 text-[10px]">
                    {new Date(run.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
