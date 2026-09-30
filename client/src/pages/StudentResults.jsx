import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Download,
  Printer,
  FileCheck2,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const StudentResults = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [resultsData, setResultsData] = useState(null);
  const [selectedSemesterIndex, setSelectedSemesterIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Re-evaluation Modal
  const [isReEvalModalOpen, setIsReEvalModalOpen] = useState(false);
  const [reEvalSubject, setReEvalSubject] = useState(null);
  const [reEvalReason, setReEvalReason] = useState('');
  const [reEvalComponent, setReEvalComponent] = useState('external');
  const [submittingReEval, setSubmittingReEval] = useState(false);

  useEffect(() => {
    const fetchMyResults = async () => {
      setLoading(true);
      try {
        const res = await api.get('/results/my-results');
        if (res.success) {
          setResultsData(res);
        }
      } catch (err) {
        toast.error('Failed to load student results: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMyResults();
  }, []);

  const currentResult = resultsData?.results?.[selectedSemesterIndex] || null;

  const handlePrint = () => {
    window.print();
  };

  const handleOpenReEval = (subject) => {
    setReEvalSubject(subject);
    setIsReEvalModalOpen(true);
  };

  const handleSubmitReEval = async (e) => {
    e.preventDefault();
    if (!currentResult || !reEvalSubject) return;

    setSubmittingReEval(true);
    try {
      const res = await api.post('/reevaluation', {
        examId: currentResult.exam?._id || currentResult.exam,
        subjectId: reEvalSubject.subjectId,
        requestedComponent: reEvalComponent,
        reason: reEvalReason,
      });

      if (res.success) {
        toast.success('Re-evaluation request lodged successfully with Exam Cell!');
        setIsReEvalModalOpen(false);
        setReEvalReason('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit re-evaluation');
    } finally {
      setSubmittingReEval(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions (hidden during print) */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Academic Transcript & Results</h1>
          <p className="text-xs text-slate-400 mt-1">
            Official university certified semester-wise grade cards with authenticated security stamp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" icon={Printer} onClick={handlePrint}>
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards (hidden during print) */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Cumulative GPA (CGPA)</p>
            <p className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
              {resultsData?.summary?.cgpa || '0.00'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Across {resultsData?.summary?.totalSemesters || 1} Semester(s)</p>
          </div>
          <Award className="w-8 h-8 text-emerald-400" />
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Current Term SGPA</p>
            <p className="text-3xl font-extrabold font-mono text-cyan-400 mt-1">
              {currentResult?.sgpa || '0.00'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Semester {currentResult?.semester || 3} Result</p>
          </div>
          <FileCheck2 className="w-8 h-8 text-cyan-400" />
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Active Backlogs</p>
            <p className={`text-3xl font-extrabold font-mono mt-1 ${
              (resultsData?.summary?.activeBacklogs || 0) === 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {resultsData?.summary?.activeBacklogs || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {(resultsData?.summary?.activeBacklogs || 0) === 0 ? 'All courses cleared' : 'Backlogs to appear in next term'}
            </p>
          </div>
          <AlertTriangle className={`w-8 h-8 ${(resultsData?.summary?.activeBacklogs || 0) === 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
        </div>
      </div>

      {/* Semester Selector Pill Bar (hidden during print) */}
      {resultsData?.results?.length > 1 && (
        <div className="no-print flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
          {resultsData.results.map((r, idx) => (
            <button
              key={r._id}
              onClick={() => setSelectedSemesterIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono transition select-none ${
                selectedSemesterIndex === idx
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r.exam?.title || `Semester ${r.semester}`} (SGPA: {r.sgpa})
            </button>
          ))}
        </div>
      )}

      {/* OFFICIAL MARKSHEET CARD (PRINTABLE) */}
      {currentResult ? (
        <div className="marksheet-container rounded-3xl bg-slate-900/95 text-slate-100 border border-slate-800 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none">
          {/* Subtle Watermark for authenticity */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
            <Award className="w-[450px] h-[450px] text-white print:text-black" />
          </div>

          <div className="relative z-10 space-y-6">
            {/* Header: University Information */}
            <div className="text-center pb-6 border-b-2 border-slate-700 print:border-black space-y-1">
              <p className="text-xs uppercase font-mono tracking-widest text-cyan-400 print:text-black font-bold">
                Office of the Controller of Examinations
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white print:text-black">
                National Institute of Technology & Engineering
              </h2>
              <p className="text-sm font-semibold text-slate-300 print:text-black">
                Official Grade Card & Semester Performance Transcript
              </p>
              <p className="text-xs font-mono text-slate-400 print:text-black">
                {currentResult.exam?.title || 'Semester Examination 2025-26'}
              </p>
            </div>

            {/* Candidate Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 print:bg-slate-50 print:border-slate-300 text-xs font-mono">
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Candidate Name</span>
                <span className="font-bold text-white print:text-black text-sm">{currentResult.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Roll Number</span>
                <span className="font-bold text-cyan-400 print:text-black text-sm">{currentResult.rollNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Department & Term</span>
                <span className="font-bold text-white print:text-black">{currentResult.department} - Sem {currentResult.semester}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Cohort Section</span>
                <span className="font-bold text-white print:text-black">Section {currentResult.section}</span>
              </div>
            </div>

            {/* Subject Grade Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-black">
              <table className="w-full text-left text-xs text-slate-200 print:text-black">
                <thead className="bg-slate-800/80 print:bg-slate-200 uppercase font-mono text-slate-400 print:text-black">
                  <tr>
                    <th className="px-4 py-3">Course Code</th>
                    <th className="px-4 py-3">Course Title</th>
                    <th className="px-4 py-3 text-center">Credits</th>
                    <th className="px-4 py-3 text-center">Internal</th>
                    <th className="px-4 py-3 text-center">External</th>
                    <th className="px-4 py-3 text-center font-bold">Total</th>
                    <th className="px-4 py-3 text-center font-bold text-cyan-400 print:text-black">Grade</th>
                    <th className="px-4 py-3 text-center">Grade Point</th>
                    <th className="no-print px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                  {currentResult.subjectResults?.map((sub, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                      <td className="px-4 py-2.5 font-mono font-bold text-cyan-400 print:text-black">
                        {sub.subjectCode}
                      </td>
                      <td className="px-4 py-2.5 font-medium">{sub.subjectName}</td>
                      <td className="px-4 py-2.5 text-center font-mono">{sub.credits}</td>
                      <td className="px-4 py-2.5 text-center font-mono">
                        {sub.isAbsent ? 'AB' : sub.internalMarks}
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono">
                        {sub.isAbsent ? 'AB' : sub.externalMarks}
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono font-bold text-white print:text-black">
                        {sub.isAbsent ? 'AB' : sub.totalMarks}
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono font-extrabold text-cyan-300 print:text-black text-sm">
                        {sub.grade}
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono font-semibold">
                        {sub.gradePoint}
                      </td>
                      <td className="no-print px-4 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenReEval(sub)}
                          className="text-[11px] text-cyan-400 hover:underline font-mono"
                        >
                          Re-Eval
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Performance Summary Footnote */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 print:bg-slate-100 print:border-black text-center font-mono">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Total Marks</p>
                <p className="text-base font-bold text-white print:text-black">
                  {currentResult.totalMarksObtained} / {currentResult.maxPossibleMarks}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Aggregate Percentage</p>
                <p className="text-base font-bold text-white print:text-black">{currentResult.percentage}%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Semester SGPA</p>
                <p className="text-xl font-extrabold text-cyan-400 print:text-black">{currentResult.sgpa}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Final Outcome</p>
                <p className={`text-base font-extrabold ${currentResult.status === 'PASS' ? 'text-emerald-400 print:text-black' : 'text-rose-400 print:text-black'}`}>
                  {currentResult.status}
                </p>
              </div>
            </div>

            {/* Verification Stamp & QR Code */}
            <div className="pt-6 border-t-2 border-slate-800 print:border-black flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl text-black">
                  <QrCode className="w-10 h-10" />
                </div>
                <div className="text-[10px] font-mono text-slate-400 print:text-black">
                  <p className="font-bold text-slate-200 print:text-black">DIGITAL VERIFICATION SEAL</p>
                  <p>Hash: {currentResult._id?.substring(0, 16)}...</p>
                  <p>Authenticated: {new Date(currentResult.processedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="w-36 h-10 border-b border-dashed border-slate-600 print:border-black mx-auto mb-1 flex items-end justify-center">
                  <span className="font-serif italic text-xs text-cyan-400 print:text-black">Rajesh Khanna</span>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black">
                  Controller of Examinations
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500">
          No published results found for your account yet.
        </div>
      )}

      {/* RE-EVALUATION REQUEST MODAL */}
      <Modal
        isOpen={isReEvalModalOpen}
        onClose={() => setIsReEvalModalOpen(false)}
        title="Lodge Re-Evaluation Application"
        subtitle={`Apply for formal re-tabulation / review in ${reEvalSubject?.subjectCode} (${reEvalSubject?.subjectName})`}
      >
        <form onSubmit={handleSubmitReEval} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <p className="text-slate-400">Current Grade Awarded: <strong className="text-cyan-400">{reEvalSubject?.grade}</strong></p>
            <p className="text-slate-400">Score Recorded: <strong className="text-white">{reEvalSubject?.totalMarks}</strong> ({reEvalSubject?.internalMarks} Int + {reEvalSubject?.externalMarks} Ext)</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Component for Re-Evaluation
            </label>
            <select
              value={reEvalComponent}
              onChange={(e) => setReEvalComponent(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="external">External End-Term Paper</option>
              <option value="internal">Internal Sessional Marks</option>
              <option value="both">Both Internal & External Components</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Statement of Grounds / Reason for Review
            </label>
            <textarea
              rows={4}
              required
              placeholder="State question discrepancies or un-tabulated score reasons..."
              value={reEvalReason}
              onChange={(e) => setReEvalReason(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsReEvalModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" loading={submittingReEval}>
              Submit to Exam Cell
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
