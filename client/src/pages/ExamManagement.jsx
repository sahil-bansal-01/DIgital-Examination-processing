import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Plus,
  Lock,
  Unlock,
  Play,
  CheckCircle2,
  Clock,
  Cpu,
  BarChart,
  FileSpreadsheet,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const ExamManagement = () => {
  const toast = useToast();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    type: 'end-term',
    department: 'CSE',
    semester: 3,
    academicYear: '2025-2026',
    startDate: '',
  });

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await api.get('/exams');
      if (res.success) {
        setExams(res.exams || []);
      }
    } catch (err) {
      toast.error('Failed to load exams: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/exams', form);
      if (res.success) {
        toast.success(`Exam "${res.exam.title}" created successfully`);
        setIsCreateModalOpen(false);
        fetchExams();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStatusChange = async (examId, newStatus) => {
    try {
      const res = await api.patch(`/exams/${examId}/status`, { status: newStatus });
      if (res.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchExams();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleLock = async (examId) => {
    try {
      const res = await api.patch(`/exams/${examId}/toggle-lock`, {});
      if (res.success) {
        toast.info(res.message);
        fetchExams();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'slate';
      case 'Marks Entry':
        return 'amber';
      case 'Processing':
        return 'indigo';
      case 'Published':
        return 'emerald';
      default:
        return 'cyan';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">University Examination Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervise examination lifecycles, configure entry windows, and enforce security locks.
          </p>
        </div>

        <Button variant="gradient" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
          Create Examination
        </Button>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.map((exam) => (
          <div
            key={exam._id}
            className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-5"
          >
            <div>
              {/* Status Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(exam.status)}>
                    {exam.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs font-mono uppercase text-slate-400">
                    {exam.type}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleLock(exam._id)}
                  title={exam.isMarksEntryLocked ? 'Marks Entry is Locked' : 'Marks Entry is Open'}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition border ${
                    exam.isMarksEntryLocked
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  }`}
                >
                  {exam.isMarksEntryLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{exam.isMarksEntryLocked ? 'Entry Locked' : 'Entry Open'}</span>
                </button>
              </div>

              {/* Title & Metadata */}
              <h3 className="text-lg font-bold text-white tracking-tight">{exam.title}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Dept of {exam.department} • Semester {exam.semester} • Session {exam.academicYear}
              </p>

              {/* Subjects Covered */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Evaluated Subjects ({exam.subjects?.length || 0}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {exam.subjects?.map((sub) => (
                    <span
                      key={sub._id || sub}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 text-[11px] font-mono text-cyan-300 font-semibold"
                    >
                      {sub.code || sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Lifecycle Controls & Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              {/* Status Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Stage:</span>
                <select
                  value={exam.status}
                  onChange={(e) => handleStatusChange(exam._id, e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Marks Entry">Marks Entry</option>
                  <option value="Processing">Processing</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Link to={`/marks?examId=${exam._id}`}>
                  <Button size="sm" variant="outline" icon={FileSpreadsheet}>
                    Marks
                  </Button>
                </Link>

                <Link to={`/processing?examId=${exam._id}`}>
                  <Button size="sm" variant="gradient" icon={Cpu}>
                    Process Results
                  </Button>
                </Link>

                {exam.status === 'Published' && (
                  <Link to={`/results?examId=${exam._id}`}>
                    <Button size="sm" variant="secondary" icon={BarChart}>
                      Reports
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE EXAM MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule University Examination"
        subtitle="Establish evaluation title, academic term, department, and participating subjects"
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Examination Title
            </label>
            <input
              type="text"
              placeholder="e.g. Semester 3 End-Term Examinations 2025-26"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none"
              >
                <option value="end-term">End-Term Regular</option>
                <option value="mid-term">Mid-Term Sessional</option>
                <option value="re-exam">Re-Examination / Backlog</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Department</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none"
              >
                <option value="CSE">Computer Science & Engineering</option>
                <option value="ECE">Electronics & Communication</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Semester</label>
              <input
                type="number"
                min="1"
                max="8"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Academic Year</label>
              <input
                type="text"
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              Create Examination
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
