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
        toast.error('Failed to load candidate transcript: ' + err.message);
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
        toast.success('PETITION FILED: Re-evaluation application dispatched to Exam Cell');
        setIsReEvalModalOpen(false);
        setReEvalReason('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit petition');
    } finally {
      setSubmittingReEval(false);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header Actions (hidden during print) */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" />
              OFFICIAL TRANSCRIPT PORTAL // [08]
            </span>
            <Badge variant="emerald">CERTIFIED ACADEMIC RECORD</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
            CERTIFIED ACADEMIC TRANSCRIPT & GRADE CARD
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans max-w-2xl">
            Cryptographically authenticated semester-wise grade transcripts with digital verification seal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" icon={Printer} onClick={handlePrint}>
            PRINT TRANSCRIPT / PDF
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards (hidden during print) */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 backdrop-blur-xl flex items-center justify-between tech-corners">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">CUMULATIVE GPA (CGPA)</p>
            <p className="text-3xl font-extrabold text-emerald-400 mt-1">
              {resultsData?.summary?.cgpa || '0.00'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">ACROSS {resultsData?.summary?.totalSemesters || 1} SEMESTER(S)</p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Award className="w-7 h-7" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 backdrop-blur-xl flex items-center justify-between tech-corners">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">CURRENT TERM SGPA</p>
            <p className="text-3xl font-extrabold text-cyan-300 mt-1">
              {currentResult?.sgpa || '0.00'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">SEMESTER {currentResult?.semester || 3} RECORD</p>
          </div>
          <div className="p-2.5 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <FileCheck2 className="w-7 h-7" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 backdrop-blur-xl flex items-center justify-between tech-corners">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">ACTIVE BACKLOGS</p>
            <p className={`text-3xl font-extrabold mt-1 ${
              (resultsData?.summary?.activeBacklogs || 0) === 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {resultsData?.summary?.activeBacklogs || 0}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {(resultsData?.summary?.activeBacklogs || 0) === 0 ? 'ALL COURSES CLEARED' : 'BACKLOGS REQUIRE CLEARANCE'}
            </p>
          </div>
          <div className={`p-2.5 rounded-lg border ${
            (resultsData?.summary?.activeBacklogs || 0) === 0
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
          }`}>
            <AlertTriangle className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Semester Selector Pill Bar (hidden during print) */}
      {resultsData?.results?.length > 1 && (
        <div className="no-print flex items-center gap-2 p-1.5 bg-[#0F172A]/70 border border-cyan-500/30 rounded-xl overflow-x-auto tech-corners">
          {resultsData.results.map((r, idx) => (
            <button
              key={r._id}
              onClick={() => setSelectedSemesterIndex(idx)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition select-none ${
                selectedSemesterIndex === idx
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
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
        <div className="marksheet-container rounded-xl bg-[#080C14] text-slate-100 border border-cyan-500/40 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden tech-corners print:bg-white print:text-black print:border-none print:shadow-none">
          {/* Subtle Watermark for authenticity */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
            <Award className="w-[450px] h-[450px] text-cyan-400 print:text-black" />
          </div>

          <div className="relative z-10 space-y-6">
            {/* Header: University Information */}
            <div className="text-center pb-5 border-b-2 border-cyan-500/30 print:border-black space-y-1">
              <p className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 print:text-black font-bold">
                // OFFICE OF THE CONTROLLER OF EXAMINATIONS
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white print:text-black">
                NATIONAL INSTITUTE OF COMPUTATION & PARALLEL SYSTEMS
              </h2>
              <p className="text-xs font-semibold text-slate-300 print:text-black uppercase">
                OFFICIAL GRADE CARD & PERFORMANCE TRANSCRIPT
              </p>
              <p className="text-[11px] text-cyan-300 print:text-black">
                {currentResult.exam?.title || 'Semester Examination 2025-26'}
              </p>
            </div>

            {/* Candidate Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-[#0F172A]/70 border border-cyan-500/20 print:bg-slate-50 print:border-slate-300 text-xs">
              <div>
                <span className="text-slate-500 block uppercase text-[9px]">CANDIDATE NAME</span>
                <span className="font-bold text-white print:text-black text-sm font-sans">{currentResult.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[9px]">ROLL NUMBER</span>
                <span className="font-bold text-cyan-400 print:text-black text-sm">{currentResult.rollNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[9px]">DEPARTMENT & TERM</span>
                <span className="font-bold text-white print:text-black">{currentResult.department} - SEM {currentResult.semester}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[9px]">COHORT SECTION</span>
                <span className="font-bold text-white print:text-black">SECTION {currentResult.section}</span>
              </div>
            </div>

            {/* Subject Grade Table */}
            <div className="overflow-x-auto rounded-lg border border-cyan-500/20 print:border-black">
              <table className="w-full text-left text-xs text-slate-200 print:text-black">
                <thead className="bg-slate-900/90 print:bg-slate-200 uppercase text-[10px] text-slate-400 print:text-black border-b border-cyan-500/20">
                  <tr>
                    <th className="px-4 py-2.5">COURSE CODE</th>
                    <th className="px-4 py-2.5">COURSE TITLE</th>
                    <th className="px-4 py-2.5 text-center">CREDITS</th>
                    <th className="px-4 py-2.5 text-center">INTERNAL</th>
                    <th className="px-4 py-2.5 text-center">EXTERNAL</th>
                    <th className="px-4 py-2.5 text-center font-bold">TOTAL</th>
                    <th className="px-4 py-2.5 text-center font-bold text-cyan-400 print:text-black">GRADE</th>
                    <th className="px-4 py-2.5 text-center">GRADE POINT</th>
                    <th className="no-print px-4 py-2.5 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-slate-300">
                  {currentResult.subjectResults?.map((sub, i) => (
                    <tr key={i} className="hover:bg-slate-900/40 print:hover:bg-transparent">
                      <td className="px-4 py-2 font-bold text-cyan-400 print:text-black">
                        {sub.subjectCode}
                      </td>
                      <td className="px-4 py-2 font-medium font-sans">{sub.subjectName}</td>
                      <td className="px-4 py-2 text-center font-bold text-purple-400">{sub.credits}</td>
                      <td className="px-4 py-2 text-center">
                        {sub.isAbsent ? 'AB' : sub.internalMarks}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {sub.isAbsent ? 'AB' : sub.externalMarks}
                      </td>
                      <td className="px-4 py-2 text-center font-bold text-white print:text-black">
                        {sub.isAbsent ? 'AB' : sub.totalMarks}
                      </td>
                      <td className="px-4 py-2 text-center font-extrabold text-cyan-300 print:text-black text-sm">
                        {sub.grade}
                      </td>
                      <td className="px-4 py-2 text-center font-semibold">
                        {sub.gradePoint}
                      </td>
                      <td className="no-print px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenReEval(sub)}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold"
                        >
                          RE-EVAL //
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Performance Summary Footnote */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-[#0F172A]/70 border border-cyan-500/20 print:bg-slate-100 print:border-black text-center">
              <div>
                <p className="text-[9px] text-slate-500 uppercase">TOTAL MARKS</p>
                <p className="text-sm font-bold text-white print:text-black">
                  {currentResult.totalMarksObtained} / {currentResult.maxPossibleMarks}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 uppercase">AGGREGATE PERCENTAGE</p>
                <p className="text-sm font-bold text-white print:text-black">{currentResult.percentage}%</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 uppercase">SEMESTER SGPA</p>
                <p className="text-lg font-extrabold text-cyan-300 print:text-black">{currentResult.sgpa}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 uppercase">FINAL OUTCOME</p>
                <p className={`text-sm font-extrabold ${currentResult.status === 'PASS' ? 'text-emerald-400 print:text-black' : 'text-rose-400 print:text-black'}`}>
                  {currentResult.status}
                </p>
              </div>
            </div>

            {/* Verification Stamp & QR Code */}
            <div className="pt-5 border-t border-cyan-500/30 print:border-black flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg text-black">
                  <QrCode className="w-9 h-9" />
                </div>
                <div className="text-[9px] text-slate-400 print:text-black">
                  <p className="font-bold text-cyan-300 print:text-black uppercase">DIGITAL HASH VERIFICATION SEAL</p>
                  <p>Hash: {currentResult._id?.substring(0, 16)}...</p>
                  <p>Certified: {new Date(currentResult.processedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="w-36 h-9 border-b border-dashed border-cyan-500/40 print:border-black mx-auto mb-1 flex items-end justify-center">
                  <span className="font-mono text-xs text-cyan-300 print:text-black">AUTH//CAPP-KEY</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300 print:text-black">
                  Controller of Examinations
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 font-mono text-xs">
          // NO PUBLISHED TRANSCRIPTS LOCATED FOR THIS CANDIDATE KEY.
        </div>
      )}

      {/* RE-EVALUATION REQUEST MODAL */}
      <Modal
        isOpen={isReEvalModalOpen}
        onClose={() => setIsReEvalModalOpen(false)}
        title="PETITION FOR RE-EVALUATION"
        subtitle={`Apply for formal re-tabulation / review in ${reEvalSubject?.subjectCode} (${reEvalSubject?.subjectName})`}
      >
        <form onSubmit={handleSubmitReEval} className="space-y-4 font-mono text-xs">
          <div className="p-3 rounded-lg bg-[#080C14] border border-cyan-500/20">
            <p className="text-slate-400">Current Grade Awarded: <strong className="text-cyan-400">{reEvalSubject?.grade}</strong></p>
            <p className="text-slate-400">Score Recorded: <strong className="text-white">{reEvalSubject?.totalMarks}</strong> ({reEvalSubject?.internalMarks} Int + {reEvalSubject?.externalMarks} Ext)</p>
          </div>

          <div>
            <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">
              COMPONENT FOR REVIEW
            </label>
            <select
              value={reEvalComponent}
              onChange={(e) => setReEvalComponent(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#080C14] border border-cyan-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="external">External End-Term Paper</option>
              <option value="internal">Internal Sessional Marks</option>
              <option value="both">Both Internal & External Components</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">
              GROUNDS & REASON FOR REVIEW PETITION
            </label>
            <textarea
              rows={4}
              required
              placeholder="State question discrepancies or un-tabulated score grounds..."
              value={reEvalReason}
              onChange={(e) => setReEvalReason(e.target.value)}
              className="w-full p-2.5 bg-[#080C14] border border-cyan-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-cyan-500/20">
            <Button variant="ghost" onClick={() => setIsReEvalModalOpen(false)}>
              CANCEL
            </Button>
            <Button type="submit" variant="primary" loading={submittingReEval}>
              DISPATCH PETITION
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
