// CAPP: MESI Cache Coherence (Unit 6)
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Cpu,
  RefreshCw,
  Zap,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Radio,
  Clock,
  Eye,
  Edit3,
} from 'lucide-react';
import { api } from '../../services/api';

const MESI_BADGES = {
  M: {
    label: 'MODIFIED',
    style: 'bg-amber-950/80 text-amber-300 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.25)]',
    desc: 'Dirty, exclusive to core. Uncommitted to DB.',
  },
  E: {
    label: 'EXCLUSIVE',
    style: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(0,242,254,0.2)]',
    desc: 'Clean, exclusive to core. Matches DB.',
  },
  S: {
    label: 'SHARED',
    style: 'bg-purple-950/80 text-purple-300 border-purple-500/60 shadow-[0_0_10px_rgba(139,92,246,0.2)]',
    desc: 'Clean, present in multiple caches. Matches DB.',
  },
  I: {
    label: 'INVALID',
    style: 'bg-rose-950/80 text-rose-300 border-rose-500/50',
    desc: 'Stale line. Invalidated by remote write.',
  },
};

export const MesiCoherenceMatrix = ({ coherenceData, onRefresh }) => {
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [targetMarks, setTargetMarks] = useState(95);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const matrix = coherenceData || {
    records: [],
    cores: [],
    stats: { totalReads: 0, totalWrites: 0, snoopInvalidationsBroadcast: 0, optimisticLockHits: 0, optimisticLockConflicts: 0 },
    snoopEvents: [],
  };

  const records = matrix.records || [];
  const cores = matrix.cores || [];
  const snoopEvents = matrix.snoopEvents || [];

  // Core Read Action (Simulates BusRd)
  const handleRead = async (coreId, recordId) => {
    try {
      setIsProcessing(true);
      setFeedback(null);
      const res = await api.post('/capp-insights/coherence/read', { coreId, recordId });
      if (res.success) {
        setFeedback({
          type: 'success',
          text: `[BusRd] Core ${coreId} read ${recordId}. Transitioned to State [${res.data?.state}]. Value: ${res.data?.marks} marks.`,
        });
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      setFeedback({ type: 'error', text: `Read transaction failed: ${err.message}` });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setFeedback(null), 4500);
    }
  };

  // Safe Update with matching version (Tests Optimistic Lock & Automatic Invalidation)
  const handleUpdateMarks = async (coreId, recordId, currentVersion, marksToSave) => {
    try {
      setIsProcessing(true);
      setFeedback(null);
      const res = await api.post('/capp-insights/coherence/update', {
        coreId,
        recordId,
        updatedMarks: marksToSave,
        expectedVersion: currentVersion,
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          text: `[BusUpgr / INV] Updated marks to ${marksToSave}. Version bumped to v${res.data?.version}. Other cores invalidated to [I]!`,
        });
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      if (err.status === 409) {
        setFeedback({
          type: 'conflict',
          text: `[HTTP 409 CONFLICT] Optimistic lock conflict! Write-after-Write hazard prevented. Main memory version does not match expected version.`,
        });
      } else {
        setFeedback({ type: 'error', text: `Update failed: ${err.message}` });
      }
    } finally {
      setIsProcessing(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Simulate Stale Concurrent Write (Forces Optimistic Lock Conflict)
  const handleForceConflict = async (coreId, recordId) => {
    try {
      setIsProcessing(true);
      setFeedback(null);
      // Intentionally pass stale version (e.g. 0 or outdated)
      await api.post('/capp-insights/coherence/update', {
        coreId,
        recordId,
        updatedMarks: 99,
        expectedVersion: 0, // Outdated stale version
      });
    } catch (err) {
      setFeedback({
        type: 'conflict',
        text: `[HAZARD DETECTED] Optimistic Lock Conflict (HTTP 409): Core submitted version v0, but DB is newer. Transaction safely aborted without corrupting database!`,
      });
      if (onRefresh) onRefresh();
    } finally {
      setIsProcessing(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  return (
    <div className="hud-panel rounded-xl p-5 border border-cyan-500/20 bg-[#080C14]/90 backdrop-blur-xl relative overflow-hidden tech-corners">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-cyan-500/15">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-400 tracking-widest uppercase">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>ILLINOIS MESI PROTOCOL & OPTIMISTIC CONCURRENCY (UNIT 6)</span>
          </div>
          <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wide mt-0.5">
            Cache Coherence Directory Matrix
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Snoop bus active indicator */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-purple-950/60 border border-purple-500/40 font-mono text-xs text-purple-300">
            <Share2 className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>SNOOP BUS INVALIDATE ACTIVE</span>
          </div>

          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-cyan-500/40 transition"
            title="Refresh MESI directory"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Illinois MESI Protocol State Key Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4 font-mono text-xs">
        {Object.entries(MESI_BADGES).map(([key, item]) => (
          <div key={key} className={`p-2.5 rounded-lg border ${item.style}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm tracking-wider">[{key}] {item.label}</span>
            </div>
            <p className="text-[10px] opacity-90 leading-tight">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Feedback Banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-4 px-3.5 py-2.5 rounded-lg font-mono text-xs flex items-center gap-2 border ${
              feedback.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                : feedback.type === 'conflict'
                ? 'bg-amber-950/70 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'bg-rose-950/70 border-rose-500/50 text-rose-300'
            }`}
          >
            {feedback.type === 'conflict' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MESI State Matrix Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/70 mb-4">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[10px] uppercase">
              <th className="py-2.5 px-3">Student Record</th>
              <th className="py-2.5 px-3">Main DB Version</th>
              <th className="py-2.5 px-3 text-cyan-400">Core 1 (Evaluator 1)</th>
              <th className="py-2.5 px-3 text-emerald-400">Core 2 (Evaluator 2)</th>
              <th className="py-2.5 px-3 text-purple-400">Core 3 (Admin)</th>
              <th className="py-2.5 px-3 text-right">Interactive Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {records.map((rec) => {
              const c1 = rec.coreStates?.core1 || { state: 'I', marks: null };
              const c2 = rec.coreStates?.core2 || { state: 'I', marks: null };
              const c3 = rec.coreStates?.core3 || { state: 'I', marks: null };

              const renderStateBadge = (coreData) => {
                const b = MESI_BADGES[coreData.state] || MESI_BADGES.I;
                return (
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold border ${b.style}`}>
                      [{coreData.state}]
                    </span>
                    <span className="text-slate-300 font-bold">
                      {coreData.marks !== null ? `${coreData.marks}m` : '--'}
                    </span>
                  </div>
                );
              };

              return (
                <tr key={rec.recordId} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-white text-[11px]">{rec.studentName}</div>
                    <div className="text-[10px] text-slate-500">
                      {rec.rollNumber} &bull; {rec.subjectCode}
                    </div>
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                        v{rec.mainMemoryVersion}
                      </span>
                      <span className="text-slate-300 font-bold text-[11px]">{rec.mainMemoryMarks} MARKS</span>
                    </div>
                  </td>

                  <td className="py-2.5 px-3">{renderStateBadge(c1)}</td>
                  <td className="py-2.5 px-3">{renderStateBadge(c2)}</td>
                  <td className="py-2.5 px-3">{renderStateBadge(c3)}</td>

                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleRead('core1', rec.recordId)}
                        disabled={isProcessing}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-[10px] font-bold uppercase transition"
                        title="Evaluator 1 reads record (BusRd)"
                      >
                        READ (C1)
                      </button>

                      <button
                        onClick={() =>
                          handleUpdateMarks('core1', rec.recordId, rec.mainMemoryVersion, (rec.mainMemoryMarks || 80) + 2)
                        }
                        disabled={isProcessing}
                        className="px-2 py-1 rounded bg-amber-950/80 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase transition"
                        title="Core 1 updates marks -> Invalidation broadcast"
                      >
                        UPDATE (INV)
                      </button>

                      <button
                        onClick={() => handleForceConflict('core2', rec.recordId)}
                        disabled={isProcessing}
                        className="px-2 py-1 rounded bg-rose-950/80 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-[10px] font-bold uppercase transition"
                        title="Simulate concurrent write collision with stale version"
                      >
                        TEST CONFLICT
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Snoop Bus Real-Time Broadcast Stream */}
      <div>
        <div className="flex items-center gap-2 mb-2 font-mono text-xs text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold uppercase tracking-wider">SNOOP BUS BROADCAST STREAM</span>
          <span className="text-slate-500">({snoopEvents.length} EVENTS)</span>
        </div>

        <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/60 p-2 space-y-1 font-mono text-[10px]">
          {snoopEvents.length === 0 ? (
            <p className="text-slate-500 text-center py-2">No snoop broadcast events recorded yet.</p>
          ) : (
            snoopEvents.slice(0, 10).map((evt) => (
              <div key={evt.id} className="flex items-center justify-between py-1 px-2 rounded bg-slate-900/50 hover:bg-slate-900">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">[{evt.action}]</span>
                  <span className="text-slate-300">{evt.details}</span>
                </div>
                <span className="text-slate-500 whitespace-nowrap ml-2">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
