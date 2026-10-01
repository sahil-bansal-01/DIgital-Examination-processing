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
  Crosshair,
  Radio,
  Terminal,
  ShieldCheck
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

        setWorkerLanes((prev) => {
          const finished = {};
          Object.keys(prev).forEach((wId) => {
            finished[wId] = { ...prev[wId], percent: 100, status: 'DONE' };
          });
          return finished;
        });

        if (res.report.metrics.winner === 'parallel') {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#00F2FE', '#8B5CF6', '#10B981'],
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
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" />
              CAPP BENCHMARK & ACCELERATION LAB // [06]
            </span>
            <Badge variant="cyan">MIMD MULTI-CORE</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
            PARALLEL PERFORMANCE & SCALING MATRIX
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl font-sans">
            Empirically benchmark Node.js <code className="text-cyan-300 font-mono">worker_threads</code> against single-threaded baselines.
            Analyze Speedup, Parallel Efficiency, and Amdahl's Law asymptotic limits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple" size="md">
            FLYNN MIMD // PARALLEL
          </Badge>
        </div>
      </div>

      {/* SYNTHETIC DATASET GENERATOR BAR */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-2xl backdrop-blur-xl tech-corners">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span>SYNTHETIC IN-MEMORY WORKLOAD INGESTION</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Instantiate realistic university candidate batches with course credits, scores, and absent flags.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[10000, 25000, 50000, 100000].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setDatasetSize(size);
                  handleGenerateSynthetic(size);
                }}
                disabled={isGenerating}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                  datasetSize === size
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                    : 'bg-[#080C14] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {size / 1000}k Records
              </button>
            ))}

            <Button
              variant="primary"
              size="sm"
              icon={RefreshCw}
              loading={isGenerating}
              onClick={() => handleGenerateSynthetic(datasetSize)}
            >
              GENERATE
            </Button>
          </div>
        </div>

        {syntheticStatus.generated && (
          <div className="mt-3 pt-3 border-t border-cyan-500/20 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              ACTIVE IN-MEMORY DATASET: {syntheticStatus.count.toLocaleString()} RECORDS READY
            </span>
            <span className="text-cyan-500/70 hidden sm:inline">// ZERO DISK BOTTLENECK IN PURE RAM MODE</span>
          </div>
        )}
      </div>

      {/* BENCHMARK CONTROL & CONFIG */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-2xl backdrop-blur-xl grid grid-cols-1 md:grid-cols-4 gap-5 items-end tech-corners">
        <div>
          <label className="block text-[10px] text-slate-300 uppercase tracking-wider mb-2">
            DATASET BATCH SIZE
          </label>
          <input
            type="number"
            step="5000"
            min="1000"
            max="100000"
            value={datasetSize}
            onChange={(e) => setDatasetSize(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#080C14] border border-cyan-500/30 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

        <div>
          <label className="block text-[10px] text-slate-300 uppercase tracking-wider mb-2">
            PARALLEL WORKER POOL SIZE
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 4, 8].map((cores) => (
              <button
                key={cores}
                type="button"
                onClick={() => setWorkerCount(cores)}
                className={`py-2 rounded-lg text-xs font-bold border transition ${
                  workerCount === cores
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                    : 'bg-[#080C14] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cores}P
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-slate-300 uppercase tracking-wider mb-2">
            CHUNKING STRATEGY
          </label>
          <select
            value={chunkStrategy}
            onChange={(e) => setChunkStrategy(e.target.value)}
            className="w-full px-3 py-2 bg-[#080C14] border border-cyan-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 transition"
          >
            <option value="fixed-batch">Fixed Batch Slices (Uniform Load)</option>
            <option value="section">Section Cohorts (Domain Partition)</option>
          </select>
        </div>

        <div>
          <Button
            variant="primary"
            size="lg"
            className="w-full py-2.5"
            icon={Play}
            loading={isRacing}
            onClick={handleLaunchRace}
          >
            {isRacing ? 'EXECUTING RACE...' : 'LAUNCH SIDE-BY-SIDE RACE'}
          </Button>
        </div>
      </div>

      {/* THE SHOWPIECE: SIDE-BY-SIDE RACE VISUALIZER */}
      <div className="p-5 sm:p-7 rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-2xl backdrop-blur-xl space-y-5 tech-corners">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/20">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>SIDE-BY-SIDE EXECUTION RACE TRACK</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Watch Sequential (single thread) race against Parallel (WorkerPool multi-core) on the identical dataset
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">TELEMETRY:</span>
            <Badge variant="cyan">{activeStageCaption}</Badge>
          </div>
        </div>

        {/* Tracks */}
        <div className="space-y-5">
          {/* Track 1: Sequential */}
          <div className="p-4 rounded-xl bg-[#080C14]/90 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                SEQUENTIAL ENGINE (1 EVENT-LOOP THREAD)
              </span>
              <span className="text-white font-bold">{Math.round(seqProgress)}%</span>
            </div>

            <div className="w-full h-3 bg-slate-900 border border-slate-800 rounded-full p-0.5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                style={{ width: `${seqProgress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>

            {raceReport && (
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>WALL TIME: <strong className="text-white">{raceReport.sequential.totalTimeMs} ms</strong></span>
                <span>THROUGHPUT: <strong className="text-amber-400">{raceReport.sequential.throughput?.toLocaleString()} rec/s</strong></span>
              </div>
            )}
          </div>

          {/* Track 2: Parallel */}
          <div className="p-4 rounded-xl bg-[#080C14]/90 border border-cyan-500/40 space-y-2.5 shadow-[0_0_20px_rgba(0,242,254,0.15)]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-300 flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                PARALLEL ENGINE ({workerCount} WORKER THREADS)
              </span>
              <span className="text-cyan-300 font-bold">{Math.round(parProgress)}%</span>
            </div>

            <div className="w-full h-3 bg-slate-900 border border-cyan-500/30 rounded-full p-0.5 overflow-hidden shadow-[0_0_12px_rgba(0,242,254,0.2)]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-purple-500 shadow-[0_0_15px_#00F2FE]"
                style={{ width: `${parProgress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>

            {raceReport && (
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>WALL TIME: <strong className="text-white">{raceReport.parallel.totalTimeMs} ms</strong></span>
                <span>THROUGHPUT: <strong className="text-emerald-400">{raceReport.parallel.throughput?.toLocaleString()} rec/s</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* WINNER BANNER & METRICS SHOWCASE */}
        {raceReport && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 sm:p-6 rounded-xl bg-gradient-to-r from-cyan-950/60 via-[#0F172A] to-purple-950/40 border border-cyan-400/50 shadow-[0_0_30px_rgba(0,242,254,0.2)]"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-5 pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-950/80 border border-cyan-400 rounded-xl text-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.4)]">
                  <Trophy className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white uppercase tracking-wider">
                    WINNER: {raceReport.metrics.winner === 'parallel' ? 'PARALLEL WORKER POOL CORE' : 'SEQUENTIAL ENGINE'}
                  </h4>
                  <p className="text-xs text-slate-400 font-sans">
                    Processed {raceReport.datasetSize?.toLocaleString()} student records with {raceReport.workerCount} concurrent threads
                  </p>
                </div>
              </div>

              <Badge variant="emerald" size="md">
                TIME SAVED: {raceReport.metrics.timeSavedMs} ms (-{raceReport.metrics.percentageImprovement}%)
              </Badge>
            </div>

            {/* Core CAPP Comparative Metric Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-lg bg-[#080C14]/90 border border-cyan-500/30">
                <p className="text-[10px] uppercase text-slate-400 tracking-wider">
                  SPEEDUP (S = T_seq / T_par)
                </p>
                <p className="text-2xl font-extrabold text-cyan-400 mt-1">
                  {raceReport.metrics.speedup}x
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-sans">Faster than single thread</p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#080C14]/90 border border-cyan-500/30">
                <p className="text-[10px] uppercase text-slate-400 tracking-wider">
                  PARALLEL EFFICIENCY (E = S / P)
                </p>
                <p className="text-2xl font-extrabold text-purple-400 mt-1">
                  {Math.round(raceReport.metrics.efficiency * 100)}%
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-sans">Core utilization factor</p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#080C14]/90 border border-cyan-500/30">
                <p className="text-[10px] uppercase text-slate-400 tracking-wider">
                  AMDAHL LIMIT CEILING
                </p>
                <p className="text-2xl font-extrabold text-amber-400 mt-1">
                  {raceReport.metrics.amdahlTheoreticalSpeedup}x
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-sans">Theoretical asymptote</p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#080C14]/90 border border-cyan-500/30">
                <p className="text-[10px] uppercase text-slate-400 tracking-wider">
                  PEAK THROUGHPUT
                </p>
                <p className="text-2xl font-extrabold text-emerald-400 mt-1">
                  {raceReport.parallel.throughput?.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-sans">Records per second</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* LIVE WORKER POOL LANES (SHOWPIECE REAL-TIME COMPONENT) */}
      <div className="p-5 sm:p-7 rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-2xl backdrop-blur-xl space-y-4 tech-corners">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>LIVE WORKER POOL THREAD LANES</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Real-time telemetry showing each independent OS worker thread processing assigned chunks
            </p>
          </div>
          <Badge variant="cyan">{workerCount} ACTIVE CORES</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.keys(workerLanes).map((wId) => {
            const lane = workerLanes[wId];
            return (
              <div
                key={wId}
                className="p-3.5 rounded-lg bg-[#080C14]/80 border border-cyan-500/20 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-bold text-white">WORKER THREAD #{wId}</span>
                  </div>
                  <Badge
                    size="xs"
                    variant={lane.status === 'DONE' ? 'emerald' : lane.status === 'PROCESSING' ? 'cyan' : 'slate'}
                  >
                    {lane.status}
                  </Badge>
                </div>

                {/* Progress Lane */}
                <div className="w-full h-2 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
                    animate={{ width: `${lane.percent || 0}%` }}
                    transition={{ duration: 0.15 }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>CHUNK: {lane.chunkId !== '-' ? `#${lane.chunkId}` : 'STANDBY'}</span>
                  <span className="text-cyan-400 font-bold">{lane.percent || 0}% COMPLETED</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PERFORMANCE CHARTS: WORKER SCALING & STAGE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Worker Scaling Benchmark (1, 2, 4, 8) */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-2xl backdrop-blur-xl flex flex-col justify-between tech-corners">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>MULTI-CORE SPEEDUP VS AMDAHL'S LAW</span>
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Ideal Linear Speedup vs Measured Empirical Speedup across 1, 2, 4, 8 threads
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                loading={isScalingRunning}
                onClick={handleRunScaling}
              >
                RUN TEST
              </Button>
            </div>

            <div className="h-64 w-full">
              {scalingData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scalingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,242,254,0.1)" />
                    <XAxis dataKey="workers" stroke="#64748b" unit="P" fontSize={10} fontFamily="JetBrains Mono" />
                    <YAxis stroke="#64748b" fontSize={10} domain={[0, 'auto']} unit="x" fontFamily="JetBrains Mono" />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#080C14', 
                        borderColor: 'rgba(0,242,254,0.3)', 
                        borderRadius: '8px',
                        fontFamily: 'JetBrains Mono',
                        fontSize: '11px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '11px' }} />
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
                      stroke="#00F2FE"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#00F2FE' }}
                      name="Measured Speedup"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                  <p>// CLICK "RUN TEST" TO BENCHMARK ACROSS 1, 2, 4, AND 8 WORKER THREADS.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stage-by-Stage Time Breakdown */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-2xl backdrop-blur-xl tech-corners">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span>STAGE LATENCY BREAKDOWN</span>
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,242,254,0.1)" />
                  <XAxis dataKey="stage" stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" />
                  <YAxis stroke="#64748b" fontSize={10} unit="ms" fontFamily="JetBrains Mono" />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#080C14', 
                      borderColor: 'rgba(0,242,254,0.3)', 
                      borderRadius: '8px',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '11px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '11px' }} />
                  <Bar dataKey="Sequential" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Parallel" fill="#00F2FE" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                // LAUNCH A RACE BENCHMARK ABOVE TO INSPECT STAGE TIMINGS.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CAPP 5-STAGE PIPELINE SCROLL REVEAL */}
      <div className="pt-4 border-t border-cyan-500/20">
        <ScrollSteps
          title={
            <>
              CAPP ENGINE <span className="text-cyan-400">EXECUTION PIPELINE</span>
            </>
          }
          subtitle="Explore the complete 5-stage dataflow pipeline from dataset ingestion to parallel multi-core calculation and official grade synthesis."
        />
      </div>

      {/* EDUCATIONAL CAPP ARCHITECTURE PANEL */}
      <div className="p-5 sm:p-7 rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-2xl backdrop-blur-xl space-y-5 tech-corners">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950/60 border border-cyan-500/40 rounded-lg text-cyan-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              // ARCHITECTURAL SPECIFICATIONS & PARALLEL COMPUTATION PRINCIPLES
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Theoretical foundations of concurrent execution in modern multi-core processor architectures
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          <div className="p-4 rounded-lg bg-[#080C14]/90 border border-cyan-500/20 space-y-1.5">
            <h4 className="text-xs font-bold text-cyan-400">01. DOMAIN DECOMPOSITION & CHUNKING</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              The aggregate student dataset is split into independent slices (data parallelism). In <strong>Fixed-Batch</strong> mode,
              each worker receives an equal share. In <strong>Section</strong> mode, academic boundaries prevent cross-chunk dependencies,
              maximizing cache locality.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#080C14]/90 border border-purple-500/20 space-y-1.5">
            <h4 className="text-xs font-bold text-purple-400">02. WORKER POOL & IPC AMORTIZATION</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Repeatedly creating OS threads wastes hundreds of milliseconds in context allocation. Our <strong>Worker Pool</strong>{' '}
              maintains pre-spawned worker threads that execute tasks via Inter-Process Communication (IPC channels) without thread recreation penalties.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#080C14]/90 border border-emerald-500/20 space-y-1.5">
            <h4 className="text-xs font-bold text-emerald-400">03. AMDAHL'S LAW BOTTLENECK</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
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
