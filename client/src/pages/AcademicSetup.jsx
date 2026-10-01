import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  Layers,
  Users,
  Sliders,
  Plus,
  Trash2,
  CheckCircle,
  Save,
  HelpCircle,
  Crosshair,
  Terminal,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const AcademicSetup = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('subjects');
  
  // Data States
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [gradingScheme, setGradingScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Form States
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' });
  const [subForm, setSubForm] = useState({
    code: '',
    name: '',
    department: 'CSE',
    semester: 3,
    credits: 4,
    maxInternalMarks: 30,
    maxExternalMarks: 70,
    passingPercentage: 40,
  });
  const [assignForm, setAssignForm] = useState({
    teacherId: '',
    subjectId: '',
    section: 'A',
    semester: 3,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, crsRes, secRes, subRes, tchRes, grdRes, stdRes] = await Promise.all([
        api.get('/academic/departments'),
        api.get('/academic/courses'),
        api.get('/academic/sections'),
        api.get('/academic/subjects'),
        api.get('/academic/teachers'),
        api.get('/academic/grading-scheme'),
        api.get('/academic/students'),
      ]);

      if (deptRes.success) setDepartments(deptRes.departments || []);
      if (crsRes.success) setCourses(crsRes.courses || []);
      if (secRes.success) setSections(secRes.sections || []);
      if (subRes.success) setSubjects(subRes.subjects || []);
      if (tchRes.success) setTeachers(tchRes.teachers || []);
      if (grdRes.success) setGradingScheme(grdRes.gradingScheme);
      if (stdRes.success) setStudents(stdRes.students || []);
    } catch (err) {
      toast.error('Failed to load academic setup: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDept = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/academic/departments', deptForm);
      if (res.success) {
        toast.success(`Department ${deptForm.code} added`);
        setIsDeptModalOpen(false);
        setDeptForm({ name: '', code: '', description: '' });
        fetchData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/academic/subjects', subForm);
      if (res.success) {
        toast.success(`Subject ${subForm.code} created`);
        setIsSubModalOpen(false);
        setSubForm({
          code: '',
          name: '',
          department: 'CSE',
          semester: 3,
          credits: 4,
          maxInternalMarks: 30,
          maxExternalMarks: 70,
          passingPercentage: 40,
        });
        fetchData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/academic/teachers/assign', assignForm);
      if (res.success) {
        toast.success('Faculty assigned successfully');
        setIsAssignModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSaveGrading = async () => {
    try {
      const res = await api.put('/academic/grading-scheme', gradingScheme);
      if (res.success) {
        toast.success('Grading scheme & criteria saved');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const tabs = [
    { id: 'subjects', label: 'Subjects & Credits', code: '01', icon: BookOpen },
    { id: 'teachers', label: 'Faculty Assignments', code: '02', icon: GraduationCap },
    { id: 'grading', label: 'Grading Rules Matrix', code: '03', icon: Sliders },
    { id: 'departments', label: 'Departments & Sections', code: '04', icon: Layers },
    { id: 'students', label: 'Candidate Roster', code: '05', icon: Users },
  ];

  return (
    <div className="space-y-6 font-mono">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" />
              CURRICULUM ARCHITECTURE // [02]
            </span>
            <Badge variant="cyan">SCHEMA REGISTRY</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
            ACADEMIC CONFIGURATION & SCHEMAS
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans max-w-2xl">
            Configure curriculum parameters, credit weightings, faculty assignments, and grading thresholds.
          </p>
        </div>

        {activeTab === 'subjects' && (
          <Button variant="primary" icon={Plus} onClick={() => setIsSubModalOpen(true)}>
            NEW SUBJECT
          </Button>
        )}
        {activeTab === 'departments' && (
          <Button variant="primary" icon={Plus} onClick={() => setIsDeptModalOpen(true)}>
            NEW DEPARTMENT
          </Button>
        )}
        {activeTab === 'teachers' && (
          <Button variant="primary" icon={Plus} onClick={() => setIsAssignModalOpen(true)}>
            ASSIGN FACULTY
          </Button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-[#0F172A]/70 border border-cyan-500/30 rounded-xl overflow-x-auto tech-corners">
        {tabs.map((t) => {
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

      {/* TAB 1: SUBJECTS */}
      {activeTab === 'subjects' && (
        <div className="rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 overflow-hidden shadow-2xl backdrop-blur-xl tech-corners">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-[10px] text-slate-400 uppercase tracking-wider border-b border-cyan-500/20">
                <tr>
                  <th className="px-4 py-3">COURSE CODE</th>
                  <th className="px-4 py-3">SUBJECT TITLE</th>
                  <th className="px-4 py-3">DEPT</th>
                  <th className="px-4 py-3">SEMESTER</th>
                  <th className="px-4 py-3">CREDITS</th>
                  <th className="px-4 py-3">INTERNAL</th>
                  <th className="px-4 py-3">EXTERNAL</th>
                  <th className="px-4 py-3">PASS THRESHOLD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {subjects.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-900/40 transition">
                    <td className="px-4 py-3 font-bold text-cyan-400">{sub.code}</td>
                    <td className="px-4 py-3 font-medium text-white">{sub.name}</td>
                    <td className="px-4 py-3">{sub.department}</td>
                    <td className="px-4 py-3">SEM {sub.semester}</td>
                    <td className="px-4 py-3 font-bold text-purple-400">{sub.credits}</td>
                    <td className="px-4 py-3">{sub.maxInternalMarks}</td>
                    <td className="px-4 py-3">{sub.maxExternalMarks}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">{sub.passingPercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FACULTY ASSIGNMENTS */}
      {activeTab === 'teachers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {teachers.map((t) => (
            <div
              key={t._id}
              className="p-5 rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-2xl backdrop-blur-xl space-y-4 tech-corners"
            >
              <div className="flex items-start justify-between pb-3 border-b border-cyan-500/20">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase">{t.name}</h3>
                  <p className="text-xs text-slate-400 font-sans">{t.designation} • {t.department}</p>
                  <p className="text-xs text-cyan-400 mt-0.5">{t.email}</p>
                </div>
                <Badge variant="cyan">{t.employeeId || 'FACULTY'}</Badge>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">
                  ASSIGNED TEACHING MODULES:
                </p>
                {t.assignedSubjects?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {t.assignedSubjects.map((asgn, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-[#080C14] border border-cyan-500/30 text-xs font-medium text-slate-200 flex items-center gap-1.5"
                      >
                        <span className="font-bold text-cyan-400">{asgn.subjectCode}</span>
                        <span className="text-slate-400 font-sans">({asgn.subjectName})</span>
                        <Badge size="xs" variant="purple">SEC {asgn.section}</Badge>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic font-sans">// NO ASSIGNED SUBJECTS LOCATED.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: GRADING SCHEME & RULES */}
      {activeTab === 'grading' && gradingScheme && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-2xl backdrop-blur-xl space-y-5 tech-corners">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  // GRADING SCALE & BOUNDARY PARAMETERS
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Relative/absolute letter grade boundaries, 10-point UGC scale, and automated grace mark thresholds.
                </p>
              </div>
              <Button variant="primary" icon={Save} onClick={handleSaveGrading}>
                COMMIT RULES
              </Button>
            </div>

            {/* Grace Marks & Pass Criteria Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-lg bg-[#080C14]/90 border border-cyan-500/20">
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                  MAX GRACE MARKS THRESHOLD
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={gradingScheme.maxGraceMarks}
                  onChange={(e) =>
                    setGradingScheme({ ...gradingScheme, maxGraceMarks: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 bg-[#030508] border border-cyan-500/30 rounded text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block font-sans">
                  Awarded automatically if candidate is within N marks of passing
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#080C14]/90 border border-cyan-500/20">
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                  SUBJECT PASS THRESHOLD (%)
                </label>
                <input
                  type="number"
                  min="30"
                  max="50"
                  value={gradingScheme.passPercentagePerSubject}
                  onChange={(e) =>
                    setGradingScheme({
                      ...gradingScheme,
                      passPercentagePerSubject: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-1.5 bg-[#030508] border border-cyan-500/30 rounded text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block font-sans">
                  Minimum percentage required in individual subject
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#080C14]/90 border border-cyan-500/20">
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                  OVERALL AGGREGATE PASS (%)
                </label>
                <input
                  type="number"
                  min="35"
                  max="50"
                  value={gradingScheme.overallPassPercentage}
                  onChange={(e) =>
                    setGradingScheme({
                      ...gradingScheme,
                      overallPassPercentage: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-1.5 bg-[#030508] border border-cyan-500/30 rounded text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block font-sans">
                  Minimum aggregate percentage across all subjects
                </span>
              </div>
            </div>

            {/* Boundaries Table */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                LETTER GRADE CUTOFF BOUNDARIES
              </h4>
              <div className="overflow-x-auto rounded-lg border border-cyan-500/20">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-[10px] text-slate-400 uppercase border-b border-cyan-500/20">
                    <tr>
                      <th className="px-4 py-2.5">GRADE</th>
                      <th className="px-4 py-2.5">CLASSIFICATION LABEL</th>
                      <th className="px-4 py-2.5">MIN % CUTOFF</th>
                      <th className="px-4 py-2.5">GRADE POINT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {gradingScheme.boundaries?.map((b, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="px-4 py-2 font-bold text-cyan-400 text-sm">
                          {b.grade}
                        </td>
                        <td className="px-4 py-2 text-white font-sans">{b.label}</td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={b.minPercentage}
                            onChange={(e) => {
                              const newBoundaries = [...gradingScheme.boundaries];
                              newBoundaries[idx].minPercentage = Number(e.target.value);
                              setGradingScheme({ ...gradingScheme, boundaries: newBoundaries });
                            }}
                            className="w-20 px-2 py-0.5 bg-[#080C14] border border-cyan-500/30 rounded text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.5"
                            value={b.gradePoint}
                            onChange={(e) => {
                              const newBoundaries = [...gradingScheme.boundaries];
                              newBoundaries[idx].gradePoint = Number(e.target.value);
                              setGradingScheme({ ...gradingScheme, boundaries: newBoundaries });
                            }}
                            className="w-16 px-2 py-0.5 bg-[#080C14] border border-cyan-500/30 rounded text-purple-400 font-mono text-xs focus:border-cyan-400 focus:outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DEPARTMENTS & SECTIONS */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Departments */}
          <div className="p-5 rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-2xl backdrop-blur-xl space-y-4 tech-corners">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              // ACADEMIC DEPARTMENTS
            </h3>
            <div className="space-y-2.5">
              {departments.map((d) => (
                <div key={d._id} className="p-3 rounded-lg bg-[#080C14]/90 border border-cyan-500/20 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-cyan-400 text-xs">{d.code}</span>
                    <p className="text-xs text-white font-medium">{d.name}</p>
                    <p className="text-[10px] text-slate-400 font-sans">{d.description}</p>
                  </div>
                  <Badge variant="cyan">ACTIVE</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="p-5 rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-2xl backdrop-blur-xl space-y-4 tech-corners">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              // COHORT SECTIONS
            </h3>
            <div className="space-y-2.5">
              {sections.map((s) => (
                <div key={s._id} className="p-3 rounded-lg bg-[#080C14]/90 border border-cyan-500/20 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-xs">
                      SECTION {s.name} ({s.department})
                    </span>
                    <p className="text-xs text-slate-400 font-sans">
                      Semester {s.semester} • Academic Year {s.academicYear}
                    </p>
                  </div>
                  <Badge variant="purple">CAPACITY: {s.capacity}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STUDENTS */}
      {activeTab === 'students' && (
        <div className="rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 overflow-hidden shadow-2xl backdrop-blur-xl tech-corners">
          <div className="p-3.5 border-b border-cyan-500/20 flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase">
              // ENROLLED CANDIDATE ROSTER ({students.length} CANDIDATES)
            </span>
            <Badge variant="emerald">BATCH 2024-2028</Badge>
          </div>
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-[10px] text-slate-400 uppercase tracking-wider sticky top-0 border-b border-cyan-500/20">
                <tr>
                  <th className="px-4 py-2.5">ROLL NUMBER</th>
                  <th className="px-4 py-2.5">CANDIDATE NAME</th>
                  <th className="px-4 py-2.5">EMAIL</th>
                  <th className="px-4 py-2.5">DEPT</th>
                  <th className="px-4 py-2.5">SEMESTER</th>
                  <th className="px-4 py-2.5">SECTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.map((std) => (
                  <tr key={std._id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-2 font-bold text-cyan-400">{std.rollNumber}</td>
                    <td className="px-4 py-2 font-medium text-white font-sans">{std.name}</td>
                    <td className="px-4 py-2 text-slate-400">{std.email}</td>
                    <td className="px-4 py-2">{std.department}</td>
                    <td className="px-4 py-2">SEM {std.semester}</td>
                    <td className="px-4 py-2">
                      <Badge variant="purple">SEC {std.section}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUBJECT */}
      <Modal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        title="ADD CURRICULUM SUBJECT"
        subtitle="Define course code, credits, passing threshold, and evaluation weights"
      >
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">COURSE CODE</label>
              <input
                type="text"
                placeholder="e.g. CS307"
                value={subForm.code}
                onChange={(e) => setSubForm({ ...subForm, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-1.5 bg-[#080C14] border border-cyan-500/30 rounded text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">CREDITS</label>
              <input
                type="number"
                min="1"
                max="8"
                value={subForm.credits}
                onChange={(e) => setSubForm({ ...subForm, credits: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-[#080C14] border border-cyan-500/30 rounded text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">SUBJECT TITLE</label>
            <input
              type="text"
              placeholder="e.g. Cloud Computing & Distributed Systems"
              value={subForm.name}
              onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
              className="w-full px-3 py-1.5 bg-[#080C14] border border-cyan-500/30 rounded text-white text-xs focus:border-cyan-400 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">MAX INTERNAL</label>
              <input
                type="number"
                value={subForm.maxInternalMarks}
                onChange={(e) => setSubForm({ ...subForm, maxInternalMarks: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-[#080C14] border border-cyan-500/30 rounded text-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">MAX EXTERNAL</label>
              <input
                type="number"
                value={subForm.maxExternalMarks}
                onChange={(e) => setSubForm({ ...subForm, maxExternalMarks: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-[#080C14] border border-cyan-500/30 rounded text-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">PASS %</label>
              <input
                type="number"
                value={subForm.passingPercentage}
                onChange={(e) => setSubForm({ ...subForm, passingPercentage: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-[#080C14] border border-cyan-500/30 rounded text-white font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-cyan-500/20">
            <Button variant="ghost" onClick={() => setIsSubModalOpen(false)}>CANCEL</Button>
            <Button type="submit" variant="primary">INITIALISE SUBJECT</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ASSIGN TEACHER */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="ASSIGN FACULTY EVALUATOR"
        subtitle="Grant marks entry and review privileges for a subject and section cohort"
      >
        <form onSubmit={handleAssignTeacher} className="space-y-4">
          <div>
            <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">FACULTY EVALUATOR</label>
            <select
              value={assignForm.teacherId}
              onChange={(e) => setAssignForm({ ...assignForm, teacherId: e.target.value })}
              className="w-full px-3 py-1.5 bg-[#080C14] border border-cyan-500/30 rounded text-white text-xs focus:border-cyan-400 focus:outline-none"
              required
            >
              <option value="">SELECT FACULTY MEMBER</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">SUBJECT MODULE</label>
            <select
              value={assignForm.subjectId}
              onChange={(e) => setAssignForm({ ...assignForm, subjectId: e.target.value })}
              className="w-full px-3 py-1.5 bg-[#080C14] border border-cyan-500/30 rounded text-white text-xs focus:border-cyan-400 focus:outline-none"
              required
            >
              <option value="">SELECT SUBJECT</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">COHORT SECTION</label>
            <select
              value={assignForm.section}
              onChange={(e) => setAssignForm({ ...assignForm, section: e.target.value })}
              className="w-full px-3 py-1.5 bg-[#080C14] border border-cyan-500/30 rounded text-white text-xs focus:border-cyan-400 focus:outline-none"
            >
              <option value="A">SECTION A</option>
              <option value="B">SECTION B</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-cyan-500/20">
            <Button variant="ghost" onClick={() => setIsAssignModalOpen(false)}>CANCEL</Button>
            <Button type="submit" variant="primary">COMMIT ASSIGNMENT</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD DEPARTMENT */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="ADD ACADEMIC DEPARTMENT"
        subtitle="Establish department code, name, and administrative description"
      >
        <form onSubmit={handleCreateDept} className="space-y-4">
          <div>
            <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">DEPARTMENT CODE</label>
            <input
              type="text"
              placeholder="e.g. AI-DS"
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-1.5 bg-[#080C14] border border-cyan-500/30 rounded text-white font-mono text-xs focus:border-cyan-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">DEPARTMENT NAME</label>
            <input
              type="text"
              placeholder="e.g. Artificial Intelligence & Data Science"
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              className="w-full px-3 py-1.5 bg-[#080C14] border border-cyan-500/30 rounded text-white text-xs focus:border-cyan-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">DESCRIPTION</label>
            <textarea
              rows={3}
              placeholder="Curriculum overview..."
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
              className="w-full p-2 bg-[#080C14] border border-cyan-500/30 rounded text-white text-xs focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-cyan-500/20">
            <Button variant="ghost" onClick={() => setIsDeptModalOpen(false)}>CANCEL</Button>
            <Button type="submit" variant="primary">CREATE DEPARTMENT</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
