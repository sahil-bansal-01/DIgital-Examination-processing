import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Zap,
  Cpu,
  Layers,
  Clock,
  Play,
  TrendingUp,
  BarChart3,
  HardDrive,
  CheckCircle2,
  RefreshCw,
  Trophy,
  Activity,
  Flame,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { ScrollSteps } from '../components/ui/ScrollSteps';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const PerformanceLab = () => {
  const toast = useToast();

  // Synthetic Data States
  const [datasetSize, setDatasetSize] = useState(10000);
  const [isGenerating, setIsGenerating] = useState(false);
  const [syntheticStatus, setSyntheticStatus] = useState({ generated: false, count: 0 });

  // Benchmark Config
  const [workerCount, setWorkerCount] = useState(4);
  const [chunkStrategy, setChunkStrategy] = useState('fixed-batch');
  const [workloadIntensity, setWorkloadIntensity] = useState(2);

  // Live Race States
  const [isRacing, setIsRacing] = useState(false);
  const [seqProgress, setSeqProgress] = useState(0);
  const [parProgress, setParProgress] = useState(0);
  const [activeStageCaption, setActiveStageCaption] = useState('Standby');
  const [raceReport, setRaceReport] = useState(null);

  // Live Worker Pool Lanes State (workerId -> { chunkId, percent, processedCount, totalCount })
  const [workerLanes, setWorkerLanes] = useState({});

  // Worker Scaling States
  const [scalingData, setScalingData] = useState([]);
  const [isScalingRunning, setIsScalingRunning] = useState(false);

  // Connect to SSE stream for real-time live worker telemetry
  useEffect(() => {
    const sse = new EventSource('/api/performance/stream-progress');

    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'STAGE_UPDATE') {
          setActiveStageCaption(data.stage);
        } else if (data.type === 'SEQ_PROGRESS') {
          setSeqProgress(data.percent || 0);
        } else if (data.type === 'PAR_PROGRESS') {
          setParProgress(data.percent || 0);

          // Update individual worker lane
          if (data.workerId) {
            setWorkerLanes((prev) => ({
              ...prev,
              [data.workerId]: {
                workerId: data.workerId,
                chunkId: data.chunkId,
                percent: data.percent,
                processedCount: data.processedCount,
                totalCount: data.totalCount,
                status: data.percent >= 100 ? 'MERGING' : 'PROCESSING',
              },
            }));
          }
        } else if (data.type === 'RACE_COMPLETE') {
          setActiveStageCaption('Race Complete & Verified');
          setSeqProgress(100);
          setParProgress(100);
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    return () => {
      sse.close();
    };
  }, []);

  // 1. Generate Synthetic Data
  const handleGenerateSynthetic = async (size) => {
    const targetSize = size || datasetSize;
    setIsGenerating(true);
    try {
      const res = await api.post('/performance/generate-synthetic', {
        count: targetSize,
      });
      if (res.success) {
        setSyntheticStatus({ generated: true, count: res.count });
        toast.success(`Generated ${res.count.toLocaleString()} synthetic records!`);
      }
    } catch (err) {
      toast.error('Synthetic generation failed: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Launch Side-by-Side Race Benchmark
  const handleLaunchRace = async () => {
    setIsRacing(true);
    setSeqProgress(0);
    setParProgress(0);
    setRaceReport(null);
    setActiveStageCaption('Spinning up worker threads...');

    // Initialize worker lanes to IDLE
    const initialLanes = {};
    for (let i = 1; i <= workerCount; i++) {
      initialLanes[i] = { workerId: i, chunkId: '-', percent: 0, status: 'IDLE' };
    }
    setWorkerLanes(initialLanes);

    try {
      const res = await api.post('/performance/race', {
        datasetSize,
        workerCount: Number(workerCount),
        chunkStrategy,
        workloadIntensity: Number(workloadIntensity),
      });

      if (res.success && res.report) {
        setRaceReport(res.report);
        setSeqProgress(100);
        setParProgress(100);

        // Mark all lanes DONE
        setWorkerLanes((prev) => {
          const finished = {};
          Object.keys(prev).forEach((wId) => {
            finished[wId] = { ...prev[wId], percent: 100, status: 'DONE' };
          });
          return finished;
        });

        // Trigger celebratory confetti if parallel won with speedup!
        if (res.report.metrics.winner === 'parallel') {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#06b6d4', '#6366f1', '#10b981'],
          });
        }
      }
    } catch (err) {
      toast.error(err.message || 'Race benchmark failed');
    } finally {
      setIsRacing(false);
    }
  };

  // 3. Worker Scaling Benchmark
  const handleRunScaling = async () => {
    setIsScalingRunning(true);
    try {
      const res = await api.post('/performance/scaling-workers', {
        datasetSize: 10000,
        workloadIntensity: Number(workloadIntensity),
      });
      if (res.success && res.scalingResults) {
        setScalingData(res.scalingResults);
        toast.success('Worker scaling benchmark finished!');
      }
    } catch (err) {
      toast.error(err.message || 'Scaling benchmark error');
    } finally {
      setIsScalingRunning(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Computer Architecture & Parallel Processing (CAPP)
            </span>
            <Badge variant="cyan">Experimental Laboratory</Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            High-Performance Benchmark & Scaling Lab
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Stress-test Node.js <code className="text-cyan-300 font-mono">worker_threads</code> against single-threaded baselines.
            Measure empirical Speedup, Parallel Efficiency, and Amdahl's Law asymptotic limits across dataset scales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="indigo" size="md">
            Flynn MIMD Paradigm
          </Badge>
        </div>
      </div>

      {/* SYNTHETIC DATASET GENERATOR BAR */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-cyan-400" />
              Synthetic Dataset Generator (10k to 100k Records)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Instantiate realistic university candidate batches with course codes, scores, and absent flags.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {[10000, 25000, 50000, 100000].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setDatasetSize(size);
                  handleGenerateSynthetic(size);
                }}
                disabled={isGenerating}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition border ${
                  datasetSize === size
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {size / 1000}k Records
              </button>
            ))}

            <Button
              variant="gradient"
              size="sm"
              icon={RefreshCw}
              loading={isGenerating}
              onClick={() => handleGenerateSynthetic(datasetSize)}
            >
              Generate
            </Button>
          </div>
        </div>

        {syntheticStatus.generated && (
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2 text-emerald-400 font-mono">
              <CheckCircle2 className="w-4 h-4" />
              Active In-Memory Dataset: {syntheticStatus.count.toLocaleString()} Records Ready
            </span>
            <span className="font-mono text-slate-500">Zero DB serialization bottleneck in pure memory mode</span>
          </div>
        )}
      </div>

      {/* BENCHMARK CONTROL & CONFIG */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Dataset Batch Size
          </label>
          <input
            type="number"
            step="5000"
            min="1000"
            max="100000"
            value={datasetSize}
            onChange={(e) => setDatasetSize(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Parallel Worker Pool Size
          </label>
          <div className="grid grid-cols-4 gap-1.5">
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
                {cores}P
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Chunking Strategy
          </label>
          <select
            value={chunkStrategy}
            onChange={(e) => setChunkStrategy(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="fixed-batch">Fixed Batch Slices (Uniform Load)</option>
            <option value="section">Section Cohorts (Domain Partition)</option>
          </select>
        </div>

        <div>
          <Button
            variant="gradient"
            size="lg"
            className="w-full py-3"
            icon={Play}
            loading={isRacing}
            onClick={handleLaunchRace}
          >
            {isRacing ? 'Running CAPP Race...' : 'Launch Side-by-Side Race'}
          </Button>
        </div>
      </div>

      {/* THE SHOWPIECE: SIDE-BY-SIDE RACE VISUALIZER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              Side-by-Side Execution Race Track
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Watch Sequential (single thread) race against Parallel (WorkerPool multi-core) on the exact same dataset
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Stage:</span>
            <Badge variant="cyan">{activeStageCaption}</Badge>
          </div>
        </div>

        {/* Tracks */}
        <div className="space-y-6">
          {/* Track 1: Sequential */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-amber-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                SEQUENTIAL ENGINE (1 Thread)
              </span>
              <span className="text-slate-300 font-bold">{Math.round(seqProgress)}%</span>
            </div>

            <div className="w-full h-4 bg-slate-900 border border-slate-800 rounded-full p-0.5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-md shadow-amber-500/20"
                style={{ width: `${seqProgress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>

            {raceReport && (
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
                <span>Execution Time: <strong className="text-white">{raceReport.sequential.totalTimeMs} ms</strong></span>
                <span>Throughput: <strong className="text-amber-400">{raceReport.sequential.throughput?.toLocaleString()} rec/s</strong></span>
              </div>
            )}
          </div>

          {/* Track 2: Parallel */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-cyan-400 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                PARALLEL ENGINE ({workerCount} Worker Threads)
              </span>
              <span className="text-slate-300 font-bold">{Math.round(parProgress)}%</span>
            </div>

            <div className="w-full h-4 bg-slate-900 border border-slate-800 rounded-full p-0.5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 shadow-md shadow-cyan-500/30"
                style={{ width: `${parProgress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>

            {raceReport && (
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
                <span>Execution Time: <strong className="text-white">{raceReport.parallel.totalTimeMs} ms</strong></span>
                <span>Throughput: <strong className="text-emerald-400">{raceReport.parallel.throughput?.toLocaleString()} rec/s</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* WINNER BANNER & METRICS SHOWCASE */}
        {raceReport && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-950 border border-cyan-500/40 shadow-2xl"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-2xl shadow-lg shadow-cyan-500/30 text-white">
                  <Trophy className="w-7 h-7 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-white">
                    Winner: {raceReport.metrics.winner === 'parallel' ? 'Parallel Worker Pool Engine' : 'Sequential Engine'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Processed {raceReport.datasetSize?.toLocaleString()} student records with {raceReport.workerCount} concurrent threads
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="emerald" size="md">
                  Time Saved: {raceReport.metrics.timeSavedMs} ms (-{raceReport.metrics.percentageImprovement}%)
                </Badge>
              </div>
            </div>

            {/* Core CAPP Comparative Metric Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                  Speedup (S = T_seq / T_par)
                </p>
                <p className="text-3xl font-extrabold font-mono text-cyan-400 mt-1">
                  {raceReport.metrics.speedup}x
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Faster than single thread</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                  Parallel Efficiency (E = S / P)
                </p>
                <p className="text-3xl font-extrabold font-mono text-indigo-400 mt-1">
                  {Math.round(raceReport.metrics.efficiency * 100)}%
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Core utilization factor</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                  Amdahl Theoretical Limit
                </p>
                <p className="text-3xl font-extrabold font-mono text-amber-400 mt-1">
                  {raceReport.metrics.amdahlTheoreticalSpeedup}x
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Max theoretical ceiling</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                  Parallel Throughput
                </p>
                <p className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
                  {raceReport.parallel.throughput?.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Records per second</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* LIVE WORKER POOL LANES (THE SHOWPIECE REAL-TIME COMPONENT) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              Live Worker Pool Thread Lanes
            </h3>
            <p className="text-xs text-slate-400">
              Real-time telemetry showing each independent OS worker thread processing assigned chunks
            </p>
          </div>
          <Badge variant="cyan">{workerCount} Active Thread Contexts</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(workerLanes).map((wId) => {
            const lane = workerLanes[wId];
            return (
              <div
                key={wId}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    <span className="font-bold text-white">Worker Thread #{wId}</span>
                  </div>
                  <Badge
                    size="xs"
                    variant={lane.status === 'DONE' ? 'emerald' : lane.status === 'PROCESSING' ? 'cyan' : 'slate'}
                  >
                    {lane.status}
                  </Badge>
                </div>

                {/* Progress Lane */}
                <div className="w-full h-2.5 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                    animate={{ width: `${lane.percent || 0}%` }}
                    transition={{ duration: 0.15 }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Current Task: {lane.chunkId !== '-' ? `Chunk #${lane.chunkId}` : 'Awaiting task'}</span>
                  <span>{lane.percent || 0}% Completed</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PERFORMANCE CHARTS: WORKER SCALING & STAGE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Worker Scaling Benchmark (1, 2, 4, 8) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Multi-Core Speedup vs Amdahl's Law Scaling
                </h3>
                <p className="text-xs text-slate-400">
                  Ideal Linear Speedup vs Measured Empirical Speedup across 1, 2, 4, 8 threads
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                loading={isScalingRunning}
                onClick={handleRunScaling}
              >
                Run Scaling Test
              </Button>
            </div>

            <div className="h-64 w-full">
              {scalingData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scalingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="workers" stroke="#94a3b8" unit=" Cores" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 'auto']} unit="x" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="idealSpeedup"
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      name="Ideal Linear (S = P)"
                    />
                    <Line
                      type="monotone"
                      dataKey="speedup"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                      name="Measured Speedup"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                  <p>Click "Run Scaling Test" to benchmark across 1, 2, 4, and 8 worker threads.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stage-by-Stage Time Breakdown */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Sequential vs Parallel Stage Breakdown
              </h3>
              <p className="text-xs text-slate-400">
                Milliseconds spent in Validation, Compute, Rank, and Merge
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            {raceReport ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      stage: 'Validate',
                      Sequential: raceReport.sequential.stageTimings.validate || 0,
                      Parallel: raceReport.parallel.stageTimings.validate || 0,
                    },
                    {
                      stage: 'Compute',
                      Sequential: raceReport.sequential.stageTimings.compute || 0,
                      Parallel: raceReport.parallel.stageTimings.compute || 0,
                    },
                    {
                      stage: 'Rank',
                      Sequential: raceReport.sequential.stageTimings.rank || 0,
                      Parallel: raceReport.parallel.stageTimings.rank || 0,
                    },
                    {
                      stage: 'Merge',
                      Sequential: raceReport.sequential.stageTimings.merge || 0,
                      Parallel: raceReport.parallel.stageTimings.merge || 0,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="stage" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} unit="ms" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  />
                  <Legend />
                  <Bar dataKey="Sequential" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Parallel" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Launch a race benchmark above to inspect stage timings.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CAPP 5-STAGE PIPELINE SCROLL REVEAL */}
      <div className="pt-6 border-t border-white/10 dark:border-white/10 light:border-slate-200">
        <ScrollSteps
          title={
            <>
              CAPP Engine <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400">Execution Pipeline</span>
            </>
          }
          subtitle="Explore the complete 5-stage dataflow pipeline from dataset ingestion to parallel multi-core calculation and official grade synthesis."
        />
      </div>

      {/* EDUCATIONAL CAPP ARCHITECTURE PANEL */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">How It Works: CAPP Parallel Architecture Principles</h3>
            <p className="text-xs text-slate-400">
              Theoretical foundations of concurrent execution in modern multi-core processor architectures
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-cyan-400 font-mono">1. Domain Decomposition & Chunking</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              The aggregate student dataset is split into independent slices (data parallelism). In <strong>Fixed-Batch</strong> mode,
              each worker receives an equal share. In <strong>Section</strong> mode, academic boundaries prevent cross-chunk dependencies,
              maximizing cache locality.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-indigo-400 font-mono">2. Worker Pool & IPC Amortization</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Repeatedly creating OS threads wastes hundreds of milliseconds in context allocation. Our <strong>Worker Pool</strong>{' '}
              maintains pre-spawned worker threads that execute tasks via Inter-Process Communication (IPC channels) without thread recreation penalties.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-emerald-400 font-mono">3. Amdahl's Law Bottleneck</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              <code className="text-slate-300 font-mono">S(P) = 1 / ((1 - f) + f/P)</code>. The overall speedup is strictly limited by the
              serial fraction (chunking, IPC structured cloning, and final global ranking). Even with infinite cores, speedup cannot exceed{' '}
              <code className="text-emerald-400 font-mono">1 / (1 - f)</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
