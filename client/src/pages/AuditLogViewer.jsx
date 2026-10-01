import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  Shield,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  Code,
  Crosshair,
  Terminal,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const AuditLogViewer = () => {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [selectedModule, setSelectedModule] = useState('');
  const [loading, setLoading] = useState(true);
  const [inspectLog, setInspectLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page, limit: 20 });
      if (selectedModule) query.append('module', selectedModule);

      const res = await api.get(`/audit?${query.toString()}`);
      if (res.success) {
        setLogs(res.logs || []);
        setTotalCount(res.totalCount || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load audit logs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, selectedModule]);

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" />
              SECURITY & AUDIT PROTOCOLS // [10]
            </span>
            <Badge variant="emerald">TAMPER-EVIDENT LEDGER</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase flex items-center gap-2">
            <span>SYSTEM AUDIT TRAIL & SECURITY LEDGER</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans max-w-2xl">
            Immutable stream of user interactions, mark mutations, lifecycle transitions, and administrator overrides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedModule}
            onChange={(e) => {
              setSelectedModule(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-[#080C14] border border-cyan-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 transition"
          >
            <option value="">ALL FUNCTIONAL MODULES</option>
            <option value="MarksEntry">Marks Entry</option>
            <option value="ExamManagement">Exam Management</option>
            <option value="ProcessingEngine">Processing Engine</option>
            <option value="AcademicSetup">Academic Setup</option>
            <option value="ReEvaluation">Re-Evaluation</option>
            <option value="Auth">Authentication</option>
          </select>

          <Button size="sm" variant="ghost" icon={RefreshCw} onClick={fetchLogs}>
            REFRESH
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-2xl overflow-hidden backdrop-blur-xl tech-corners">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-[10px] text-slate-400 uppercase tracking-wider border-b border-cyan-500/20">
              <tr>
                <th className="px-4 py-3">TIMESTAMP</th>
                <th className="px-4 py-3">ACTOR</th>
                <th className="px-4 py-3">MODULE</th>
                <th className="px-4 py-3">EVENT ACTION</th>
                <th className="px-4 py-3">DETAILS</th>
                <th className="px-4 py-3 text-center">PAYLOAD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500 font-mono">
                    // NO AUDIT STREAM RECORDS LOCATED.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/40 transition">
                    <td className="px-4 py-2.5 text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="font-bold text-white text-xs">{log.userName}</p>
                      <Badge variant="cyan" size="xs">
                        {log.userRole?.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-purple-300">{log.module}</td>
                    <td className="px-4 py-2.5 font-bold text-xs text-cyan-400 uppercase">{log.action}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-300 max-w-md truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {(log.oldValue || log.newValue) && (
                        <button
                          onClick={() => setInspectLog(log)}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-cyan-500/30 text-[10px] text-cyan-300 hover:border-cyan-400 transition"
                        >
                          DIFF //
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3.5 border-t border-cyan-500/20 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>
            PAGE {page} OF {totalPages} ({totalCount} RECORDS IN LEDGER)
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={ChevronLeft}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              PREV
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              NEXT <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* INSPECT LOG DIFF MODAL */}
      <Modal
        isOpen={!!inspectLog}
        onClose={() => setInspectLog(null)}
        title={`STATE INSPECTION // ${inspectLog?.action}`}
        subtitle={`Recorded by ${inspectLog?.userName} at ${new Date(inspectLog?.createdAt).toLocaleString()}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 font-mono text-xs">
          <div>
            <span className="text-slate-400 block mb-1 uppercase font-bold tracking-wider">// EVENT CONTEXT:</span>
            <p className="p-2.5 rounded-lg bg-[#080C14] border border-cyan-500/20 text-slate-200">
              {inspectLog?.details}
            </p>
          </div>

          {inspectLog?.oldValue && (
            <div>
              <span className="text-rose-400 block mb-1 uppercase font-bold tracking-wider">PREVIOUS VALUE (-):</span>
              <pre className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-200 overflow-x-auto text-[11px]">
                {JSON.stringify(inspectLog.oldValue, null, 2)}
              </pre>
            </div>
          )}

          {inspectLog?.newValue && (
            <div>
              <span className="text-emerald-400 block mb-1 uppercase font-bold tracking-wider">MUTATED VALUE (+):</span>
              <pre className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 overflow-x-auto text-[11px]">
                {JSON.stringify(inspectLog.newValue, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={() => setInspectLog(null)}>
              CLOSE INSPECTION
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
