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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              CAPP Computational Core
            </span>
            <Badge variant="cyan">Multi-Threaded Architecture</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Result Processing & Compilation Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Execute high-throughput result calculation pipelines in sequential single-threaded mode or multi-worker parallel mode.
          </p>
        </div>

        <Link to="/performance-lab">
          <Button variant="gradient" icon={Zap}>
            Go to Performance Lab
          </Button>
        </Link>
      </div>

      {/* Control Panel & Architecture Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Execution Parameter Form */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Execution Configuration
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Examination
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {exams.map((ex) => (
                <option key={ex._id} value={ex._id}>
                  {ex.title} ({ex.status})
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher: Sequential vs Parallel */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Execution Paradigm
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('sequential')}
                className={`p-3 rounded-2xl border text-left transition select-none ${
                  mode === 'sequential'
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs uppercase font-mono">Sequential</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-[11px] text-slate-400">Single event loop thread</p>
              </button>

              <button
                type="button"
                onClick={() => setMode('parallel')}
                className={`p-3 rounded-2xl border text-left transition select-none ${
                  mode === 'parallel'
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-200 ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs uppercase font-mono">Parallel</span>
                  <Cpu className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-[11px] text-slate-400">worker_threads pool</p>
              </button>
            </div>
          </div>

          {/* Parallel Specific Options */}
          {mode === 'parallel' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 pt-2 border-t border-slate-800"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-300 uppercase">Worker Threads</span>
                  <span className="font-mono font-bold text-cyan-400">{workerCount} Active Cores</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 4, 8].map((cores) => (
                    <button
                      key={cores}
                      type="button"
                      onClick={() => setWorkerCount(cores)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold border transition ${
                        workerCount === cores
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cores} {cores === 1 ? 'Core' : 'Cores'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Decomposition Chunking
                </label>
                <select
                  value={chunkStrategy}
                  onChange={(e) => setChunkStrategy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="fixed-batch">Fixed Batch Slices (Uniform Load Distribution)</option>
                  <option value="section">Academic Section Cohorts (Natural Domain Boundary)</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* Trigger Button */}
          <Button
            variant="gradient"
            size="lg"
            className="w-full py-3.5"
            icon={Play}
            loading={isProcessing}
            onClick={handleStartProcessing}
          >
            {isProcessing ? 'Processing Pipeline Active...' : `Execute ${mode.toUpperCase()} Pipeline`}
          </Button>
        </div>

        {/* Right: Real-time Pipeline Stage Diagram */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Pipeline Execution Visualizer
              </h3>
              <Badge variant={isProcessing ? 'cyan' : 'slate'}>
                {isProcessing ? 'ACTIVE WORKLOAD' : 'READY TO COMPILE'}
              </Badge>
            </div>

            {/* Stages Grid with Animated Lighting */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
              {STAGES.map((stg, idx) => {
                const isActive = currentStageIndex === idx && isProcessing;
                const isCompleted = currentStageIndex > idx;

                return (
                  <motion.div
                    key={stg.id}
                    animate={{
                      scale: isActive ? 1.03 : 1,
                      borderColor: isActive ? '#06b6d4' : isCompleted ? '#10b981' : '#334155',
                      boxShadow: isActive ? '0 0 15px rgba(6, 182, 212, 0.3)' : 'none',
                    }}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-cyan-950/40 text-cyan-200'
                        : isCompleted
                        ? 'bg-emerald-950/20 text-emerald-200 border-emerald-500/30'
                        : 'bg-slate-950/60 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold">{stg.label}</span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : isActive ? (
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-700" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{stg.desc}</p>
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
              className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-cyan-400">
                  Latest Run Telemetry: {lastRunResult.runId}
                </span>
                <Link to={`/results?examId=${selectedExamId}`}>
                  <Button size="sm" variant="outline" icon={Award}>
                    View Published Results
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-[10px] uppercase text-slate-400">Execution Time</p>
                  <p className="text-base font-bold font-mono text-white">{lastRunResult.totalTimeMs} ms</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-[10px] uppercase text-slate-400">Throughput</p>
                  <p className="text-base font-bold font-mono text-emerald-400">
                    {lastRunResult.throughput?.toLocaleString()} rec/s
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-[10px] uppercase text-slate-400">Heap Delta</p>
                  <p className="text-base font-bold font-mono text-indigo-400">
                    {lastRunResult.memoryUsage?.heapUsedMB} MB
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-[10px] uppercase text-slate-400">Speedup</p>
                  <p className="text-base font-bold font-mono text-cyan-400">
                    {lastRunResult.speedup}x
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Historical Processing Runs Audit Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">CAPP Engine Telemetry Logs</h3>
            <p className="text-xs text-slate-400">Historical performance metrics per execution run</p>
          </div>
          <Button size="sm" variant="ghost" icon={RefreshCw} onClick={fetchPastRuns}>
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs text-slate-400 font-mono uppercase">
              <tr>
                <th className="px-5 py-3.5">Run ID</th>
                <th className="px-5 py-3.5">Mode</th>
                <th className="px-5 py-3.5">Workers</th>
                <th className="px-5 py-3.5">Candidates</th>
                <th className="px-5 py-3.5">Total Time</th>
                <th className="px-5 py-3.5">Compute Stage</th>
                <th className="px-5 py-3.5">Throughput</th>
                <th className="px-5 py-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {pastRuns.map((run) => (
                <tr key={run._id} className="hover:bg-slate-800/30">
                  <td className="px-5 py-3.5 font-mono font-bold text-cyan-400 text-xs">{run.runId}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={run.mode === 'parallel' ? 'cyan' : 'amber'}>
                      {run.mode.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs">{run.workerCount}</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-white">{run.recordCount}</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-white">{run.totalTimeMs} ms</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{run.stageTimings?.compute || 0} ms</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-400">{run.throughput} rec/s</td>
                  <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
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
