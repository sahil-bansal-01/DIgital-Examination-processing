import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSpreadsheet,
  Upload,
  Save,
  Download,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Search,
  RefreshCw,
  XCircle,
  FileDown,
  Crosshair,
  Terminal,
  Activity,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const MarksEntry = () => {
  const [searchParams] = useSearchParams();
  const { user, isTeacher } = useAuth();
  const toast = useToast();

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(searchParams.get('examId') || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState(searchParams.get('subjectId') || '');
  const [selectedSection, setSelectedSection] = useState(searchParams.get('section') || 'A');

  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // CSV Modal
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [validationReport, setValidationReport] = useState(null);
  const [uploading, setUploading] = useState(false);

  const currentExam = exams.find((e) => e._id === selectedExamId);
  const currentSubject = subjects.find((s) => s._id === selectedSubjectId);

  // 1. Fetch Exams
  useEffect(() => {
    const loadExams = async () => {
      try {
        const res = await api.get('/exams');
        if (res.success && res.exams?.length > 0) {
          setExams(res.exams);
          if (!selectedExamId) {
            setSelectedExamId(res.exams[0]._id);
          }
        }
      } catch (err) {
        toast.error('Failed to load exams');
      }
    };
    loadExams();
  }, []);

  // 2. Fetch Subjects when Exam changes
  useEffect(() => {
    if (!selectedExamId) return;
    const exam = exams.find((e) => e._id === selectedExamId);
    if (exam && exam.subjects?.length > 0) {
      let allowedSubjects = exam.subjects;
      if (isTeacher && user?.assignedSubjects) {
        const assignedCodes = user.assignedSubjects.map((a) => a.subjectCode);
        allowedSubjects = exam.subjects.filter((s) => assignedCodes.includes(s.code || s));
      }
      setSubjects(allowedSubjects);
      if (allowedSubjects.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(allowedSubjects[0]._id || allowedSubjects[0]);
      }
    }
  }, [selectedExamId, exams, isTeacher, user]);

  // 3. Fetch Students & Existing Marks
  const fetchMarksSheet = async () => {
    if (!selectedExamId || !selectedSubjectId) return;
    setLoading(true);
    try {
      const stdRes = await api.get(`/academic/students?section=${selectedSection}`);
      const studentsList = stdRes.students || [];
      setStudents(studentsList);

      const marksRes = await api.get(
        `/marks?examId=${selectedExamId}&subjectId=${selectedSubjectId}&section=${selectedSection}`
      );
      const markMap = {};

      studentsList.forEach((std) => {
        markMap[std.rollNumber] = {
          studentId: std._id,
          studentName: std.name,
          rollNumber: std.rollNumber,
          internalMarks: '',
          externalMarks: '',
          isAbsent: false,
        };
      });

      if (marksRes.success && marksRes.marks) {
        marksRes.marks.forEach((m) => {
          if (markMap[m.rollNumber]) {
            markMap[m.rollNumber].internalMarks = m.isAbsent ? '' : m.internalMarks;
            markMap[m.rollNumber].externalMarks = m.isAbsent ? '' : m.externalMarks;
            markMap[m.rollNumber].isAbsent = !!m.isAbsent;
          }
        });
      }

      setMarksData(markMap);
    } catch (err) {
      toast.error('Failed to load marks sheet: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarksSheet();
  }, [selectedExamId, selectedSubjectId, selectedSection]);

  const handleCellChange = (rollNumber, field, value) => {
    setMarksData((prev) => ({
      ...prev,
      [rollNumber]: {
        ...prev[rollNumber],
        [field]: value,
      },
    }));
  };

  const handleToggleAbsent = (rollNumber) => {
    setMarksData((prev) => {
      const current = prev[rollNumber];
      const nextAbsent = !current.isAbsent;
      return {
        ...prev,
        [rollNumber]: {
          ...current,
          isAbsent: nextAbsent,
          internalMarks: nextAbsent ? '' : current.internalMarks,
          externalMarks: nextAbsent ? '' : current.externalMarks,
        },
      };
    });
  };

  const handleSaveGrid = async () => {
    if (!selectedExamId || !selectedSubjectId) return;
    if (currentExam?.isMarksEntryLocked) {
      toast.error('ACCESS REJECTED: Exam is locked by Exam Cell.');
      return;
    }

    setSaving(true);
    try {
      const recordsToSave = Object.values(marksData).map((item) => ({
        rollNumber: item.rollNumber,
        internalMarks: item.isAbsent ? 0 : Number(item.internalMarks || 0),
        externalMarks: item.isAbsent ? 0 : Number(item.externalMarks || 0),
        isAbsent: item.isAbsent,
      }));

      const res = await api.post('/marks/batch', {
        examId: selectedExamId,
        subjectId: selectedSubjectId,
        section: selectedSection,
        marks: recordsToSave,
      });

      if (res.success) {
        toast.success(`Marks committed for ${res.count} candidates!`);
        fetchMarksSheet();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  const handleValidateCsv = async (commit = false) => {
    if (!csvText.trim()) {
      toast.error('INPUT ERROR: CSV content empty');
      return;
    }

    setUploading(true);
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) throw new Error('CSV must have header line and data rows');

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
        const rowObj = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] !== undefined ? values[idx] : '';
        });
        rows.push(rowObj);
      }

      const res = await api.post('/marks/upload-csv', {
        examId: selectedExamId,
        subjectId: selectedSubjectId,
        section: selectedSection,
        rows,
        commit,
      });

      setValidationReport(res);

      if (commit && res.committed) {
        toast.success(`Imported ${res.savedCount} candidate marks into database!`);
        setIsCsvModalOpen(false);
        setCsvText('');
        fetchMarksSheet();
      } else if (!commit) {
        toast.info(`Telemetry Scan: ${res.validCount} valid, ${res.errorCount} anomalies detected.`);
      }
    } catch (err) {
      toast.error(err.message || 'CSV processing failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadSampleCsv = () => {
    const headers = ['Roll Number', 'Internal Marks', 'External Marks', 'isAbsent'];
    const sampleRows = students.slice(0, 10).map((s) => `"${s.rollNumber}",25,60,false`);
    const csvContent = [headers.join(','), ...sampleRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marks_template_${selectedSection}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadErrorReport = () => {
    if (!validationReport?.errors?.length) return;
    const headers = ['Row Number', 'Roll Number', 'Validation Error'];
    const rows = validationReport.errors.map((e) => `${e.row},"${e.rollNumber}","${e.error}"`);
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'marks_upload_error_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredStudents = students.filter(
    (std) =>
      std.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      std.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" />
              TELEMETRY INGESTION MATRIX // [04]
            </span>
            <Badge variant="cyan">CLIENT-SIDE SCHEMA AUDIT</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
            MARKS ENTRY & EVALUATION MATRIX
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans max-w-2xl">
            Spreadsheet-style telemetry entry with instantaneous boundary enforcement and CSV validation parser.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" icon={Upload} onClick={() => setIsCsvModalOpen(true)}>
            UPLOAD CSV //
          </Button>

          <Button
            variant="primary"
            icon={Save}
            loading={saving}
            disabled={currentExam?.isMarksEntryLocked}
            onClick={handleSaveGrid}
          >
            COMMIT MARKS MATRIX
          </Button>
        </div>
      </div>

      {/* Lock Status Banner */}
      {currentExam?.isMarksEntryLocked && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center gap-3 text-rose-300 tech-corners">
          <Lock className="w-5 h-5 text-rose-400 shrink-0" />
          <div className="text-xs font-mono">
            <span className="font-bold text-white uppercase">[ PROTOCOL LOCKED ]:</span> Exam Cell has cryptographically locked this evaluation window.
            All input nodes are set to read-only until an authorized key restores write access.
          </div>
        </div>
      )}

      {/* Filter / Selector Bar */}
      <div className="p-4 rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-xl backdrop-blur-xl grid grid-cols-1 sm:grid-cols-4 gap-4 items-center tech-corners">
        {/* Exam Select */}
        <div>
          <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">
            EXAMINATION PROTOCOL
          </label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full px-3 py-2 bg-[#080C14] border border-cyan-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 transition"
          >
            {exams.map((ex) => (
              <option key={ex._id} value={ex._id}>
                {ex.title} [{ex.status?.toUpperCase()}]
              </option>
            ))}
          </select>
        </div>

        {/* Subject Select */}
        <div>
          <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">
            SUBJECT OFFERING
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 bg-[#080C14] border border-cyan-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 transition"
          >
            {subjects.map((sub) => (
              <option key={sub._id || sub} value={sub._id || sub}>
                {sub.code || sub} - {sub.name || 'Subject'}
              </option>
            ))}
          </select>
        </div>

        {/* Section Select */}
        <div>
          <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">
            COHORT SECTION
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full px-3 py-2 bg-[#080C14] border border-cyan-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 transition"
          >
            <option value="A">SECTION A</option>
            <option value="B">SECTION B</option>
          </select>
        </div>

        {/* Search Input */}
        <div>
          <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">
            CANDIDATE FILTER
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter candidate or roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#080C14] border border-cyan-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 transition"
            />
          </div>
        </div>
      </div>

      {/* Spreadsheet Editable Grid */}
      <div className="rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-2xl overflow-hidden backdrop-blur-xl tech-corners">
        <div className="p-3.5 border-b border-cyan-500/20 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white uppercase">
              {currentSubject?.code || 'Subject'} - {currentSubject?.name || ''}
            </span>
            <span className="text-slate-600">|</span>
            <span>MAX INTERNAL: <strong className="text-cyan-400">{currentSubject?.maxInternalMarks || 30}</strong></span>
            <span className="text-slate-600">|</span>
            <span>MAX EXTERNAL: <strong className="text-cyan-400">{currentSubject?.maxExternalMarks || 70}</strong></span>
            <span className="text-slate-600">|</span>
            <span>MAX TOTAL: <strong className="text-emerald-400">100</strong></span>
          </div>

          <div className="text-[11px] text-slate-400">
            SHOWING {filteredStudents.length} OF {students.length} CANDIDATES
          </div>
        </div>

        <div className="overflow-x-auto max-h-[580px]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-[10px] text-slate-400 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md border-b border-cyan-500/20">
              <tr>
                <th className="px-4 py-3 w-14">#</th>
                <th className="px-4 py-3 w-36">ROLL NUMBER</th>
                <th className="px-4 py-3">CANDIDATE NAME</th>
                <th className="px-4 py-3 text-center w-28">STATUS</th>
                <th className="px-4 py-3 w-36">INTERNAL ({currentSubject?.maxInternalMarks || 30})</th>
                <th className="px-4 py-3 w-36">EXTERNAL ({currentSubject?.maxExternalMarks || 70})</th>
                <th className="px-4 py-3 w-28 font-bold text-cyan-400">TOTAL (100)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400 font-mono">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                    SYNCHRONIZING CANDIDATE ROSTER...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500 font-mono">
                    // NO CANDIDATE NODES FOUND MATCHING QUERY.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std, idx) => {
                  const m = marksData[std.rollNumber] || {};
                  const isAbsent = !!m.isAbsent;
                  const maxInternal = currentSubject?.maxInternalMarks || 30;
                  const maxExternal = currentSubject?.maxExternalMarks || 70;

                  const internalNum = Number(m.internalMarks || 0);
                  const externalNum = Number(m.externalMarks || 0);

                  const isInternalInvalid = !isAbsent && m.internalMarks !== '' && (internalNum < 0 || internalNum > maxInternal);
                  const isExternalInvalid = !isAbsent && m.externalMarks !== '' && (externalNum < 0 || externalNum > maxExternal);
                  const total = isAbsent ? 0 : internalNum + externalNum;

                  return (
                    <tr
                      key={std.rollNumber}
                      className={`hover:bg-slate-900/40 transition ${
                        isAbsent ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="px-4 py-2 font-mono text-[11px] text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-2 font-mono font-bold text-cyan-400">{std.rollNumber}</td>
                      <td className="px-4 py-2 font-medium text-white">{std.name}</td>

                      {/* Absent Toggle Button */}
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          disabled={currentExam?.isMarksEntryLocked}
                          onClick={() => handleToggleAbsent(std.rollNumber)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition border ${
                            isAbsent
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.25)]'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                          }`}
                        >
                          {isAbsent ? 'ABSENT' : 'PRESENT'}
                        </button>
                      </td>

                      {/* Internal Marks Input */}
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          disabled={isAbsent || currentExam?.isMarksEntryLocked}
                          min="0"
                          max={maxInternal}
                          value={m.internalMarks}
                          onChange={(e) => handleCellChange(std.rollNumber, 'internalMarks', e.target.value)}
                          placeholder="0"
                          className={`w-24 px-2.5 py-1 bg-[#080C14] rounded-lg text-white font-mono text-xs border focus:outline-none transition ${
                            isInternalInvalid
                              ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-950/30'
                              : 'border-cyan-500/30 focus:border-cyan-400'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        />
                      </td>

                      {/* External Marks Input */}
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          disabled={isAbsent || currentExam?.isMarksEntryLocked}
                          min="0"
                          max={maxExternal}
                          value={m.externalMarks}
                          onChange={(e) => handleCellChange(std.rollNumber, 'externalMarks', e.target.value)}
                          placeholder="0"
                          className={`w-24 px-2.5 py-1 bg-[#080C14] rounded-lg text-white font-mono text-xs border focus:outline-none transition ${
                            isExternalInvalid
                              ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-950/30'
                              : 'border-cyan-500/30 focus:border-cyan-400'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        />
                      </td>

                      {/* Total Display */}
                      <td className="px-4 py-2 font-mono font-extrabold text-sm text-cyan-300">
                        {isAbsent ? (
                          <span className="text-rose-400 text-xs font-bold">[ AB ]</span>
                        ) : (
                          total
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV BATCH UPLOAD MODAL WITH VALIDATION REPORT */}
      <Modal
        isOpen={isCsvModalOpen}
        onClose={() => {
          setIsCsvModalOpen(false);
          setValidationReport(null);
        }}
        title="BATCH MARKS TELEMETRY INGESTION"
        subtitle="Upload or paste CSV student marks for automated rule-checking and error discovery"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4 font-mono">
          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-cyan-500/20">
            <span>
              FORMAT: <strong className="text-cyan-300">Roll Number, Internal Marks, External Marks, isAbsent</strong>
            </span>
            <Button size="sm" variant="ghost" icon={FileDown} onClick={handleDownloadSampleCsv}>
              TEMPLATE
            </Button>
          </div>

          <div>
            <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">
              PASTE CSV CONTENT OR RAW STREAM
            </label>
            <textarea
              rows={6}
              placeholder={`Roll Number, Internal Marks, External Marks, isAbsent\n24CS001, 26, 62, false\n24CS002, 28, 65, false`}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full p-3 bg-[#080C14] border border-cyan-500/30 rounded-lg text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {/* Validation Report Banner */}
          {validationReport && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3.5 rounded-lg border ${
                validationReport.errorCount > 0
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                  : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs flex items-center gap-2">
                  {validationReport.errorCount > 0 ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  SCAN COMPLETE: {validationReport.validCount} Valid, {validationReport.errorCount} Errors
                </span>

                {validationReport.errorCount > 0 && (
                  <Button size="sm" variant="danger" icon={Download} onClick={handleDownloadErrorReport}>
                    ERROR REPORT
                  </Button>
                )}
              </div>

              {validationReport.errors?.length > 0 && (
                <div className="mt-2 max-h-36 overflow-y-auto space-y-1 text-[11px] font-mono bg-[#080C14]/90 p-2 rounded border border-slate-800">
                  {validationReport.errors.map((err, i) => (
                    <div key={i} className="text-rose-400 flex items-start gap-1.5">
                      <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        Row {err.row} ({err.rollNumber}): {err.error}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          <div className="flex justify-between items-center pt-3 border-t border-cyan-500/20">
            <Button
              variant="outline"
              onClick={() => handleValidateCsv(false)}
              loading={uploading}
            >
              VERIFY DATASET
            </Button>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsCsvModalOpen(false)}>
                CANCEL
              </Button>
              <Button
                variant="primary"
                onClick={() => handleValidateCsv(true)}
                loading={uploading}
                disabled={currentExam?.isMarksEntryLocked}
              >
                COMMIT RECORDS
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
