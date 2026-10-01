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
  Crosshair,
  Terminal,
  ShieldCheck
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
        return 'cyan';
      case 'Published':
        return 'emerald';
      default:
        return 'cyan';
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" />
              EXAMINATION PROTOCOLS // [03]
            </span>
            <Badge variant="cyan">SECURITY ENFORCED</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
            EXAMINATION LIFECYCLE MANAGEMENT
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans max-w-2xl">
            Supervise evaluation lifecycles, configure entry windows, and enforce cryptographic security locks.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
          NEW PROTOCOL
        </Button>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.map((exam) => (
          <div
            key={exam._id}
            className="p-5 sm:p-6 rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-2xl backdrop-blur-xl flex flex-col justify-between space-y-5 tech-corners"
          >
            <div>
              {/* Status Header */}
              <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(exam.status)}>
                    {exam.status.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] uppercase text-cyan-400/80">
                    TYPE: {exam.type}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleLock(exam._id)}
                  title={exam.isMarksEntryLocked ? 'Marks Entry is Locked' : 'Marks Entry is Open'}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                    exam.isMarksEntryLocked
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/40 hover:bg-rose-500/25 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  }`}
                >
                  {exam.isMarksEntryLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{exam.isMarksEntryLocked ? 'LOCKED' : 'UNLOCKED'}</span>
                </button>
              </div>

              {/* Title & Metadata */}
              <h3 className="text-base font-extrabold text-white tracking-wide uppercase">{exam.title}</h3>
              <p className="text-[11px] text-slate-400 mt-1 font-sans">
                Dept of {exam.department} • Semester {exam.semester} • Session {exam.academicYear}
              </p>

              {/* Subjects Covered */}
              <div className="mt-4 pt-3 border-t border-cyan-500/20">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2">
                  EVALUATED SUBJECT NODES ({exam.subjects?.length || 0}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {exam.subjects?.map((sub) => (
                    <span
                      key={sub._id || sub}
                      className="px-2 py-0.5 rounded bg-[#080C14] border border-cyan-500/30 text-[10px] text-cyan-300 font-bold"
                    >
                      {sub.code || sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Lifecycle Controls & Actions */}
            <div className="pt-4 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
              {/* Status Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 uppercase">STAGE:</span>
                <select
                  value={exam.status}
                  onChange={(e) => handleStatusChange(exam._id, e.target.value)}
                  className="px-2.5 py-1 bg-[#080C14] border border-cyan-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 transition"
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
                    MARKS
                  </Button>
                </Link>

                <Link to={`/processing?examId=${exam._id}`}>
                  <Button size="sm" variant="primary" icon={Cpu}>
                    PROCESS
                  </Button>
                </Link>

                {exam.status === 'Published' && (
                  <Link to={`/results?examId=${exam._id}`}>
                    <Button size="sm" variant="secondary" icon={BarChart}>
                      REPORTS
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
        title="SCHEDULE EXAMINATION PROTOCOL"
        subtitle="Establish evaluation title, academic term, department, and participating subjects"
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div>
            <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">
              EXAMINATION TITLE
            </label>
            <input
              type="text"
              placeholder="e.g. Semester 3 End-Term Examinations 2025-26"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 bg-[#080C14] border border-cyan-500/30 rounded-lg text-white text-xs focus:border-cyan-400 focus:outline-none transition"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">TYPE</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 bg-[#080C14] border border-cyan-500/30 rounded-lg text-white text-xs focus:border-cyan-400 focus:outline-none transition"
              >
                <option value="end-term">End-Term Regular</option>
                <option value="mid-term">Mid-Term Sessional</option>
                <option value="re-exam">Re-Examination / Backlog</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">DEPARTMENT</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 bg-[#080C14] border border-cyan-500/30 rounded-lg text-white text-xs focus:border-cyan-400 focus:outline-none transition"
              >
                <option value="CSE">Computer Science & Engineering</option>
                <option value="ECE">Electronics & Communication</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">SEMESTER</label>
              <input
                type="number"
                min="1"
                max="8"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#080C14] border border-cyan-500/30 rounded-lg text-white text-xs focus:border-cyan-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">ACADEMIC YEAR</label>
              <input
                type="text"
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                className="w-full px-3 py-2 bg-[#080C14] border border-cyan-500/30 rounded-lg text-white text-xs focus:border-cyan-400 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-cyan-500/20">
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              CANCEL
            </Button>
            <Button type="submit" variant="primary">
              INITIALISE PROTOCOL
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
