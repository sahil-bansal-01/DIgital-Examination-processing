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
  Crosshair,
  Activity,
  Radio,
  Layers,
  Sparkles
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
    <div className="space-y-6">
      {/* 1. Futuristic Command Center Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl p-5 sm:p-7 bg-[#0F172A]/70 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_0_35px_rgba(0,0,0,0.8)] tech-corners">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Crosshair className="w-36 h-36 text-cyan-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-[10px] text-cyan-300 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {user?.role?.toUpperCase()} // TERMINAL ACTIVE
              </span>
              <span className="text-[11px] text-slate-500">
                SYS.CYCLE: SEMESTER 3 / 2025-26
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
              COMMAND CONSOLE: <span className="text-cyan-400">{user?.name}</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl font-sans">
              {isAdmin && 'High-performance examination processing core. Monitor multi-threaded worker pools, schemas, and live audit telemetry.'}
              {isTeacher && 'Faculty evaluation node. Enter marks with zero-leak client validation, view cohorts, and dispatch grade records.'}
              {isStudent && 'Student academic node. View verified semester transcripts, grade cutoffs, and official marks verification.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link to="/performance-lab">
                <Button variant="gradient" icon={Cpu}>
                  CAPP PERFORMANCE LAB
                </Button>
              </Link>
            )}
            {isTeacher && (
              <Link to="/marks">
                <Button variant="primary" icon={FileCheck}>
                  ENTER MARKS TELEMETRY
                </Button>
              </Link>
            )}
            {isStudent && (
              <Link to="/my-results">
                <Button variant="primary" icon={Award}>
                  OFFICIAL TRANSCRIPT
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. ADMIN DASHBOARD VIEW */}
      {isAdmin && data?.stats && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Enrolled Candidates"
              value={data.stats.totalStudents}
              subtext="Active Academic Records"
              icon={Users}
              color="cyan"
              trend={{ text: '100% Verified', isPositive: true }}
            />
            <StatCard
              title="Faculty Evaluators"
              value={data.stats.totalTeachers}
              subtext="Instructors Assigned"
              icon={GraduationCap}
              color="purple"
            />
            <StatCard
              title="Active Protocols"
              value={data.stats.activeExams}
              subtext={`Out of ${data.stats.totalExams} Total Protocols`}
              icon={CalendarCheck}
              color="amber"
            />
            <StatCard
              title="Parallel Engine Runs"
              value={data.stats.processingRunsCount}
              subtext="CAPP Worker_threads"
              icon={Cpu}
              color="emerald"
              trend={{ text: 'Multi-Core Active', isPositive: true }}
            />
          </div>

          {/* Charts & Recent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pass Percentage Trend Chart */}
            <div className="lg:col-span-8 p-5 sm:p-6 rounded-xl bg-[#0F172A]/60 border border-cyan-500/25 backdrop-blur-xl tech-corners">
              <div className="flex items-center justify-between mb-5 font-mono">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>COHORT PASS RATE TELEMETRY</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    Historical progression across published examination runs
                  </p>
                </div>
                <Badge variant="cyan">SEMESTER 3 COHORT</Badge>
              </div>

              <div className="h-64 w-full">
                {data.passRateTrends && data.passRateTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.passRateTrends}>
                      <defs>
                        <linearGradient id="passGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00F2FE" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#00F2FE" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,242,254,0.1)" />
                      <XAxis dataKey="examTitle" stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" />
                      <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} unit="%" fontFamily="JetBrains Mono" />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#080C14', 
                          borderColor: 'rgba(0,242,254,0.3)', 
                          borderRadius: '8px',
                          fontFamily: 'JetBrains Mono',
                          fontSize: '11px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="passPercentage"
                        stroke="#00F2FE"
                        strokeWidth={2}
                        fill="url(#passGrad)"
                        name="Pass Rate"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
                    // NO PUBLISHED EXAM TRENDS RECORDED. RUN PARALLEL ENGINE TO POPULATE.
                  </div>
                )}
              </div>
            </div>

            {/* Recent Audit Trail Snippet */}
            <div className="lg:col-span-4 p-5 sm:p-6 rounded-xl bg-[#0F172A]/60 border border-cyan-500/25 backdrop-blur-xl flex flex-col tech-corners">
              <div className="flex items-center justify-between mb-4 font-mono">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>AUDIT STREAM</span>
                </h3>
                <Link to="/audit-logs" className="text-xs text-cyan-400 hover:text-cyan-300">
                  VIEW ALL //
                </Link>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-72 pr-1 font-mono">
                {data.recentAuditLogs?.map((log) => (
                  <div
                    key={log._id}
                    className="p-2.5 rounded-lg bg-slate-900/60 border border-cyan-500/15 text-xs hover:border-cyan-500/30 transition"
                  >
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="font-semibold text-cyan-300 text-[11px]">{log.userName}</span>
                      <span className="text-[9px] text-slate-500">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-white font-bold text-[10px] truncate uppercase">{log.action}</p>
                    <p className="text-slate-400 text-[10px] truncate mt-0.5">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TEACHER DASHBOARD VIEW */}
      {isTeacher && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Assigned Subjects"
              value={data?.assignedSubjects?.length || 0}
              subtext="Theory & Lab Modules"
              icon={GraduationCap}
              color="purple"
            />
            <StatCard
              title="Exams in Marks Entry"
              value={data?.openExamsCount || 0}
              subtext="Ready for Telemetry"
              icon={CalendarCheck}
              color="cyan"
            />
            <StatCard
              title="Pending Cohort Batches"
              value={data?.pendingSubmissions?.length || 0}
              subtext="Awaiting Submission"
              icon={AlertCircle}
              color="amber"
            />
          </div>

          <div className="p-5 sm:p-6 rounded-xl bg-[#0F172A]/60 border border-cyan-500/25 backdrop-blur-xl tech-corners">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4">
              // ASSIGNED COURSE OFFERINGS & STATUS
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-[10px] text-slate-400 uppercase tracking-wider border-b border-cyan-500/20">
                  <tr>
                    <th className="px-4 py-3">COURSE CODE</th>
                    <th className="px-4 py-3">COURSE TITLE</th>
                    <th className="px-4 py-3">SECTION</th>
                    <th className="px-4 py-3">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data?.assignedSubjects?.map((asgn, i) => (
                    <tr key={i} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 font-bold text-cyan-400">{asgn.subjectCode}</td>
                      <td className="px-4 py-3 font-medium text-white">{asgn.subjectName}</td>
                      <td className="px-4 py-3">
                        <Badge variant="purple">SECTION {asgn.section}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/marks?subjectId=${asgn.subjectId}&section=${asgn.section}`}>
                          <Button size="sm" variant="outline">
                            ENTER MARKS
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

      {/* 4. STUDENT DASHBOARD VIEW */}
      {isStudent && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Cumulative GPA (CGPA)"
              value={data?.cgpa || '0.00'}
              subtext="Aggregated Performance"
              icon={Award}
              color="emerald"
            />
            <StatCard
              title="Latest SGPA Milestone"
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
          <div className="p-5 sm:p-6 rounded-xl bg-[#0F172A]/60 border border-cyan-500/25 backdrop-blur-xl tech-corners">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-1">
              // GPA PROGRESSION MATRIX
            </h3>
            <p className="text-xs text-slate-400 font-sans mb-4">Semester-by-semester academic achievement record</p>
            <div className="h-64 w-full">
              {data?.gpaHistory && data.gpaHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.gpaHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,242,254,0.1)" />
                    <XAxis dataKey="semester" stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" />
                    <YAxis stroke="#64748b" fontSize={10} domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} fontFamily="JetBrains Mono" />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#080C14', 
                        borderColor: 'rgba(0,242,254,0.3)', 
                        borderRadius: '8px',
                        fontFamily: 'JetBrains Mono',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="sgpa" fill="#00F2FE" radius={[4, 4, 0, 0]} name="SGPA" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
                  // OFFICIAL TRANSCRIPT FOR THE CURRENT SEMESTER IS BEING PROCESSED.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
