import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Layers,
  Cpu,
  AlertTriangle,
  RotateCw,
  Info,
  Calendar,
  Zap,
} from 'lucide-react';
import { api } from '../../services/api';

export const ExecutionTimelineTab = () => {
  const [runs, setRuns] = useState([]);
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/capp-lab/runs?limit=15');
      if (res.success && res.data && res.data.length > 0) {
        setRuns(res.data);
        if (!selectedRunId) {
          setSelectedRunId(res.data[0].runId);
        }
      }
    } catch (err) {
      console.error('Failed to fetch runs for timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const selectedRun = runs.find((r) => r.runId === selectedRunId) || runs[0];

  const totalTimeMs = Math.max(1, selectedRun?.totalTimeMs || 100);
  const chunks = selectedRun?.chunks || [];
  const workerCount = Math.max(1, selectedRun?.workerCount || 1);

  // Group chunks by workerId
  const workerLanes = [];
  for (let w = 1; w <= workerCount; w++) {
    const workerChunks = chunks.filter((c) => (c.workerId || 1) === w);
    workerLanes.push({
      workerId: w,
      chunks: workerChunks,
    });
  }

  // Calculate Overhead: total wall time minus productive compute time of all chunks
  const totalComputeTime = chunks.reduce((sum, c) => sum + (c.durationMs || 0), 0);
  const stageTimings = selectedRun?.stageTimings || {};
  const serialOverhead =
    (stageTimings.validate || 0) +
    (stageTimings.merge || 0) +
    (stageTimings.rank || 0) +
    (stageTimings.save || 0);

  // Compute barrier wait time: difference between latest chunk end and earliest chunk end
  const chunkEndTimes = chunks.map((c) => c.endTime || c.durationMs || 0);
  const maxChunkEnd = chunkEndTimes.length > 0 ? Math.max(...chunkEndTimes) : totalTimeMs;
  const minChunkEnd = chunkEndTimes.length > 0 ? Math.min(...chunkEndTimes) : 0;
  const barrierWaitGap = Math.max(0, maxChunkEnd - minChunkEnd);

  const totalOverheadMs = Number((serialOverhead + barrierWaitGap).toFixed(1));
  const overheadPercent = Math.min(95, Math.round((totalOverheadMs / totalTimeMs) * 100));

  // Merge phase timing
  const mergeStartTime = Math.max(0, maxChunkEnd);
  const mergeDuration = Number(((stageTimings.merge || 5) + (stageTimings.rank || 5)).toFixed(1));

  return (
    <div className="space-y-6">
      {/* Header and Run Selector */}
      <div className="hud-panel p-5 border border-purple-500/30 rounded-lg bg-slate-950/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-purple-400 uppercase tracking-widest mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>EXECUTION TIMELINE & THREAD SYNCHRONIZATION</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide font-mono uppercase">
            Worker Gantt Timeline & Barrier Analysis
          </h2>
          <p className="text-slate-400 text-xs font-sans mt-0.5">
            Visualize the exact dispatch, execution, and join-barrier synchronization of worker
            threads. Inspect idle gaps and serialization overhead.
          </p>
        </div>

        {/* Dropdown to pick past runs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded border border-slate-700 text-xs font-mono">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Select Run:</span>
            <select
              value={selectedRunId || ''}
              onChange={(e) => setSelectedRunId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-cyan-300 focus:outline-none max-w-xs"
            >
              {runs.map((r) => (
                <option key={r.runId} value={r.runId}>
                  [{r.mode.toUpperCase()}] {r.examTitle || r.runId} ({r.totalTimeMs}ms)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchRuns}
            className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
            title="Refresh runs list"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Selected Run Telemetry Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="hud-panel p-3.5 rounded border border-cyan-500/30 bg-slate-950/60 font-mono">
          <div className="text-[10px] text-slate-400 uppercase">Total Wall Time</div>
          <div className="text-lg font-bold text-cyan-300 mt-0.5">{totalTimeMs} ms</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Mode: <span className="uppercase text-white">{selectedRun?.mode}</span> ({workerCount} workers)
          </div>
        </div>

        <div className="hud-panel p-3.5 rounded border border-purple-500/30 bg-slate-950/60 font-mono">
          <div className="text-[10px] text-slate-400 uppercase">Parallel Chunks</div>
          <div className="text-lg font-bold text-purple-300 mt-0.5">{chunks.length} Chunks</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {selectedRun?.recordCount?.toLocaleString() || 0} total records
          </div>
        </div>

        <div className="hud-panel p-3.5 rounded border border-amber-500/30 bg-slate-950/60 font-mono">
          <div className="text-[10px] text-slate-400 uppercase">Synchronization Overhead</div>
          <div className="text-lg font-bold text-amber-300 mt-0.5">{totalOverheadMs} ms</div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">
            Overhead = {overheadPercent}% of total time
          </div>
        </div>

        <div className="hud-panel p-3.5 rounded border border-emerald-500/30 bg-slate-950/60 font-mono">
          <div className="text-[10px] text-slate-400 uppercase">Speedup Achieved</div>
          <div className="text-lg font-bold text-emerald-300 mt-0.5">{selectedRun?.speedup || 1}x</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Efficiency: {Math.round((selectedRun?.efficiency || 1) * 100)}%
          </div>
        </div>
      </div>

      {/* Main Gantt-style Chart */}
      <div className="hud-panel p-6 border border-purple-500/30 rounded-lg bg-slate-950/90 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono text-xs">
          <div className="text-white font-bold uppercase">
            Thread Execution Gantt Diagram: {selectedRun?.examTitle}
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-cyan-500/80 border border-cyan-400" />
              <span className="text-slate-300">Chunk Compute</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-purple-500/80 border border-purple-400" />
              <span className="text-slate-300">Merge & Rank Phase</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500/70" />
              <span className="text-slate-300">Barrier Wait Gap / Overhead</span>
            </div>
          </div>
        </div>

        {/* Time Scale Axis (0ms to totalTimeMs) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-slate-400 px-24">
            <span>0 ms (T_start)</span>
            <span>{Math.round(totalTimeMs * 0.25)} ms</span>
            <span>{Math.round(totalTimeMs * 0.5)} ms</span>
            <span>{Math.round(totalTimeMs * 0.75)} ms</span>
            <span>{totalTimeMs} ms (T_end)</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full mx-24 relative" />
        </div>

        {/* Worker Rows */}
        <div className="space-y-3">
          {workerLanes.map((lane) => {
            const workerId = lane.workerId;
            const workerChunks = lane.chunks;

            return (
              <div key={workerId} className="flex items-center gap-3">
                {/* Worker Label */}
                <div className="w-24 text-right font-mono text-xs text-slate-300 font-bold shrink-0">
                  {selectedRun?.mode === 'sequential' ? 'Main Thread' : `Worker #${workerId}`}
                </div>

                {/* Track Lane Bar */}
                <div className="flex-1 h-9 bg-slate-900/80 rounded border border-slate-800 relative overflow-hidden">
                  {/* Grid lines */}
                  <div className="absolute inset-0 grid grid-cols-4 pointer-events-none border-x border-slate-800/40" />

                  {/* Render Chunks for this worker */}
                  {workerChunks.map((chunk, cIdx) => {
                    const leftPercent = Math.max(0, Math.min(95, ((chunk.startTime || 0) / totalTimeMs) * 100));
                    const widthPercent = Math.max(3, Math.min(100 - leftPercent, ((chunk.durationMs || 10) / totalTimeMs) * 100));

                    return (
                      <motion.div
                        key={chunk.chunkId || cIdx}
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.35, delay: cIdx * 0.05 }}
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                        }}
                        className="absolute top-1 bottom-1 rounded bg-gradient-to-r from-cyan-500/90 to-cyan-400/90 border border-cyan-300 flex items-center justify-between px-2 text-[10px] font-mono text-slate-950 font-bold shadow-[0_0_10px_rgba(0,242,254,0.3)] hover:brightness-110 cursor-pointer group"
                        title={`Chunk #${chunk.chunkId || cIdx + 1}: ${chunk.recordCount || 0} records (${chunk.durationMs}ms)`}
                      >
                        <span className="truncate">C#{chunk.chunkId || cIdx + 1}</span>
                        <span className="text-[9px] opacity-80 hidden sm:inline">
                          {chunk.durationMs}ms
                        </span>
                      </motion.div>
                    );
                  })}

                  {/* Barrier wait idle gap (if this worker finished before other workers) */}
                  {selectedRun?.mode === 'parallel' && workerChunks.length > 0 && (
                    (() => {
                      const lastChunk = workerChunks[workerChunks.length - 1];
                      const chunkEnd = lastChunk?.endTime || (lastChunk?.startTime || 0) + (lastChunk?.durationMs || 0);
                      if (chunkEnd < maxChunkEnd - 1) {
                        const gapLeft = Math.max(0, (chunkEnd / totalTimeMs) * 100);
                        const gapWidth = Math.max(1, ((maxChunkEnd - chunkEnd) / totalTimeMs) * 100);

                        return (
                          <div
                            style={{
                              left: `${gapLeft}%`,
                              width: `${gapWidth}%`,
                            }}
                            className="absolute top-1.5 bottom-1.5 rounded bg-amber-500/20 border border-amber-500/40 border-dashed flex items-center justify-center text-[9px] font-mono text-amber-300"
                            title={`Barrier Idle Gap: Worker #${workerId} idle waiting for other threads (${Number((maxChunkEnd - chunkEnd).toFixed(1))}ms)`}
                          >
                            <span className="hidden sm:inline">idle wait</span>
                          </div>
                        );
                      }
                      return null;
                    })()
                  )}
                </div>
              </div>
            );
          })}

          {/* Merge & Rank Phase Row */}
          <div className="flex items-center gap-3 pt-2 border-t border-slate-850">
            <div className="w-24 text-right font-mono text-xs text-purple-300 font-bold shrink-0">
              Barrier Join
            </div>
            <div className="flex-1 h-8 bg-slate-900/60 rounded border border-slate-800 relative overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  left: `${Math.max(0, Math.min(92, (mergeStartTime / totalTimeMs) * 100))}%`,
                  width: `${Math.max(4, Math.min(100 - (mergeStartTime / totalTimeMs) * 100, (mergeDuration / totalTimeMs) * 100))}%`,
                }}
                className="absolute top-1 bottom-1 rounded bg-gradient-to-r from-purple-500 to-indigo-500 border border-purple-300 flex items-center justify-between px-2 text-[10px] font-mono text-white font-bold shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                title={`Merge & Rank Step: ${mergeDuration}ms`}
              >
                <span className="truncate">MERGE & RANK</span>
                <span className="text-[9px] opacity-80 hidden sm:inline">{mergeDuration}ms</span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Theoretical Gantt Insight */}
        <div className="p-3.5 rounded bg-slate-950 border border-slate-800 text-xs font-mono flex items-start gap-2.5 text-slate-300">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="font-sans leading-relaxed">
            <span className="font-mono text-cyan-300 font-bold uppercase">
              Synchronization Barrier Insight:
            </span>{' '}
            In parallel computing, total execution time is dictated by the <em>slowest chunk</em> (the critical path).
            Unequal chunk sizes or thread context switching causes faster threads to enter an idle wait state
            (striped amber region) until all workers reach the synchronization barrier before the Merge step can proceed.
          </div>
        </div>
      </div>
    </div>
  );
};
