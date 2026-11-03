import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Zap,
  Gauge,
  Sliders,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

export const TimingChartSummary = ({ timingData }) => {
  const data = timingData || {
    sequentialTimeMs: 48.5,
    parallelTimeMs: 14.2,
    speedup: 3.42,
    efficiency: 85.5,
    workerCount: 4,
    stages: [
      { name: 'Validation', sequential: 7.2, parallel: 2.1 },
      { name: 'Evaluation', sequential: 26.5, parallel: 6.8 },
      { name: 'Total Marks', sequential: 8.8, parallel: 2.4 },
      { name: 'Barrier & Rank', sequential: 6.0, parallel: 2.9 },
    ],
  };

  const chartData = data.stages || [
    { name: 'Validation', sequential: 7.2, parallel: 2.1 },
    { name: 'Evaluation', sequential: 26.5, parallel: 6.8 },
    { name: 'Total Marks', sequential: 8.8, parallel: 2.4 },
    { name: 'Barrier & Rank', sequential: 6.0, parallel: 2.9 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="hud-panel p-3 rounded-lg border border-cyan-500/30 bg-slate-950/95 font-mono text-xs shadow-xl">
          <p className="font-bold text-white mb-1.5 uppercase tracking-wider">{label} Stage</p>
          <div className="space-y-1">
            <p className="text-rose-400">
              Sequential (1 Core): <strong className="text-white">{payload[0]?.value} ms</strong>
            </p>
            <p className="text-cyan-400">
              Parallel ({data.workerCount || 4} Cores): <strong className="text-white">{payload[1]?.value} ms</strong>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="hud-panel rounded-xl p-5 border border-cyan-500/20 bg-[#080C14]/90 backdrop-blur-xl relative overflow-hidden tech-corners">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-cyan-500/15">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-400 tracking-widest uppercase">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>EXECUTION PROFILING & AMDAHL'S LAW BENCHMARK</span>
          </div>
          <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wide mt-0.5">
            Sequential vs Parallel Timing Summary
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <span className="text-slate-500">WORKER POOL:</span>{' '}
            <span className="text-cyan-400 font-bold">{data.workerCount || 4} ACTIVE THREADS</span>
          </div>
        </div>
      </div>

      {/* Speedup & Efficiency Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5 font-mono text-xs">
        <div className="p-3 rounded-lg bg-slate-950/80 border border-rose-500/30">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">// SEQUENTIAL EXECUTION</span>
          <div className="text-xl font-bold text-rose-300 my-1">
            {data.sequentialTimeMs} <span className="text-xs text-slate-400 font-normal">MS</span>
          </div>
          <span className="text-[10px] text-slate-400">Single Core Main Thread</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-cyan-500/40">
          <span className="text-[10px] text-cyan-400 uppercase tracking-wider">// PARALLEL EXECUTION</span>
          <div className="text-xl font-bold text-cyan-300 my-1">
            {data.parallelTimeMs} <span className="text-xs text-slate-400 font-normal">MS</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold">Domain Decomposition</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-emerald-500/40">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">// MEASURED SPEEDUP (S)</span>
          <div className="text-xl font-bold text-emerald-300 my-1">
            {data.speedup}x
          </div>
          <span className="text-[10px] text-slate-400">S = T_seq / T_par</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-purple-500/40">
          <span className="text-[10px] text-purple-400 uppercase tracking-wider">// PARALLEL EFFICIENCY (E)</span>
          <div className="text-xl font-bold text-purple-300 my-1">
            {data.efficiency}%
          </div>
          <span className="text-[10px] text-slate-400">E = S / P (Ideal ~100%)</span>
        </div>
      </div>

      {/* Stage Breakdown Recharts Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
              label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontFamily: 'monospace' }}
            />
            <Bar dataKey="sequential" name="Sequential (1 Core)" fill="#F43F5E" radius={[4, 4, 0, 0]} />
            <Bar dataKey="parallel" name={`Parallel (${data.workerCount || 4} Cores)`} fill="#00F2FE" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
