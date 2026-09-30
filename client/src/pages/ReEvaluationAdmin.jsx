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
      toast.error('Failed to load re-evaluation requests: ' + err.message);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Re-Evaluation Applications & Petitions</h1>
          <p className="text-xs text-slate-400 mt-1">
            Student review submissions, mark rectification workflow, and automated exam result recalculation.
          </p>
        </div>

        <Button size="sm" variant="ghost" icon={RefreshCw} onClick={fetchRequests}>
          Refresh Queue
        </Button>
      </div>

      {/* Requests Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs text-slate-400 font-mono uppercase">
              <tr>
                <th className="px-5 py-3.5">Candidate</th>
                <th className="px-5 py-3.5">Examination</th>
                <th className="px-5 py-3.5">Subject</th>
                <th className="px-5 py-3.5">Previous Marks</th>
                <th className="px-5 py-3.5">Component</th>
                <th className="px-5 py-3.5">Reason Stated</th>
                <th className="px-5 py-3.5">Status</th>
                {isAdmin && <th className="px-5 py-3.5 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="text-center py-12 text-slate-500">
                    No re-evaluation applications found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-white text-sm">{req.studentName}</p>
                      <p className="text-xs font-mono text-cyan-400">{req.rollNumber}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 font-medium">
                      {req.examTitle || 'Semester Exam'}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs">
                      <span className="font-bold text-white">{req.subjectCode}</span>
                      <span className="block text-[11px] text-slate-400">{req.subjectName}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs">
                      <span className="font-bold text-white">{req.previousTotal}</span> (Grade: {req.previousGrade})
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="indigo" size="xs">
                        {req.requestedComponent}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="px-5 py-3.5">
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
                      <td className="px-5 py-3.5 text-center">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleOpenReview(req, 'approve')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenReview(req, 'reject')}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">Reviewed</span>
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
        title={actionType === 'approve' ? 'Approve Re-Evaluation & Recalculate' : 'Reject Re-Evaluation Application'}
        subtitle={`Candidate: ${selectedReq?.studentName} (${selectedReq?.rollNumber}) • ${selectedReq?.subjectCode}`}
      >
        <form onSubmit={handleProcessReview} className="space-y-4">
          {actionType === 'approve' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200">
                Approving this request will update the master Mark record and trigger an immediate recalculation of all ranks and grades for this examination!
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Rectified Internal Marks
                  </label>
                  <input
                    type="number"
                    value={updatedInternal}
                    onChange={(e) => setUpdatedInternal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Rectified External Marks
                  </label>
                  <input
                    type="number"
                    value={updatedExternal}
                    onChange={(e) => setUpdatedExternal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Official Review Remarks / Order
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={actionType === 'approve' ? 'gradient' : 'danger'}
              loading={submitting}
            >
              {actionType === 'approve' ? 'Approve & Trigger Recalculation' : 'Confirm Rejection'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
