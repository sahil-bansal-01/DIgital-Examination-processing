// CAPP: Shared Bus Arbitration (Unit 2)
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Clock,
  Shield,
  UserCheck,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Zap,
  Filter,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';

export const BusArbitrationViewer = ({
  busTelemetry,
  busLogs,
  onRefresh,
  onRequestBus,
}) => {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [isRequesting, setIsRequesting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Trigger quick manual bus request
  const handleQuickRequest = async (role, action) => {
    try {
      setIsRequesting(true);
      setFeedbackMsg(null);
      const res = await api.post('/capp-insights/bus/request', {
        role,
        requesterName: role === 'admin' ? 'Chief Admin' : role === 'evaluator' ? 'Prof. Evaluator' : 'Student Candidate',
        action,
        holdDurationMs: 25,
      });

      if (res.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Bus Grant Issued: [${res.data?.grant?.grantId || 'BG-OK'}] to ${role.toUpperCase()} (${res.data?.grant?.arbitrationType || 'GRANTED'})`,
        });
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: `Failed to request bus: ${err.message}` });
    } finally {
      setIsRequesting(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  // Trigger burst demonstration
  const handleSimulateBurst = async () => {
    try {
      setIsRequesting(true);
      setFeedbackMsg(null);
      const res = await api.post('/capp-insights/bus/simulate-burst', {
        adminCount: 4,
        evaluatorCount: 6,
        studentCount: 12,
      });

      if (res.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Burst completed: 22 requests arbitrated. Starvation fallbacks triggered to ensure fair student grants!`,
        });
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: `Burst simulation failed: ${err.message}` });
    } finally {
      setIsRequesting(false);
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  const telemetry = busTelemetry || {
    busState: 'IDLE',
    currentMaster: null,
    consecutiveHighPriorityGrants: 0,
    starvationThreshold: 3,
    queues: { admin: 0, evaluator: 0, student: 0, totalPending: 0 },
    metrics: {
      totalRequestsEnqueued: 32,
      totalGrantsIssued: 32,
      priorityGrantsIssued: 26,
      starvationFallbacksTriggered: 6,
      grantsByRole: { admin: 10, evaluator: 12, student: 10 },
      averageWaitTimeMs: 4.8,
    },
  };

  const logs = busLogs?.logs || [];
  const filteredLogs = selectedRoleFilter === 'all'
    ? logs
    : logs.filter((l) => l.requesterRole === selectedRoleFilter);

  const isBusOccupied = telemetry.busState === 'OCCUPIED';

  return (
    <div className="hud-panel rounded-xl p-5 border border-cyan-500/20 bg-[#080C14]/90 backdrop-blur-xl relative overflow-hidden tech-corners">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-cyan-500/15">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-400 tracking-widest uppercase">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>CENTRAL SHARED BUS ARBITER & GRANT AUDIT (UNIT 2)</span>
          </div>
          <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wide mt-0.5">
            Priority Arbitration & Starvation Fallback
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Real-time bus state indicator */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all ${
              isBusOccupied
                ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isBusOccupied ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
              }`}
            />
            <span>BUS STATE: {telemetry.busState}</span>
            {telemetry.currentMaster && (
              <span className="text-slate-400 text-[10px] hidden md:inline">
                [{telemetry.currentMaster.role.toUpperCase()}]
              </span>
            )}
          </div>

          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-cyan-500/40 transition"
            title="Refresh bus telemetry"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-4 px-3.5 py-2 rounded-lg font-mono text-xs flex items-center gap-2 border ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
            }`}
          >
            <Zap className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>{feedbackMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bus Hardware Architecture & Line Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* Priority Queues Card */}
        <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2.5">
            <span className="text-[10px] uppercase tracking-wider text-cyan-400">// FIFO REQUEST QUEUES</span>
            <span className="text-[10px] text-slate-500">PENDING: {telemetry.queues?.totalPending || 0}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-rose-500/20">
              <div className="flex items-center gap-2 text-rose-300">
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-bold">ADMIN (LEVEL 3)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 font-bold border border-rose-500/30">
                {telemetry.queues?.admin || 0} REQ
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-300">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold">EVALUATOR (LEVEL 2)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 font-bold border border-amber-500/30">
                {telemetry.queues?.evaluator || 0} REQ
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-300">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold">STUDENT (LEVEL 1)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/30">
                {telemetry.queues?.student || 0} REQ
              </span>
            </div>
          </div>
        </div>

        {/* Starvation Prevention Subsystem */}
        <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2.5">
              <span className="text-[10px] uppercase tracking-wider text-purple-400">
                // STARVATION COUNTER (ROUND-ROBIN)
              </span>
              <span className="text-[10px] text-slate-500">MAX: {telemetry.starvationThreshold || 3}</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-snug mb-3">
              Prevents priority monopolization by forcing a Fair Round-Robin cycle when high-priority grants reach the threshold.
            </p>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Consecutive High-Priority Grants:</span>
                <span className="font-bold text-amber-300">
                  {telemetry.consecutiveHighPriorityGrants} / {telemetry.starvationThreshold || 3}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-400 transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (telemetry.consecutiveHighPriorityGrants / (telemetry.starvationThreshold || 3)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Starvation Fallbacks Triggered:</span>
            <span className="text-emerald-400 font-bold font-mono">
              {telemetry.metrics?.starvationFallbacksTriggered || 0} TIMES
            </span>
          </div>
        </div>

        {/* Hardware Control Lines & Quick Dispatch */}
        <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] uppercase tracking-wider text-cyan-400">// HARDWARE BUS DISPATCH</span>
              <span className="text-[10px] text-emerald-400">CLK: 100 MHz</span>
            </div>

            {/* Quick dispatch buttons */}
            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
              <button
                onClick={() => handleQuickRequest('admin', 'LOCK_EXAM_ACADEMICS')}
                disabled={isRequesting}
                className="px-2 py-1.5 rounded bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 text-[10px] font-bold uppercase transition disabled:opacity-50"
              >
                + ADMIN
              </button>
              <button
                onClick={() => handleQuickRequest('evaluator', 'SUBMIT_MARKS_GRID')}
                disabled={isRequesting}
                className="px-2 py-1.5 rounded bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase transition disabled:opacity-50"
              >
                + EVAL
              </button>
              <button
                onClick={() => handleQuickRequest('student', 'FETCH_TRANSCRIPT_PDF')}
                disabled={isRequesting}
                className="px-2 py-1.5 rounded bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase transition disabled:opacity-50"
              >
                + STUDENT
              </button>
            </div>
          </div>

          <button
            onClick={handleSimulateBurst}
            disabled={isRequesting}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/30 to-purple-600/30 hover:from-cyan-600/50 hover:to-purple-600/50 border border-cyan-500/40 text-cyan-200 text-xs font-bold font-mono transition shadow-[0_0_12px_rgba(0,242,254,0.1)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>TRIGGER STARVATION BURST TEST</span>
          </button>
        </div>
      </div>

      {/* Grant Log Audit Table Section */}
      <div className="mt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold uppercase tracking-wider">HARDWARE BUS GRANT LOGS</span>
            <span className="text-slate-500">({filteredLogs.length} GRANTS)</span>
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 font-mono text-[10px]">
            {['all', 'admin', 'evaluator', 'student'].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRoleFilter(r)}
                className={`px-2.5 py-1 rounded uppercase font-semibold transition ${
                  selectedRoleFilter === r
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/70">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[10px] uppercase">
                <th className="py-2.5 px-3">Grant ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Master Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Arbitration Decision</th>
                <th className="py-2.5 px-3 text-right">Wait / Hold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                    No bus grants recorded for filter "{selectedRoleFilter}". Trigger a request above.
                  </td>
                </tr>
              ) : (
                filteredLogs.slice(0, 15).map((log) => {
                  const isFallback = log.arbitrationType === 'STARVATION_FALLBACK_ROUND_ROBIN';
                  const roleStyle =
                    log.requesterRole === 'admin'
                      ? 'bg-rose-950/70 text-rose-300 border-rose-500/40'
                      : log.requesterRole === 'evaluator'
                      ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40';

                  return (
                    <tr key={log.grantId} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-2 px-3 text-cyan-400 font-bold whitespace-nowrap">
                        {log.grantId}
                      </td>
                      <td className="py-2 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${roleStyle}`}
                        >
                          {log.requesterRole}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-white font-medium text-[11px] truncate max-w-[200px]">
                        {log.action}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isFallback
                              ? 'bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-[0_0_8px_rgba(139,92,246,0.2)]'
                              : 'bg-slate-900 text-slate-300 border-slate-700'
                          }`}
                        >
                          {isFallback ? '⚡ FAIR ROUND-ROBIN' : 'PRIORITY GRANT'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300 whitespace-nowrap">
                        <span className="text-cyan-400 font-bold">{log.queueWaitTimeMs}ms</span>
                        <span className="text-slate-600 mx-1">/</span>
                        <span className="text-slate-400">{log.busHoldDurationMs}ms</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
