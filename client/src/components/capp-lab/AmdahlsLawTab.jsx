import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Sliders,
  Cpu,
  Info,
  Layers,
  Zap,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Scatter,
} from 'recharts';
import { api } from '../../services/api';

export const AmdahlsLawTab = () => {
  const [parallelFraction, setParallelFraction] = useState(0.88); // P
  const [processorCount, setProcessorCount] = useState(8); // N
  const [empiricalData, setEmpiricalData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch real measured points from database runs
  useEffect(() => {
    const fetchAmdahlData = async () => {
      try {
        const res = await api.get('/capp-lab/amdahl-data');
        if (res.success && res.data) {
          setEmpiricalData(res.data);
          if (res.data.empiricalParallelFraction) {
            setParallelFraction(res.data.empiricalParallelFraction);
          }
          if (res.data.systemCores) {
            setProcessorCount(res.data.systemCores);
          }
        }
      } catch (err) {
        console.error('Failed to fetch Amdahl data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAmdahlData();
  }, []);

  // Compute Amdahl Theoretical Speedup for given N and P:
  // S = 1 / ((1 - P) + P / N)
  const calculateAmdahlSpeedup = (N, P) => {
    const serial = 1 - P;
    const parallel = P / N;
    return Number((1 / (serial + parallel)).toFixed(2));
  };

  const currentTheoreticalSpeedup = calculateAmdahlSpeedup(processorCount, parallelFraction);
  const maxPossibleSpeedup = Number((1 / (1 - parallelFraction)).toFixed(2));

  // Find measured speedup for current N (if exists in real runs)
  const matchedMeasured = empiricalData?.measuredPoints?.find(
    (p) => p.workers === processorCount
  );

  // Generate chart data series across processor counts [1, 2, 4, 8, 12, 16, 24, 32]
  const processorSteps = [1, 2, 4, 8, 12, 16, 24, 32];

  const chartData = processorSteps.map((N) => {
    const theoretical = calculateAmdahlSpeedup(N, parallelFraction);
    const measuredMatch = empiricalData?.measuredPoints?.find((p) => p.workers === N);

    return {
      processors: N,
      idealLinear: N,
      theoreticalAmdahl: theoretical,
      measured: measuredMatch ? measuredMatch.measuredSpeedup : null,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="hud-panel p-5 border border-purple-500/30 rounded-lg bg-slate-950/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-purple-400 uppercase tracking-widest mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>THEORETICAL SPEEDUP MODEL & HARDWARE BOUNDS</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide font-mono uppercase">
            Amdahl's Law Simulation & Real Gap Analysis
          </h2>
          <p className="text-slate-400 text-xs font-sans mt-0.5">
            Formula: <span className="font-mono text-cyan-300 font-bold">S(N) = 1 / ((1 - P) + P / N)</span>.
            Observe how the non-parallelizable serial fraction strictly caps maximum parallel speedup.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 font-mono text-xs text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Host CPU: {empiricalData?.systemCores || 8} Cores</span>
        </div>
      </div>

      {/* Interactive Controls & Key HUD Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders (5 cols) */}
        <div className="lg:col-span-5 hud-panel p-5 border border-purple-500/30 rounded-lg bg-slate-950/80 space-y-5">
          <div className="flex items-center gap-2 font-mono text-xs text-white uppercase border-b border-slate-800 pb-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Interactive Parameter Sliders</span>
          </div>

          {/* Parallel Fraction Slider (P) */}
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Parallel Fraction (P):</span>
              <span className="text-cyan-400 font-bold text-sm">
                {(parallelFraction * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.99"
              step="0.01"
              value={parallelFraction}
              onChange={(e) => setParallelFraction(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-900 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>50% (High Serial Bottleneck)</span>
              <span>99% (Highly Parallel)</span>
            </div>
            <div className="text-[11px] font-sans text-slate-400">
              Serial Fraction: <span className="font-mono text-purple-300">{((1 - parallelFraction) * 100).toFixed(0)}%</span> (DB I/O, validation & merge ranking).
            </div>
          </div>

          {/* Number of Processors Slider (N) */}
          <div className="space-y-2 font-mono pt-2 border-t border-slate-850">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Processor / Worker Count (N):</span>
              <span className="text-purple-400 font-bold text-sm">{processorCount} Cores</span>
            </div>
            <input
              type="range"
              min="1"
              max="32"
              step="1"
              value={processorCount}
              onChange={(e) => setProcessorCount(parseInt(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer h-2 bg-slate-900 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1 Worker (Sequential)</span>
              <span>32 Workers</span>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded bg-slate-900/90 border border-cyan-500/30 font-mono">
              <div className="text-[10px] text-slate-400 uppercase">Theoretical Speedup S(N)</div>
              <div className="text-xl font-bold text-cyan-300 mt-0.5">
                {currentTheoreticalSpeedup}x
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">at {processorCount} processors</div>
            </div>

            <div className="p-3 rounded bg-slate-900/90 border border-purple-500/30 font-mono">
              <div className="text-[10px] text-slate-400 uppercase">Amdahl Ceiling (N → ∞)</div>
              <div className="text-xl font-bold text-purple-300 mt-0.5">
                {maxPossibleSpeedup}x
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Theoretical Upper Limit</div>
            </div>
          </div>
        </div>

        {/* Recharts Curve Visualization (7 cols) */}
        <div className="lg:col-span-7 hud-panel p-5 border border-purple-500/30 rounded-lg bg-slate-950/90 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 font-mono text-xs">
            <span className="text-white font-bold uppercase">
              Speedup Scaling Curve (P = {(parallelFraction * 100).toFixed(0)}%)
            </span>
            <span className="text-slate-400 text-[11px]">Recharts Engine</span>
          </div>

          {/* Interactive Recharts Line Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="processors"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                  label={{ value: 'Processors (N)', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 10 }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                  label={{ value: 'Speedup (x)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#030508',
                    borderColor: '#8B5CF6',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                  }}
                  itemStyle={{ color: '#00F2FE' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }}
                />
                {/* Theoretical Curve */}
                <Line
                  type="monotone"
                  dataKey="theoreticalAmdahl"
                  name="Amdahl Theoretical Speedup"
                  stroke="#00F2FE"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#00F2FE' }}
                  activeDot={{ r: 6 }}
                />
                {/* Ideal Linear Speedup */}
                <Line
                  type="monotone"
                  dataKey="idealLinear"
                  name="Linear Ideal (S = N)"
                  stroke="#475569"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                />
                {/* Real Measured Speedup Points */}
                <Line
                  type="monotone"
                  dataKey="measured"
                  name="Real Measured Speedup"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 5, fill: '#10B981', stroke: '#ffffff', strokeWidth: 1.5 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 px-2">
            <span>Cyan: Theoretical Amdahl</span>
            <span>Emerald Points: Real Benchmark Runs</span>
            <span>Dashed Gray: Linear Ideal</span>
          </div>
        </div>
      </div>

      {/* Explanatory Breakdown Note */}
      <div className="hud-panel p-5 border border-purple-500/20 rounded-lg bg-slate-950/60 font-sans text-xs text-slate-300 space-y-3">
        <div className="flex items-center gap-2 font-mono text-purple-400 font-bold uppercase text-xs">
          <Info className="w-4 h-4" />
          <span>Why is there a gap between Ideal Speedup, Amdahl's Curve, and Real Runs?</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
            <span className="font-mono text-cyan-400 font-bold block mb-1 uppercase text-[11px]">
              1. The Serial Bottleneck (1 - P)
            </span>
            Amdahl's law dictates that if 12% of a job is serial (MongoDB queries, validation, sorting),
            even with infinite processors the maximum speedup can never exceed 1 / 0.12 = 8.33x.
          </div>

          <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
            <span className="font-mono text-purple-400 font-bold block mb-1 uppercase text-[11px]">
              2. IPC & Serialization Overhead
            </span>
            Worker threads in Node.js communicate via Structured Clone IPC over MessagePort. The CPU time
            required to serialize and deserialize student mark payloads creates a tangible penalty that
            pure theory ignores.
          </div>

          <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
            <span className="font-mono text-emerald-400 font-bold block mb-1 uppercase text-[11px]">
              3. Memory Bandwidth & Cache Contention
            </span>
            As 8 or 16 worker threads access shared system RAM simultaneously, memory bus saturation and
            CPU L3 cache line invalidations cause sub-linear scaling compared to isolated synthetic benchmarks.
          </div>
        </div>
      </div>
    </div>
  );
};
