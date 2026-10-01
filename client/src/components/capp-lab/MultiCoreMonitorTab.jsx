import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Activity,
  Layers,
  Play,
  RotateCw,
  HardDrive,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Gauge,
  Sliders,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const MultiCoreMonitorTab = ({ onRunFinished }) => {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningMode, setRunningMode] = useState(null); // 'sequential' | 'parallel' | null
  const [runStats, setRunStats] = useState(null);
  const [batchSize, setBatchSize] = useState(8000);
  const [intensity, setIntensity] = useState(2);
  const [pollingActive, setPollingActive] = useState(true);
  const toast = useToast();
  const pollTimerRef = useRef(null);

  // Fetch telemetry from backend
  const fetchTelemetry = async () => {
    try {
      const res = await api.get('/capp-lab/system-telemetry');
      if (res.success && res.data) {
        setTelemetry(res.data);
      }
    } catch (err) {
      console.error('Telemetry poll error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    if (pollingActive) {
      pollTimerRef.current = setInterval(fetchTelemetry, 1000);
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [pollingActive]);

  // Trigger Sequential or Parallel Run
  const handleTriggerWorkload = async (mode) => {
    if (runningMode) return;
    setRunningMode(mode);
    setRunStats(null);
    toast.info(`DISPATCHING ${mode.toUpperCase()} WORKLOAD (${batchSize.toLocaleString()} records)...`);

    try {
      // Faster poll during active execution to catch the core load spike
      const fastPoll = setInterval(fetchTelemetry, 250);

      const res = await api.post('/capp-lab/trigger-run', {
        mode,
        workerCount: telemetry?.cpu?.coreCount || 4,
        recordCount: batchSize,
        workloadIntensity: intensity,
      });

      clearInterval(fastPoll);
      await fetchTelemetry();

      if (res.success && res.data) {
        setRunStats(res.data);
        toast.success(
          `${mode.toUpperCase()} WORKLOAD COMPLETED: ${res.data.totalTimeMs}ms (${res.data.throughput.toLocaleString()} rec/sec)`
        );
        if (onRunFinished) {
          onRunFinished(res.data);
        }
      }
    } catch (err) {
      toast.error(`Execution failed: ${err.message}`);
    } finally {
      setRunningMode(null);
    }
  };

  // Helper for load color
  const getLoadColor = (load) => {
    if (load > 70) return 'from-rose-500 to-amber-500 text-rose-400 border-rose-500/50';
    if (load > 40) return 'from-purple-500 to-cyan-500 text-purple-400 border-purple-500/50';
    if (load > 15) return 'from-cyan-500 to-emerald-500 text-cyan-400 border-cyan-500/50';
    return 'from-emerald-500 to-slate-600 text-emerald-400 border-emerald-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Control Header & Live Triggers */}
      <div className="hud-panel p-5 border border-purple-500/30 rounded-lg bg-slate-950/70 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-purple-400 uppercase tracking-widest mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>REAL-TIME HARDWARE & THREAD TELEMETRY</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide font-mono uppercase">
            Multi-Core Utilization Monitor
          </h2>
          <p className="text-slate-400 text-xs font-sans mt-0.5">
            Compare Single-Core SISD execution against Multi-Core MIMD worker thread distribution.
            Trigger a workload to watch physical hardware CPU load spike in real time.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded border border-slate-700 font-mono text-xs text-slate-300">
            <span>Size:</span>
            <select
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              disabled={!!runningMode}
              className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-cyan-300 focus:outline-none"
            >
              <option value={4000}>4,000</option>
              <option value={8000}>8,000</option>
              <option value={15000}>15,000</option>
            </select>
          </div>

          <button
            onClick={() => handleTriggerWorkload('sequential')}
            disabled={!!runningMode}
            className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-xs uppercase tracking-wider transition-all border ${
              runningMode === 'sequential'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse'
                : 'bg-slate-900 hover:bg-amber-950/40 border-slate-700 hover:border-amber-500/60 text-slate-200 hover:text-amber-300'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span>Run Sequential (1 Core)</span>
          </button>

          <button
            onClick={() => handleTriggerWorkload('parallel')}
            disabled={!!runningMode}
            className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-xs uppercase tracking-wider transition-all border ${
              runningMode === 'parallel'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                : 'bg-cyan-950/60 hover:bg-cyan-900/80 border-cyan-500/60 hover:border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,242,254,0.15)]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Run Parallel (All Cores)</span>
          </button>
        </div>
      </div>

      {/* Completed Run Banner (if triggered) */}
      <AnimatePresence>
        {runStats && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`hud-panel p-4 rounded-lg border ${
              runStats.mode === 'parallel'
                ? 'border-cyan-500/40 bg-cyan-950/20'
                : 'border-amber-500/40 bg-amber-950/20'
            } flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-xs`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle
                className={`w-5 h-5 ${
                  runStats.mode === 'parallel' ? 'text-cyan-400' : 'text-amber-400'
                }`}
              />
              <div>
                <span className="font-bold text-white uppercase">
                  {runStats.mode} Benchmark Complete:
                </span>{' '}
                <span className="text-slate-300">{runStats.recordCount.toLocaleString()} records processed</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-300">
              <div>
                <span className="text-slate-500">Wall Time:</span>{' '}
                <span className="text-white font-bold">{runStats.totalTimeMs} ms</span>
              </div>
              <div>
                <span className="text-slate-500">Throughput:</span>{' '}
                <span className="text-emerald-400 font-bold">{runStats.throughput.toLocaleString()} rec/s</span>
              </div>
              {runStats.mode === 'parallel' && (
                <>
                  <div>
                    <span className="text-slate-500">Speedup:</span>{' '}
                    <span className="text-cyan-400 font-bold">{runStats.speedup}x</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Efficiency:</span>{' '}
                    <span className="text-purple-400 font-bold">
                      {Math.round(runStats.efficiency * 100)}%
                    </span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid: Left = CPU Cores Load, Right = Worker Pool Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Physical CPU Cores (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="hud-panel p-5 border border-purple-500/30 rounded-lg bg-slate-950/60">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-mono text-xs text-white uppercase">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Physical CPU Cores ({telemetry?.cpu?.coreCount || 0} Cores Detected)</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                <span className="text-slate-500">Avg Utilization:</span>
                <span className="text-cyan-300 font-bold">
                  {telemetry?.cpu?.averageLoadPercent || 0}%
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-mono mb-3 truncate">
              {telemetry?.cpu?.model || 'Hardware Core Subsystem'}
            </p>

            {/* Per-Core Load Bars */}
            <div className="space-y-2.5">
              {telemetry?.cpu?.cores?.map((core) => {
                const colorClass = getLoadColor(core.loadPercent);
                return (
                  <div key={core.coreId} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-300">
                        CORE #{String(core.coreId).padStart(2, '0')}
                      </span>
                      <span className={colorClass.split(' ')[2] + ' font-bold'}>
                        {core.loadPercent}%
                      </span>
                    </div>

                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80 relative">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]}`}
                        initial={false}
                        animate={{ width: `${core.loadPercent}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Memory Bar */}
          <div className="hud-panel p-4 border border-purple-500/20 rounded-lg bg-slate-950/40 flex items-center justify-between text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-purple-400" />
              <span>RAM: {telemetry?.memory?.usedMB} MB / {telemetry?.memory?.totalMB} MB ({telemetry?.memory?.usedPercent}%)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <span>Node RSS:</span>
              <span className="text-cyan-300">{telemetry?.memory?.processRssMB} MB</span>
            </div>
          </div>
        </div>

        {/* Worker Pool State (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="hud-panel p-5 border border-purple-500/30 rounded-lg bg-slate-950/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-mono text-xs text-white uppercase">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>CAPP Worker Thread Pool</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-emerald-400 font-bold">
                    {telemetry?.workerPool?.activeCount || 0} BUSY
                  </span>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-400">
                    {telemetry?.workerPool?.idleCount || 0} IDLE
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-sans mb-3">
                Pre-spawned thread pool persistent in memory. During parallel execution, chunks are dispatched
                asynchronously via FIFO queue to available worker units.
              </div>

              {/* Worker Thread Lanes */}
              <div className="space-y-2">
                {telemetry?.workerPool?.workers?.map((w) => (
                  <div
                    key={w.id}
                    className={`p-2.5 rounded border transition-all duration-300 flex items-center justify-between font-mono text-xs ${
                      w.isBusy
                        ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_8px_rgba(0,242,254,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          w.isBusy ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'
                        }`}
                      />
                      <span className={w.isBusy ? 'text-white font-bold' : 'text-slate-400'}>
                        Worker #{w.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      {w.isBusy ? (
                        <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold uppercase">
                          PROCESSING CHUNK #{w.currentChunkId || 'ACTIVE'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-500">
                          IDLE (WAITING)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Architectural Explanation Note */}
            <div className="mt-4 p-3 rounded bg-purple-950/20 border border-purple-500/20 text-[11px] font-sans text-slate-300">
              <span className="font-mono text-purple-300 font-bold block mb-0.5 uppercase">
                Hardware Architectural Note:
              </span>
              Sequential execution runs entirely on the main Node.js event-loop thread (1 core at 100%,
              others idle). Parallel mode utilizes Node's C++ worker_threads layer mapped directly to
              hardware OS threads, utilizing all cores simultaneously.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
