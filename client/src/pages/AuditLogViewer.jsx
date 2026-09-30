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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            System Audit Trail & Security Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of all user activities, mark mutations, status transitions, and administrative overrides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedModule}
            onChange={(e) => {
              setSelectedModule(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Functional Modules</option>
            <option value="MarksEntry">Marks Entry</option>
            <option value="ExamManagement">Exam Management</option>
            <option value="ProcessingEngine">Processing Engine</option>
            <option value="AcademicSetup">Academic Setup</option>
            <option value="ReEvaluation">Re-Evaluation</option>
            <option value="Auth">Authentication</option>
          </select>

          <Button size="sm" variant="ghost" icon={RefreshCw} onClick={fetchLogs}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs text-slate-400 font-mono uppercase">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-5 py-3.5">Module</th>
                <th className="px-5 py-3.5">Action Event</th>
                <th className="px-5 py-3.5">Details</th>
                <th className="px-5 py-3.5 text-center">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">
                    No audit records located.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3 text-xs font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-white text-xs">{log.userName}</p>
                      <Badge variant="cyan" size="xs">
                        {log.userRole?.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-indigo-300">{log.module}</td>
                    <td className="px-5 py-3 font-mono font-bold text-xs text-cyan-400">{log.action}</td>
                    <td className="px-5 py-3 text-xs text-slate-300 max-w-md truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {(log.oldValue || log.newValue) && (
                        <button
                          onClick={() => setInspectLog(log)}
                          className="px-2 py-1 rounded-lg bg-slate-800 text-[11px] font-mono text-cyan-400 hover:bg-slate-700 transition"
                        >
                          View Diff
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
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>
            Showing Page {page} of {totalPages} ({totalCount} total entries)
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={ChevronLeft}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* INSPECT LOG DIFF MODAL */}
      <Modal
        isOpen={!!inspectLog}
        onClose={() => setInspectLog(null)}
        title={`Audit State Inspection: ${inspectLog?.action}`}
        subtitle={`Recorded by ${inspectLog?.userName} at ${new Date(inspectLog?.createdAt).toLocaleString()}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 font-mono text-xs">
          <div>
            <span className="text-slate-400 block mb-1 uppercase font-bold">Details:</span>
            <p className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">
              {inspectLog?.details}
            </p>
          </div>

          {inspectLog?.oldValue && (
            <div>
              <span className="text-rose-400 block mb-1 uppercase font-bold">Previous Value (-):</span>
              <pre className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-200 overflow-x-auto">
                {JSON.stringify(inspectLog.oldValue, null, 2)}
              </pre>
            </div>
          )}

          {inspectLog?.newValue && (
            <div>
              <span className="text-emerald-400 block mb-1 uppercase font-bold">Mutated Value (+):</span>
              <pre className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 overflow-x-auto">
                {JSON.stringify(inspectLog.newValue, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={() => setInspectLog(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
