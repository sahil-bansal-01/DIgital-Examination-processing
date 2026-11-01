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
  Sparkles,
  Edit3,
  UploadCloud,
  BarChart3,
  CheckCircle2
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
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherTab, setTeacherTab] = useState('config');
  const [studentTab, setStudentTab] = useState('active');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, examsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/exams').catch(() => ({ success: false, exams: [] })),
        ]);
        if (dashRes.success) {
          setData(dashRes);
        }
        if (examsRes.success) {
          setExams(examsRes.exams || []);
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
              {isAdmin && 'High-performance examination processing core. Monitor evaluation protocols, curriculum schemas, and live audit telemetry.'}
              {isTeacher && 'Faculty evaluation node. Enter marks with zero-leak client validation, view cohorts, and dispatch grade records.'}
              {isStudent && 'Student academic node. View verified semester transcripts, grade cutoffs, and official marks verification.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link to="/exams">
                <Button variant="gradient" icon={CalendarCheck}>
                  EXAM MANAGEMENT
                </Button>
              </Link>
            )}
            {isTeacher && (
              <Link to="/marks">
                <Button variant="primary" icon={FileCheck}>
                  MARKS ENTRY MATRIX
                </Button>
              </Link>
            )}
            {isStudent && (
              <Link to="/results">
                <Button variant="primary" icon={Award}>
                  SCORECARD & RESULTS
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

          {/* Teacher Section Core Examination Feature Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-[#0F172A]/70 border border-cyan-500/30 rounded-xl overflow-x-auto tech-corners select-none">
            {[
              { id: 'config', code: '01', label: 'Exam Configuration & Scheduling', icon: CalendarCheck },
              { id: 'ingestion', code: '02', label: 'Answer Sheet Ingestion / Upload', icon: UploadCloud },
              { id: 'marks', code: '03', label: 'Marks Entry & Automated Evaluation', icon: Edit3 },
              { id: 'results', code: '04', label: 'Student Results View', icon: BarChart3 },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = teacherTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTeacherTab(t.id)}
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

          {/* Tab 1: Exam Configuration & Scheduling */}
          {teacherTab === 'config' && (
            <div className="p-5 sm:p-6 rounded-xl bg-[#0F172A]/60 border border-cyan-500/25 backdrop-blur-xl tech-corners">
              <div className="flex items-center justify-between mb-4 font-mono">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-cyan-400" />
                    <span>EXAMINATION PROTOCOLS & SCHEDULE CONFIGURATION</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Active academic cycles, scheduled examination terms, and evaluation windows
                  </p>
                </div>
                <Link to="/exams">
                  <Button size="sm" variant="outline">
                    VIEW ALL PROTOCOLS //
                  </Button>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-[10px] text-slate-400 uppercase tracking-wider border-b border-cyan-500/20">
                    <tr>
                      <th className="px-4 py-3">PROTOCOL TITLE</th>
                      <th className="px-4 py-3">DEPARTMENT & SEM</th>
                      <th className="px-4 py-3">TYPE</th>
                      <th className="px-4 py-3">STATUS</th>
                      <th className="px-4 py-3">EVALUATION WINDOW</th>
                      <th className="px-4 py-3">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {exams.length > 0 ? (
                      exams.map((ex) => (
                        <tr key={ex._id} className="hover:bg-slate-900/40">
                          <td className="px-4 py-3 font-bold text-white">{ex.title}</td>
                          <td className="px-4 py-3 text-cyan-300">{ex.department} - SEM {ex.semester}</td>
                          <td className="px-4 py-3 uppercase text-slate-400">{ex.type}</td>
                          <td className="px-4 py-3">
                            <Badge variant={ex.status === 'Published' ? 'emerald' : ex.status === 'Marks Entry' ? 'amber' : 'cyan'}>
                              {ex.status?.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {ex.isMarksEntryLocked ? (
                              <span className="text-rose-400 font-semibold">[ LOCKED ]</span>
                            ) : (
                              <span className="text-emerald-400 font-semibold">[ OPEN FOR ENTRY ]</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Link to={`/marks?examId=${ex._id}`}>
                              <Button size="sm" variant="outline">
                                ENTER MARKS
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-slate-500">
                          // NO EXAMINATION PROTOCOLS RECORDED.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Answer Sheet Ingestion / Upload */}
          {teacherTab === 'ingestion' && (
            <div className="p-5 sm:p-6 rounded-xl bg-[#0F172A]/60 border border-cyan-500/25 backdrop-blur-xl tech-corners space-y-4">
              <div className="flex items-center justify-between font-mono">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-cyan-400" />
                    <span>ANSWER SHEET INGESTION & BATCH CSV PARSER</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Fast automated evaluation and telemetry ingestion of evaluated student marks
                  </p>
                </div>
                <Link to="/marks">
                  <Button variant="primary" icon={UploadCloud}>
                    LAUNCH INGESTION CONSOLE
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 rounded-lg bg-slate-900/60 border border-cyan-500/20">
                  <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1">01 / CSV SPECIFICATION</p>
                  <p className="text-slate-300 font-sans text-xs">
                    File must include standard columns: <code className="text-cyan-300 font-mono">Roll Number, Internal Marks, External Marks, isAbsent</code>.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-900/60 border border-cyan-500/20">
                  <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1">02 / AUTOMATED VALIDATION</p>
                  <p className="text-slate-300 font-sans text-xs">
                    Client and server run boundary checking (0-30 Internal, 0-70 External), flagging any anomalies instantly.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-900/60 border border-cyan-500/20">
                  <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1">03 / ATOMIC COMMIT</p>
                  <p className="text-slate-300 font-sans text-xs">
                    Validated scores are ingested atomically into the examination ledger with zero-leak cryptographic audit logs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Marks Entry & Automated Evaluation */}
          {teacherTab === 'marks' && (
            <div className="p-5 sm:p-6 rounded-xl bg-[#0F172A]/60 border border-cyan-500/25 backdrop-blur-xl tech-corners">
              <div className="flex items-center justify-between mb-4 font-mono">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-cyan-400" />
                    <span>ASSIGNED COURSE OFFERINGS & MARKS EVALUATION</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Faculty cohort roster ready for spreadsheet entry with boundary checking
                  </p>
                </div>
                <Link to="/marks">
                  <Button size="sm" variant="primary">
                    OPEN FULL GRID //
                  </Button>
                </Link>
              </div>

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
          )}

          {/* Tab 4: Student Results View */}
          {teacherTab === 'results' && (
            <div className="p-5 sm:p-6 rounded-xl bg-[#0F172A]/60 border border-cyan-500/25 backdrop-blur-xl tech-corners">
              <div className="flex items-center justify-between mb-4 font-mono">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    <span>COHORT PERFORMANCE & STUDENT RESULTS VIEW</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Official synthesized student transcripts and section-level pass analytics
                  </p>
                </div>
                <Link to="/results">
                  <Button size="sm" variant="primary">
                    OPEN RESULTS & REPORTS //
                  </Button>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-[10px] text-slate-400 uppercase tracking-wider border-b border-cyan-500/20">
                    <tr>
                      <th className="px-4 py-3">EXAMINATION</th>
                      <th className="px-4 py-3">DEPARTMENT</th>
                      <th className="px-4 py-3">TERM</th>
                      <th className="px-4 py-3">STATUS</th>
                      <th className="px-4 py-3">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {exams.filter((e) => e.status === 'Published').length > 0 ? (
                      exams.filter((e) => e.status === 'Published').map((ex) => (
                        <tr key={ex._id} className="hover:bg-slate-900/40">
                          <td className="px-4 py-3 font-bold text-white">{ex.title}</td>
                          <td className="px-4 py-3 text-cyan-400">{ex.department}</td>
                          <td className="px-4 py-3">SEMESTER {ex.semester}</td>
                          <td className="px-4 py-3">
                            <Badge variant="emerald">PUBLISHED</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Link to={`/results?examId=${ex._id}`}>
                              <Button size="sm" variant="outline">
                                INSPECT RESULTS
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-slate-500">
                          // NO PUBLISHED COHORT RESULTS YET. RESULTS APPEAR ONCE PUBLISHED BY EXAM CELL.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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

          {/* Student Section Essential View Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-[#0F172A]/70 border border-cyan-500/30 rounded-xl overflow-x-auto tech-corners select-none">
            {[
              { id: 'active', code: '01', label: 'Active/Upcoming Exams', icon: CalendarCheck },
              { id: 'submitted', code: '02', label: 'Submitted Exam Status', icon: Clock },
              { id: 'scorecard', code: '03', label: 'Scorecard & Results View', icon: Award },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = studentTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setStudentTab(t.id)}
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

          {/* Tab 1: Active/Upcoming Exams */}
          {studentTab === 'active' && (
            <div className="p-5 sm:p-6 rounded-xl bg-[#0F172A]/60 border border-cyan-500/25 backdrop-blur-xl tech-corners">
              <div className="flex items-center justify-between mb-4 font-mono">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-cyan-400" />
                    <span>ACTIVE & UPCOMING EXAMINATIONS</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Official term schedule for {data?.studentInfo?.department || 'CSE'} Semester {data?.studentInfo?.semester || 3}
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

          {/* Tab 2: Submitted Exam Status */}
          {studentTab === 'submitted' && (
            <div className="p-5 sm:p-6 rounded-xl bg-[#0F172A]/60 border border-cyan-500/25 backdrop-blur-xl tech-corners">
              <div className="flex items-center justify-between mb-4 font-mono">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>SUBMITTED EXAM EVALUATION STATUS</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Clearance verification and evaluation milestones for completed examinations
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
                      <th className="px-4 py-3">TRANSCRIPT ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {exams.filter((e) => e.status === 'Published' || e.status === 'Processing').length > 0 ? (
                      exams.filter((e) => e.status === 'Published' || e.status === 'Processing').map((ex) => (
                        <tr key={ex._id} className="hover:bg-slate-900/40">
                          <td className="px-4 py-3 font-bold text-white">{ex.title}</td>
                          <td className="px-4 py-3">
                            <span className="text-cyan-300">
                              {ex.status === 'Published' ? 'Marks Reconciled & Certified' : 'Processing Telemetry'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={ex.status === 'Published' ? 'emerald' : 'cyan'}>
                              {ex.status === 'Published' ? 'RESULTS PUBLISHED' : 'IN PROCESSING'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Link to="/results">
                              <Button size="sm" variant="outline">
                                VIEW SCORECARD
                              </Button>
                            </Link>
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

          {/* Tab 3: Scorecard & Results View */}
          {studentTab === 'scorecard' && (
            <div className="space-y-6">
              <div className="p-5 sm:p-6 rounded-xl bg-[#0F172A]/60 border border-cyan-500/25 backdrop-blur-xl tech-corners">
                <div className="flex items-center justify-between mb-4 font-mono">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4 text-cyan-400" />
                      <span>SCORECARD & GPA PROGRESSION MATRIX</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      Semester-by-semester academic achievement record and certified transcript
                    </p>
                  </div>
                  <Link to="/results">
                    <Button variant="primary" icon={Award}>
                      OFFICIAL TRANSCRIPT & MARKSHEET
                    </Button>
                  </Link>
                </div>

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
      )}
    </div>
  );
};
