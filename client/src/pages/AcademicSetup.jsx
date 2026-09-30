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
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const AcademicSetup = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('subjects'); // 'departments', 'courses', 'sections', 'subjects', 'teachers', 'grading'
  
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
    { id: 'subjects', label: 'Subjects & Credits', icon: BookOpen },
    { id: 'teachers', label: 'Faculty Assignments', icon: GraduationCap },
    { id: 'grading', label: 'Grading Scheme & Rules', icon: Sliders },
    { id: 'departments', label: 'Departments & Sections', icon: Layers },
    { id: 'students', label: 'Enrolled Candidates', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Academic Setup & Schemas</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure curriculum parameters, credit weightings, faculty assignments, and grading thresholds.
          </p>
        </div>

        {activeTab === 'subjects' && (
          <Button variant="gradient" icon={Plus} onClick={() => setIsSubModalOpen(true)}>
            Add Subject
          </Button>
        )}
        {activeTab === 'departments' && (
          <Button variant="gradient" icon={Plus} onClick={() => setIsDeptModalOpen(true)}>
            Add Department
          </Button>
        )}
        {activeTab === 'teachers' && (
          <Button variant="gradient" icon={Plus} onClick={() => setIsAssignModalOpen(true)}>
            Assign Subject
          </Button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SUBJECTS */}
      {activeTab === 'subjects' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs text-slate-400 uppercase font-mono">
                <tr>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Subject Name</th>
                  <th className="px-5 py-3.5">Dept</th>
                  <th className="px-5 py-3.5">Sem</th>
                  <th className="px-5 py-3.5">Credits</th>
                  <th className="px-5 py-3.5">Max Internal</th>
                  <th className="px-5 py-3.5">Max External</th>
                  <th className="px-5 py-3.5">Pass %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {subjects.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-cyan-400">{sub.code}</td>
                    <td className="px-5 py-3.5 font-medium text-white">{sub.name}</td>
                    <td className="px-5 py-3.5">{sub.department}</td>
                    <td className="px-5 py-3.5 font-mono">Sem {sub.semester}</td>
                    <td className="px-5 py-3.5 font-bold font-mono text-indigo-400">{sub.credits}</td>
                    <td className="px-5 py-3.5 font-mono">{sub.maxInternalMarks}</td>
                    <td className="px-5 py-3.5 font-mono">{sub.maxExternalMarks}</td>
                    <td className="px-5 py-3.5 font-mono">{sub.passingPercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FACULTY ASSIGNMENTS */}
      {activeTab === 'teachers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teachers.map((t) => (
            <div
              key={t._id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{t.name}</h3>
                  <p className="text-xs text-slate-400">{t.designation} • {t.department}</p>
                  <p className="text-xs font-mono text-cyan-400 mt-0.5">{t.email}</p>
                </div>
                <Badge variant="indigo">{t.employeeId || 'FACULTY'}</Badge>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Assigned Teaching Modules:
                </p>
                {t.assignedSubjects?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {t.assignedSubjects.map((asgn, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5"
                      >
                        <span className="font-mono font-bold text-cyan-400">{asgn.subjectCode}</span>
                        <span className="text-slate-400">({asgn.subjectName})</span>
                        <Badge size="xs" variant="cyan">Sec {asgn.section}</Badge>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No assigned subjects yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: GRADING SCHEME & RULES */}
      {activeTab === 'grading' && gradingScheme && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Grading Scale & Boundary Parameters</h3>
                <p className="text-xs text-slate-400">
                  Relative/absolute letter grade boundaries, grade points (10-point scale), and grace mark rules.
                </p>
              </div>
              <Button variant="primary" icon={Save} onClick={handleSaveGrading}>
                Save Changes
              </Button>
            </div>

            {/* Grace Marks & Pass Criteria Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Max Grace Marks Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={gradingScheme.maxGraceMarks}
                  onChange={(e) =>
                    setGradingScheme({ ...gradingScheme, maxGraceMarks: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Automatically awarded if student is within N marks of passing
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Subject Pass Threshold (%)
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
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Minimum percentage required in each individual subject
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Overall Aggregate Pass (%)
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
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Minimum aggregate percentage across all semester subjects
                </span>
              </div>
            </div>

            {/* Boundaries Table */}
            <div>
              <h4 className="text-sm font-bold text-white mb-3">Letter Grade Scale Boundaries</h4>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/60 text-xs text-slate-400 font-mono uppercase">
                    <tr>
                      <th className="px-4 py-3">Grade</th>
                      <th className="px-4 py-3">Classification Label</th>
                      <th className="px-4 py-3">Minimum % Cutoff</th>
                      <th className="px-4 py-3">Grade Point</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {gradingScheme.boundaries?.map((b, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="px-4 py-2.5 font-bold font-mono text-cyan-400 text-base">
                          {b.grade}
                        </td>
                        <td className="px-4 py-2.5 text-white font-medium">{b.label}</td>
                        <td className="px-4 py-2.5">
                          <input
                            type="number"
                            value={b.minPercentage}
                            onChange={(e) => {
                              const newBoundaries = [...gradingScheme.boundaries];
                              newBoundaries[idx].minPercentage = Number(e.target.value);
                              setGradingScheme({ ...gradingScheme, boundaries: newBoundaries });
                            }}
                            className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            type="number"
                            step="0.5"
                            value={b.gradePoint}
                            onChange={(e) => {
                              const newBoundaries = [...gradingScheme.boundaries];
                              newBoundaries[idx].gradePoint = Number(e.target.value);
                              setGradingScheme({ ...gradingScheme, boundaries: newBoundaries });
                            }}
                            className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-indigo-400 font-mono text-xs focus:border-cyan-500 focus:outline-none"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Departments */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Academic Departments</h3>
            <div className="space-y-3">
              {departments.map((d) => (
                <div key={d._id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-cyan-400 text-sm">{d.code}</span>
                    <p className="text-xs text-white font-medium">{d.name}</p>
                    <p className="text-[11px] text-slate-400">{d.description}</p>
                  </div>
                  <Badge variant="cyan">Active</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Configured Class Sections</h3>
            <div className="space-y-3">
              {sections.map((s) => (
                <div key={s._id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-sm">
                      Section {s.name} ({s.department})
                    </span>
                    <p className="text-xs text-slate-400">
                      Semester {s.semester} • Academic Year {s.academicYear}
                    </p>
                  </div>
                  <Badge variant="indigo">Capacity: {s.capacity}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STUDENTS */}
      {activeTab === 'students' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-sm font-bold text-white">
              Enrolled Student Roster ({students.length} Candidates)
            </span>
            <Badge variant="emerald">Batch 2024-2028</Badge>
          </div>
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs text-slate-400 font-mono uppercase sticky top-0">
                <tr>
                  <th className="px-5 py-3">Roll Number</th>
                  <th className="px-5 py-3">Student Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Dept</th>
                  <th className="px-5 py-3">Semester</th>
                  <th className="px-5 py-3">Section</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {students.map((std) => (
                  <tr key={std._id} className="hover:bg-slate-800/30">
                    <td className="px-5 py-3 font-mono font-bold text-cyan-400">{std.rollNumber}</td>
                    <td className="px-5 py-3 font-medium text-white">{std.name}</td>
                    <td className="px-5 py-3 text-xs text-slate-400 font-mono">{std.email}</td>
                    <td className="px-5 py-3">{std.department}</td>
                    <td className="px-5 py-3 font-mono">Sem {std.semester}</td>
                    <td className="px-5 py-3">
                      <Badge variant="indigo">Section {std.section}</Badge>
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
        title="Add Curriculum Subject"
        subtitle="Define course code, credits, passing threshold, and evaluation weights"
      >
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Subject Code</label>
              <input
                type="text"
                placeholder="e.g. CS307"
                value={subForm.code}
                onChange={(e) => setSubForm({ ...subForm, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Credits</label>
              <input
                type="number"
                min="1"
                max="8"
                value={subForm.credits}
                onChange={(e) => setSubForm({ ...subForm, credits: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Subject Name</label>
            <input
              type="text"
              placeholder="e.g. Cloud Computing & Distributed Systems"
              value={subForm.name}
              onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Max Internal</label>
              <input
                type="number"
                value={subForm.maxInternalMarks}
                onChange={(e) => setSubForm({ ...subForm, maxInternalMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Max External</label>
              <input
                type="number"
                value={subForm.maxExternalMarks}
                onChange={(e) => setSubForm({ ...subForm, maxExternalMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Pass %</label>
              <input
                type="number"
                value={subForm.passingPercentage}
                onChange={(e) => setSubForm({ ...subForm, passingPercentage: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsSubModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient">Create Subject</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ASSIGN TEACHER */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Faculty Evaluator"
        subtitle="Grant marks entry and review privileges for a subject and section cohort"
      >
        <form onSubmit={handleAssignTeacher} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Select Faculty</label>
            <select
              value={assignForm.teacherId}
              onChange={(e) => setAssignForm({ ...assignForm, teacherId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none"
              required
            >
              <option value="">-- Choose Instructor --</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Subject Offering</label>
            <select
              value={assignForm.subjectId}
              onChange={(e) => setAssignForm({ ...assignForm, subjectId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none"
              required
            >
              <option value="">-- Choose Subject --</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Section Cohort</label>
            <select
              value={assignForm.section}
              onChange={(e) => setAssignForm({ ...assignForm, section: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient">Save Assignment</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD DEPARTMENT */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="Register Academic Department"
        subtitle="Create an organizational unit for courses, subjects, and candidate tracks"
      >
        <form onSubmit={handleCreateDept} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Department Code</label>
            <input
              type="text"
              placeholder="e.g. MECH"
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Department Name</label>
            <input
              type="text"
              placeholder="e.g. Mechanical Engineering"
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsDeptModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient">Create Department</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
