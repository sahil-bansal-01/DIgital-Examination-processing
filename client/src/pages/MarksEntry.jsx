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
  const [marksData, setMarksData] = useState({}); // rollNumber -> { internalMarks, externalMarks, isAbsent }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // CSV Modal
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [validationReport, setValidationReport] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Selected Exam object for lock status
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
      // If teacher, filter by assigned subjects
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
      // Fetch students for section
      const stdRes = await api.get(`/academic/students?section=${selectedSection}`);
      const studentsList = stdRes.students || [];
      setStudents(studentsList);

      // Fetch existing marks
      const marksRes = await api.get(
        `/marks?examId=${selectedExamId}&subjectId=${selectedSubjectId}&section=${selectedSection}`
      );
      const markMap = {};

      // Seed with student blanks
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

      // Populate saved marks
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
      toast.error('Cannot save marks: This exam is locked by the Exam Cell.');
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
        toast.success(`Successfully saved marks for ${res.count} students!`);
        fetchMarksSheet();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  // CSV Validation & Import
  const handleValidateCsv = async (commit = false) => {
    if (!csvText.trim()) {
      toast.error('Please paste or upload CSV content');
      return;
    }

    setUploading(true);
    try {
      // Parse CSV text into rows
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) throw new Error('CSV must have a header line and at least one data row');

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
        toast.success(`Imported ${res.savedCount} valid student mark records into the database!`);
        setIsCsvModalOpen(false);
        setCsvText('');
        fetchMarksSheet();
      } else if (!commit) {
        toast.info(`Validation complete: ${res.validCount} valid, ${res.errorCount} errors flagged.`);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Marks Entry & Evaluation Grid</h1>
          <p className="text-xs text-slate-400 mt-1">
            Spreadsheet-style marks entry with boundary enforcement, CSV validation engine, and full audit trail.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" icon={Upload} onClick={() => setIsCsvModalOpen(true)}>
            Upload CSV / Excel
          </Button>

          <Button
            variant="gradient"
            icon={Save}
            loading={saving}
            disabled={currentExam?.isMarksEntryLocked}
            onClick={handleSaveGrid}
          >
            Save All Marks
          </Button>
        </div>
      </div>

      {/* Lock Status Banner */}
      {currentExam?.isMarksEntryLocked && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300">
          <Lock className="w-5 h-5 text-rose-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Marks Entry is Currently Locked:</span> The Exam Cell has locked this examination.
            All cells are in read-only mode until an administrator re-enables submission.
          </div>
        </div>
      )}

      {/* Filter / Selector Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
        {/* Exam Select */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Examination
          </label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            {exams.map((ex) => (
              <option key={ex._id} value={ex._id}>
                {ex.title} ({ex.status})
              </option>
            ))}
          </select>
        </div>

        {/* Subject Select */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Subject Offering
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
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
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Section Cohort
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
        </div>

        {/* Search Input */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Candidate Filter
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search candidate or roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Spreadsheet Editable Grid */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">
              {currentSubject?.code || 'Subject'} - {currentSubject?.name || ''}
            </span>
            <span className="text-slate-500">•</span>
            <span>Max Internal: <strong className="text-white font-mono">{currentSubject?.maxInternalMarks || 30}</strong></span>
            <span className="text-slate-500">•</span>
            <span>Max External: <strong className="text-white font-mono">{currentSubject?.maxExternalMarks || 70}</strong></span>
            <span className="text-slate-500">•</span>
            <span>Total Max: <strong className="text-cyan-400 font-mono">100</strong></span>
          </div>

          <div className="font-mono">
            Showing {filteredStudents.length} of {students.length} Candidates
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs text-slate-400 font-mono uppercase sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-5 py-3 w-16">#</th>
                <th className="px-5 py-3 w-36">Roll Number</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3 text-center w-28">Status</th>
                <th className="px-5 py-3 w-40">Internal ({currentSubject?.maxInternalMarks || 30})</th>
                <th className="px-5 py-3 w-40">External ({currentSubject?.maxExternalMarks || 70})</th>
                <th className="px-5 py-3 w-32 font-bold text-cyan-400">Total (100)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                    Loading Student Roster...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    No students found matching your criteria.
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
                      className={`hover:bg-slate-800/40 transition ${
                        isAbsent ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="px-5 py-2.5 font-mono text-xs text-slate-500">{idx + 1}</td>
                      <td className="px-5 py-2.5 font-mono font-bold text-cyan-400">{std.rollNumber}</td>
                      <td className="px-5 py-2.5 font-medium text-white">{std.name}</td>

                      {/* Absent Toggle Button */}
                      <td className="px-5 py-2.5 text-center">
                        <button
                          type="button"
                          disabled={currentExam?.isMarksEntryLocked}
                          onClick={() => handleToggleAbsent(std.rollNumber)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                            isAbsent
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                        >
                          {isAbsent ? 'ABSENT' : 'PRESENT'}
                        </button>
                      </td>

                      {/* Internal Marks Input */}
                      <td className="px-5 py-2.5">
                        <input
                          type="number"
                          disabled={isAbsent || currentExam?.isMarksEntryLocked}
                          min="0"
                          max={maxInternal}
                          value={m.internalMarks}
                          onChange={(e) => handleCellChange(std.rollNumber, 'internalMarks', e.target.value)}
                          placeholder="0"
                          className={`w-28 px-3 py-1.5 bg-slate-950 rounded-xl text-white font-mono text-sm border focus:outline-none transition ${
                            isInternalInvalid
                              ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-950/30'
                              : 'border-slate-700 focus:border-cyan-500'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        />
                      </td>

                      {/* External Marks Input */}
                      <td className="px-5 py-2.5">
                        <input
                          type="number"
                          disabled={isAbsent || currentExam?.isMarksEntryLocked}
                          min="0"
                          max={maxExternal}
                          value={m.externalMarks}
                          onChange={(e) => handleCellChange(std.rollNumber, 'externalMarks', e.target.value)}
                          placeholder="0"
                          className={`w-28 px-3 py-1.5 bg-slate-950 rounded-xl text-white font-mono text-sm border focus:outline-none transition ${
                            isExternalInvalid
                              ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-950/30'
                              : 'border-slate-700 focus:border-cyan-500'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        />
                      </td>

                      {/* Total Display */}
                      <td className="px-5 py-2.5 font-mono font-bold text-base text-cyan-400">
                        {isAbsent ? (
                          <span className="text-rose-400 text-xs font-semibold">AB</span>
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
        title="Batch Marks Upload & Validation Engine"
        subtitle="Upload or paste CSV student marks for automated rule-checking and error discovery"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            <span>
              Expected format: <strong className="text-white font-mono">Roll Number, Internal Marks, External Marks, isAbsent</strong>
            </span>
            <Button size="sm" variant="ghost" icon={FileDown} onClick={handleDownloadSampleCsv}>
              Download Template
            </Button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Paste CSV Content or Upload File
            </label>
            <textarea
              rows={7}
              placeholder={`Roll Number, Internal Marks, External Marks, isAbsent\n24CS001, 26, 62, false\n24CS002, 28, 65, false`}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Validation Report Banner */}
          {validationReport && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border ${
                validationReport.errorCount > 0
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm flex items-center gap-2">
                  {validationReport.errorCount > 0 ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  Validation Summary: {validationReport.validCount} Valid Records, {validationReport.errorCount} Errors
                </span>

                {validationReport.errorCount > 0 && (
                  <Button size="sm" variant="danger" icon={Download} onClick={handleDownloadErrorReport}>
                    Download Error Report
                  </Button>
                )}
              </div>

              {validationReport.errors?.length > 0 && (
                <div className="mt-3 max-h-40 overflow-y-auto space-y-1.5 text-xs font-mono bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                  {validationReport.errors.map((err, i) => (
                    <div key={i} className="text-rose-400 flex items-start gap-2">
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

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <Button
              variant="outline"
              onClick={() => handleValidateCsv(false)}
              loading={uploading}
            >
              Verify & Check Errors
            </Button>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setIsCsvModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="gradient"
                onClick={() => handleValidateCsv(true)}
                loading={uploading}
                disabled={currentExam?.isMarksEntryLocked}
              >
                Commit Valid Records
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
