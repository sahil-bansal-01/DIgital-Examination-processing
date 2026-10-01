import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  AlertCircle,
  Check,
  X,
  Crosshair,
  Terminal,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const ReEvaluationAdmin = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [actionType, setActionType] = useState('approve'); // 'approve' | 'reject'
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Approval Form
  const [updatedInternal, setUpdatedInternal] = useState('');
  const [updatedExternal, setUpdatedExternal] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reevaluation');
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (err) {
      toast.error('Failed to load petitions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenReview = (req, action) => {
    setSelectedReq(req);
    setActionType(action);
    setUpdatedInternal(req.previousInternal || 0);
    setUpdatedExternal(req.previousExternal || 0);
    setRemarks(action === 'approve' ? 'Discrepancy verified and corrected.' : 'Marks verified from answer script; no discrepancy found.');
    setReviewModalOpen(true);
  };

  const handleProcessReview = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;

    setSubmitting(true);
    try {
      const res = await api.patch(`/reevaluation/${selectedReq._id}/review`, {
        action: actionType,
        updatedInternal: Number(updatedInternal),
        updatedExternal: Number(updatedExternal),
        reviewRemarks: remarks,
      });

      if (res.success) {
        toast.success(res.message);
        setReviewModalOpen(false);
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.message || 'Review failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" />
              PETITION QUEUE // [09]
            </span>
            <Badge variant="cyan">REVIEW & RE-CALCULATE</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
            RE-EVALUATION APPLICATIONS & PETITIONS
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans max-w-2xl">
            Candidate review submissions, marks discrepancy rectification, and automatic result recalculation.
          </p>
        </div>

        <Button size="sm" variant="ghost" icon={RefreshCw} onClick={fetchRequests}>
          REFRESH QUEUE
        </Button>
      </div>

      {/* Requests Table */}
      <div className="rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-2xl overflow-hidden backdrop-blur-xl tech-corners">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-[10px] text-slate-400 uppercase tracking-wider border-b border-cyan-500/20">
              <tr>
                <th className="px-4 py-3">CANDIDATE</th>
                <th className="px-4 py-3">EXAMINATION</th>
                <th className="px-4 py-3">SUBJECT</th>
                <th className="px-4 py-3">PREVIOUS MARKS</th>
                <th className="px-4 py-3">COMPONENT</th>
                <th className="px-4 py-3">REASON STATED</th>
                <th className="px-4 py-3">STATUS</th>
                {isAdmin && <th className="px-4 py-3 text-center">ACTION</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="text-center py-12 text-slate-500 font-mono">
                    // NO RE-EVALUATION APPLICATIONS LOCATED.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-900/40 transition">
                    <td className="px-4 py-3">
                      <p className="font-bold text-white text-xs font-sans">{req.studentName}</p>
                      <p className="text-[10px] text-cyan-400">{req.rollNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {req.examTitle || 'Semester Exam'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-cyan-300">{req.subjectCode}</span>
                      <span className="block text-[10px] text-slate-400 font-sans">{req.subjectName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-white">{req.previousTotal}</span> (GRADE: {req.previousGrade})
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="purple" size="xs">
                        {req.requestedComponent?.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs truncate font-sans" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          req.status === 'approved'
                            ? 'emerald'
                            : req.status === 'rejected'
                            ? 'rose'
                            : 'amber'
                        }
                      >
                        {req.status?.toUpperCase()}
                      </Badge>
                    </td>

                    {isAdmin && (
                      <td className="px-4 py-3 text-center">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="sm"
                              variant="emerald"
                              onClick={() => handleOpenReview(req, 'approve')}
                            >
                              APPROVE
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleOpenReview(req, 'reject')}
                            >
                              REJECT
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 uppercase">REVIEWED</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REVIEW & RE-CALCULATE MODAL */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={actionType === 'approve' ? 'APPROVE RE-EVALUATION & RECALCULATE' : 'REJECT PETITION'}
        subtitle={`Candidate: ${selectedReq?.studentName} (${selectedReq?.rollNumber}) • ${selectedReq?.subjectCode}`}
      >
        <form onSubmit={handleProcessReview} className="space-y-4 font-mono text-xs">
          {actionType === 'approve' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-200">
                Approving this petition updates the master marks ledger and automatically triggers parallel recalculation of all ranks and grades for this examination!
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">
                    RECTIFIED INTERNAL MARKS
                  </label>
                  <input
                    type="number"
                    value={updatedInternal}
                    onChange={(e) => setUpdatedInternal(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#080C14] border border-cyan-500/30 rounded text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">
                    RECTIFIED EXTERNAL MARKS
                  </label>
                  <input
                    type="number"
                    value={updatedExternal}
                    onChange={(e) => setUpdatedExternal(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#080C14] border border-cyan-500/30 rounded text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">
              OFFICIAL REVIEW REMARKS & DIRECTIVE
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-2.5 bg-[#080C14] border border-cyan-500/30 rounded text-xs text-white focus:border-cyan-400 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-cyan-500/20">
            <Button variant="ghost" onClick={() => setReviewModalOpen(false)}>
              CANCEL
            </Button>
            <Button
              type="submit"
              variant={actionType === 'approve' ? 'primary' : 'danger'}
              loading={submitting}
            >
              {actionType === 'approve' ? 'APPROVE & TRIGGER RUN' : 'CONFIRM REJECTION'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
