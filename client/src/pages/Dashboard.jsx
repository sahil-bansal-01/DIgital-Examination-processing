import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Cpu,
  TrendingUp,
  AlertCircle,
  FileCheck,
  ArrowRight,
  Clock,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export const Dashboard = () => {
  const { user, isAdmin, isTeacher, isStudent } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={isAdmin ? 'rose' : isTeacher ? 'indigo' : 'emerald'}>
                {user?.role?.toUpperCase()} WORKSPACE
              </Badge>
              <span className="text-xs font-mono text-slate-400">
                Semester 3 | Academic Year 2025-26
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome, {user?.name}
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              {isAdmin && 'Exam Cell Command Center: Monitor multi-core result runs, academic schemas, and student records.'}
              {isTeacher && 'Faculty Grading Portal: Manage marks entry, view assigned cohorts, and submit validations.'}
              {isStudent && 'Student Academic Hub: View published semester transcripts, SGPA milestones, and grade cards.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link to="/performance-lab">
                <Button variant="gradient" icon={Cpu}>
                  CAPP Performance Lab
                </Button>
              </Link>
            )}
            {isTeacher && (
              <Link to="/marks">
                <Button variant="primary" icon={FileCheck}>
                  Enter Student Marks
                </Button>
              </Link>
            )}
            {isStudent && (
              <Link to="/my-results">
                <Button variant="primary" icon={Award}>
                  View Official Marksheet
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ADMIN DASHBOARD VIEW */}
      {isAdmin && data?.stats && (
        <div className="space-y-8">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Enrolled Students"
              value={data.stats.totalStudents}
              subtext="Undergraduate Candidates"
              icon={Users}
              color="cyan"
              trend={{ text: '100% active', isPositive: true }}
            />
            <StatCard
              title="Faculty Members"
              value={data.stats.totalTeachers}
              subtext="Evaluators & Instructors"
              icon={GraduationCap}
              color="indigo"
            />
            <StatCard
              title="Active Examinations"
              value={data.stats.activeExams}
              subtext={`Out of ${data.stats.totalExams} total exams`}
              icon={CalendarCheck}
              color="amber"
            />
            <StatCard
              title="Processing Engine Runs"
              value={data.stats.processingRunsCount}
              subtext="Sequential & Parallel tests"
              icon={Cpu}
              color="emerald"
              trend={{ text: 'CAPP Enabled', isPositive: true }}
            />
          </div>

          {/* Charts & Recent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pass Percentage Trend Chart */}
            <div className="lg:col-span-8 p-6 rounded-2xl obsidian-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Examination Pass Percentage Trends
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cohort progression across published university examinations
                  </p>
                </div>
                <Badge variant="cyan">Semester 3 Cohorts</Badge>
              </div>

              <div className="h-64 w-full">
                {data.passRateTrends && data.passRateTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.passRateTrends}>
                      <defs>
                        <linearGradient id="passGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                      <XAxis dataKey="examTitle" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} unit="%" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="passPercentage"
                        stroke="#06b6d4"
                        strokeWidth={2.5}
                        fill="url(#passGrad)"
                        name="Pass Rate"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                    No published exam trends yet. Run result processing to generate insights.
                  </div>
                )}
              </div>
            </div>

            {/* Recent Audit Trail Snippet */}
            <div className="lg:col-span-4 p-6 rounded-2xl obsidian-card flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Audit Trail
                </h3>
                <Link to="/audit-logs" className="text-xs text-cyan-400 hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-72 pr-1">
                {data.recentAuditLogs?.map((log) => (
                  <div
                    key={log._id}
                    className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="font-semibold text-slate-200">{log.userName}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 font-mono text-[11px] truncate">{log.action}</p>
                    <p className="text-slate-400 text-[10px] truncate mt-0.5">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TEACHER DASHBOARD VIEW */}
      {isTeacher && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Assigned Subjects"
              value={data?.assignedSubjects?.length || 0}
              subtext="Theory & Laboratory Modules"
              icon={GraduationCap}
              color="indigo"
            />
            <StatCard
              title="Exams in Marks Entry"
              value={data?.openExamsCount || 0}
              subtext="Ready for submission"
              icon={CalendarCheck}
              color="cyan"
            />
            <StatCard
              title="Pending Marks Batches"
              value={data?.pendingSubmissions?.length || 0}
              subtext="Cohorts to verify"
              icon={AlertCircle}
              color="amber"
            />
          </div>

          <div className="p-6 rounded-2xl obsidian-card">
            <h3 className="text-base font-bold text-white mb-4">Assigned Course Offerings & Status</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/60 text-xs text-slate-400 uppercase font-mono">
                  <tr>
                    <th className="px-4 py-3">Subject Code</th>
                    <th className="px-4 py-3">Subject Name</th>
                    <th className="px-4 py-3">Section</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data?.assignedSubjects?.map((asgn, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-mono font-bold text-cyan-400">{asgn.subjectCode}</td>
                      <td className="px-4 py-3 font-medium text-white">{asgn.subjectName}</td>
                      <td className="px-4 py-3">
                        <Badge variant="indigo">Section {asgn.section}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/marks?subjectId=${asgn.subjectId}&section=${asgn.section}`}>
                          <Button size="sm" variant="outline">
                            Enter Marks
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT DASHBOARD VIEW */}
      {isStudent && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Cumulative GPA (CGPA)"
              value={data?.cgpa || '0.00'}
              subtext="Across all completed semesters"
              icon={Award}
              color="emerald"
            />
            <StatCard
              title="Latest SGPA"
              value={data?.latestResult?.sgpa || '0.00'}
              subtext={data?.latestResult?.exam?.title || 'Current Semester'}
              icon={TrendingUp}
              color="cyan"
            />
            <StatCard
              title="Active Backlogs"
              value={data?.activeBacklogs || 0}
              subtext={data?.activeBacklogs === 0 ? 'Clear Academic Record' : 'Attention Required'}
              icon={AlertCircle}
              color={data?.activeBacklogs === 0 ? 'emerald' : 'rose'}
            />
          </div>

          {/* Student SGPA Trend Chart */}
          <div className="p-6 rounded-2xl obsidian-card">
            <h3 className="text-base font-bold text-white mb-2">GPA Progression History</h3>
            <p className="text-xs text-slate-400 mb-4">Semester-by-semester academic performance trend</p>
            <div className="h-64 w-full">
              {data?.gpaHistory && data.gpaHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.gpaHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="semester" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    />
                    <Bar dataKey="sgpa" fill="#06b6d4" radius={[8, 8, 0, 0]} name="SGPA" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                  Results for the current semester are being processed.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
