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
  Crosshair,
  CalendarCheck,
  Clock,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const StudentResults = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('scorecard'); // 'active' | 'submitted' | 'scorecard'
  const [resultsData, setResultsData] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedSemesterIndex, setSelectedSemesterIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyResultsAndExams = async () => {
      setLoading(true);
      try {
        const [res, examsRes] = await Promise.all([
          api.get('/results/my-results'),
          api.get('/exams').catch(() => ({ success: false, exams: [] })),
        ]);
        if (res.success) {
          setResultsData(res);
        }
        if (examsRes.success) {
          setExams(examsRes.exams || []);
        }
      } catch (err) {
        toast.error('Failed to load candidate transcript: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMyResultsAndExams();
  }, []);

  const currentResult = resultsData?.results?.[selectedSemesterIndex] || null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header Actions (hidden during print) */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" />
              OFFICIAL TRANSCRIPT PORTAL // [05]
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

      {/* Student Section Core Feature Tabs (hidden during print) */}
      <div className="no-print flex items-center gap-2 p-1.5 bg-[#0F172A]/70 border border-cyan-500/30 rounded-xl overflow-x-auto tech-corners select-none">
        {[
          { id: 'scorecard', code: '01', label: 'Scorecard & Results View', icon: Award },
          { id: 'active', code: '02', label: 'Active/Upcoming Exams', icon: CalendarCheck },
          { id: 'submitted', code: '03', label: 'Submitted Exam Status', icon: Clock },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all select-none ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="text-[10px] text-cyan-500">[{t.code}]</span>
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Scorecard & Results View */}
      {activeTab === 'scorecard' && (
        <div className="space-y-6">
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
        </div>
      )}

      {/* Tab 2: Active/Upcoming Exams */}
      {activeTab === 'active' && (
        <div className="p-5 sm:p-6 rounded-xl bg-[#0F172A]/60 border border-cyan-500/25 backdrop-blur-xl tech-corners">
          <div className="flex items-center justify-between mb-4 font-mono">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-cyan-400" />
                <span>ACTIVE & UPCOMING EXAMINATIONS</span>
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Scheduled evaluation terms and exam dates for current academic cycle
              </p>
            </div>
            <Badge variant="cyan">SEMESTER CYCLE</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[10px] text-slate-400 uppercase tracking-wider border-b border-cyan-500/20">
                <tr>
                  <th className="px-4 py-3">EXAMINATION TITLE</th>
                  <th className="px-4 py-3">TERM</th>
                  <th className="px-4 py-3">TYPE</th>
                  <th className="px-4 py-3">START DATE</th>
                  <th className="px-4 py-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {exams.filter((e) => e.status === 'Scheduled' || e.status === 'Marks Entry').length > 0 ? (
                  exams.filter((e) => e.status === 'Scheduled' || e.status === 'Marks Entry').map((ex) => (
                    <tr key={ex._id} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 font-bold text-white">{ex.title}</td>
                      <td className="px-4 py-3 text-cyan-300">{ex.department} - SEM {ex.semester}</td>
                      <td className="px-4 py-3 uppercase text-slate-400">{ex.type}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(ex.startDate || ex.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={ex.status === 'Marks Entry' ? 'amber' : 'slate'}>
                          {ex.status === 'Marks Entry' ? 'ACTIVE / EVALUATION' : 'SCHEDULED'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-500">
                      // NO UPCOMING EXAMINATIONS SCHEDULED AT THIS TIME.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Submitted Exam Status */}
      {activeTab === 'submitted' && (
        <div className="p-5 sm:p-6 rounded-xl bg-[#0F172A]/60 border border-cyan-500/25 backdrop-blur-xl tech-corners">
          <div className="flex items-center justify-between mb-4 font-mono">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>SUBMITTED EXAM EVALUATION STATUS</span>
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Evaluation milestones and certificate clearance status for completed examinations
              </p>
            </div>
            <Badge variant="emerald">VERIFIED</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[10px] text-slate-400 uppercase tracking-wider border-b border-cyan-500/20">
                <tr>
                  <th className="px-4 py-3">EXAMINATION</th>
                  <th className="px-4 py-3">EVALUATION MILESTONE</th>
                  <th className="px-4 py-3">CLEARANCE STATUS</th>
                  <th className="px-4 py-3">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {exams.filter((e) => e.status === 'Published' || e.status === 'Processing').length > 0 ? (
                  exams.filter((e) => e.status === 'Published' || e.status === 'Processing').map((ex) => (
                    <tr key={ex._id} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 font-bold text-white">{ex.title}</td>
                      <td className="px-4 py-3 text-cyan-300">
                        {ex.status === 'Published' ? 'Marks Reconciled & Certified' : 'Processing Telemetry'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={ex.status === 'Published' ? 'emerald' : 'cyan'}>
                          {ex.status === 'Published' ? 'RESULTS PUBLISHED' : 'IN PROCESSING'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="outline" onClick={() => setActiveTab('scorecard')}>
                          VIEW SCORECARD
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-slate-500">
                      // NO SUBMITTED EXAMINATIONS IN ARCHIVES.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
