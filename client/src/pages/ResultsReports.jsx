import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  Search,
  Download,
  Award,
  TrendingUp,
  AlertCircle,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Crosshair,
  Terminal,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Modal } from '../components/ui/Modal';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const GRADE_COLORS = {
  O: '#00F2FE',
  'A+': '#38BDF8',
  A: '#818CF8',
  'B+': '#8B5CF6',
  B: '#C084FC',
  C: '#F59E0B',
  P: '#10B981',
  F: '#F43F5E',
};

export const ResultsReports = () => {
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(searchParams.get('examId') || '');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const [resultsData, setResultsData] = useState({ results: [], totalPages: 1, totalCount: 0 });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Detail Modal
  const [inspectStudent, setInspectStudent] = useState(null);

  // 1. Fetch Exams
  useEffect(() => {
    const loadExams = async () => {
      try {
        const res = await api.get('/exams');
        if (res.success && res.exams?.length > 0) {
          setExams(res.exams);
          if (!selectedExamId) {
            const published = res.exams.find((e) => e.status === 'Published') || res.exams[0];
            setSelectedExamId(published._id);
          }
        }
      } catch (err) {
        toast.error('Failed to load exams');
      }
    };
    loadExams();
  }, []);

  // 2. Fetch Results & Analytics when filters change
  const fetchResultsAndAnalytics = async () => {
    if (!selectedExamId) return;
    setLoading(true);
    try {
      const query = new URLSearchParams({
        examId: selectedExamId,
        page,
        limit: 15,
        sortBy: 'overallRank',
        sortOrder: 'asc',
      });
      if (selectedSection) query.append('section', selectedSection);
      if (selectedStatus) query.append('status', selectedStatus);
      if (searchQuery) query.append('search', searchQuery);

      const [resRes, anaRes] = await Promise.all([
        api.get(`/results?${query.toString()}`),
        api.get(`/results/analytics?examId=${selectedExamId}${selectedSection ? `&section=${selectedSection}` : ''}`),
      ]);

      if (resRes.success) setResultsData(resRes);
      if (anaRes.success) setAnalytics(anaRes.analytics);
    } catch (err) {
      toast.error('Failed to load results: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResultsAndAnalytics();
  }, [selectedExamId, selectedSection, selectedStatus, page]);

  const handleExportCSV = () => {
    if (!selectedExamId) return;
    window.open(`/api/results/export-csv?examId=${selectedExamId}${selectedSection ? `&section=${selectedSection}` : ''}`, '_blank');
  };

  const pieData = analytics?.gradeDistribution
    ? Object.entries(analytics.gradeDistribution)
        .filter(([_, count]) => count > 0)
        .map(([grade, count]) => ({ name: grade, value: count }))
    : [];

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" />
              DISPATCH & SYNTHESIS // [07]
            </span>
            <Badge variant="cyan">PUBLISHED TRANSCRIPTS</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
            RESULTS ANALYTICS & OFFICIAL DISPATCH
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans max-w-2xl">
            Section-wise performance distribution, topper leaderboards, subject difficulty indexes, and exportable grade registers.
          </p>
        </div>

        <Button variant="outline" icon={Download} onClick={handleExportCSV}>
          EXPORT CSV REGISTER
        </Button>
      </div>

      {/* Selector & Filters Bar */}
      <div className="p-4 rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-xl backdrop-blur-xl grid grid-cols-1 sm:grid-cols-4 gap-4 items-center tech-corners">
        <div>
          <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">
            EXAMINATION PROTOCOL
          </label>
          <select
            value={selectedExamId}
            onChange={(e) => {
              setSelectedExamId(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-1.5 bg-[#080C14] border border-cyan-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 transition"
          >
            {exams.map((ex) => (
              <option key={ex._id} value={ex._id}>
                {ex.title} [{ex.status?.toUpperCase()}]
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">
            SECTION COHORT
          </label>
          <select
            value={selectedSection}
            onChange={(e) => {
              setSelectedSection(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-1.5 bg-[#080C14] border border-cyan-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 transition"
          >
            <option value="">ALL COHORTS (SECTION A & B)</option>
            <option value="A">SECTION A</option>
            <option value="B">SECTION B</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">
            EVALUATION STATUS
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-1.5 bg-[#080C14] border border-cyan-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 transition"
          >
            <option value="">ALL CANDIDATES</option>
            <option value="PASS">PASSED CANDIDATES</option>
            <option value="FAIL">BACKLOG CANDIDATES</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1">
            SEARCH CANDIDATE
          </label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              fetchResultsAndAnalytics();
            }}
            className="relative"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search candidate or roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#080C14] border border-cyan-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 transition"
            />
          </form>
        </div>
      </div>

      {/* ANALYTICS SECTION STAT CARDS */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Total Candidates"
            value={analytics.totalStudents}
            subtext="Graded in this examination"
            icon={Award}
            color="cyan"
          />
          <StatCard
            title="Pass Percentage"
            value={`${analytics.passPercentage}%`}
            subtext={`${analytics.passCount} Passed, ${analytics.failCount} Backlogs`}
            icon={TrendingUp}
            color={analytics.passPercentage >= 75 ? 'emerald' : 'amber'}
          />
          <StatCard
            title="Average SGPA"
            value={analytics.averageSgpa}
            subtext="Cohort Mean Grade Point"
            icon={BarChart3}
            color="purple"
          />
          <StatCard
            title="Highest SGPA"
            value={analytics.highestSgpa}
            subtext="Top Performing Candidate"
            icon={Award}
            color="emerald"
          />
        </div>
      )}

      {/* TOPPERS & GRADE DISTRIBUTION CHARTS */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Toppers Leaderboard */}
          <div className="lg:col-span-6 p-5 sm:p-6 rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-xl backdrop-blur-xl tech-corners">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>TOP ACADEMIC PERFORMERS // DEAN'S LIST</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mb-4">Rank leaders by aggregate weighted SGPA and percentage</p>

            <div className="space-y-2">
              {analytics.toppers?.map((t) => (
                <div
                  key={t.rollNumber}
                  className="p-3 rounded-lg bg-[#080C14]/90 border border-cyan-500/20 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                        t.rank === 1
                          ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                          : t.rank === 2
                          ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                          : t.rank === 3
                          ? 'bg-amber-700/25 text-amber-400 border border-amber-700/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{t.rank}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight font-sans">{t.name}</p>
                      <p className="text-[10px] text-cyan-400">
                        {t.rollNumber} • SEC {t.section}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-400">
                      {t.sgpa} <span className="text-[10px] text-slate-500">SGPA</span>
                    </span>
                    <p className="text-[10px] text-slate-400">{t.percentage}% AGGREGATE</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grade Distribution Chart */}
          <div className="lg:col-span-6 p-5 sm:p-6 rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-xl backdrop-blur-xl flex flex-col justify-between tech-corners">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                // GRADE DISTRIBUTION SPECTRUM
              </h3>
              <p className="text-xs text-slate-400 font-sans mb-4">Letter grades awarded across all candidate evaluations</p>

              <div className="h-60 w-full">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        innerRadius={42}
                        paddingAngle={4}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={GRADE_COLORS[entry.name] || '#94a3b8'}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ 
                          backgroundColor: '#080C14', 
                          borderColor: 'rgba(0,242,254,0.3)', 
                          borderRadius: '8px',
                          fontFamily: 'JetBrains Mono',
                          fontSize: '11px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                    // NO GRADE DISTRIBUTION DATA AVAILABLE
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABULATED RESULTS REGISTER */}
      <div className="rounded-xl bg-[#0F172A]/70 border border-cyan-500/30 shadow-2xl overflow-hidden backdrop-blur-xl tech-corners">
        <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              // MASTER TABULATION REGISTER
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Complete published candidate scores, SGPA, pass/fail status, and section ranks
            </p>
          </div>
          <span className="text-xs text-cyan-400">
            {resultsData.totalCount} REGISTERED CANDIDATES
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-[10px] text-slate-400 uppercase tracking-wider border-b border-cyan-500/20">
              <tr>
                <th className="px-4 py-3">RANK</th>
                <th className="px-4 py-3">ROLL NUMBER</th>
                <th className="px-4 py-3">CANDIDATE NAME</th>
                <th className="px-4 py-3">SECTION</th>
                <th className="px-4 py-3">SEC RANK</th>
                <th className="px-4 py-3">MARKS</th>
                <th className="px-4 py-3">%</th>
                <th className="px-4 py-3">SGPA</th>
                <th className="px-4 py-3">STATUS</th>
                <th className="px-4 py-3 text-center">INSPECT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {resultsData.results?.map((res) => (
                <tr key={res._id} className="hover:bg-slate-900/40 transition">
                  <td className="px-4 py-2.5 font-bold text-white">#{res.overallRank}</td>
                  <td className="px-4 py-2.5 font-bold text-cyan-400">{res.rollNumber}</td>
                  <td className="px-4 py-2.5 font-medium text-white font-sans">{res.studentName}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="purple">SEC {res.section}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-slate-400">#{res.sectionRank}</td>
                  <td className="px-4 py-2.5">
                    {res.totalMarksObtained} / {res.maxPossibleMarks}
                  </td>
                  <td className="px-4 py-2.5 font-bold">{res.percentage}%</td>
                  <td className="px-4 py-2.5 font-extrabold text-cyan-300 text-sm">
                    {res.sgpa}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={res.status === 'PASS' ? 'pass' : 'fail'}>
                      {res.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => setInspectStudent(res)}
                      className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                      title="Inspect Subject Breakdown"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-3.5 border-t border-cyan-500/20 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>
            PAGE {resultsData.currentPage} OF {resultsData.totalPages || 1}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={ChevronLeft}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              PREV
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= resultsData.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              NEXT <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* STUDENT SUBJECT BREAKDOWN MODAL */}
      <Modal
        isOpen={!!inspectStudent}
        onClose={() => setInspectStudent(null)}
        title={`TRANSCRIPT // ${inspectStudent?.studentName}`}
        subtitle={`Roll: ${inspectStudent?.rollNumber} • Section ${inspectStudent?.section} • SGPA: ${inspectStudent?.sgpa}`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="overflow-x-auto rounded-lg border border-cyan-500/20">
            <table className="w-full text-left text-slate-300">
              <thead className="bg-slate-900/90 uppercase text-[10px] text-slate-400 border-b border-cyan-500/20">
                <tr>
                  <th className="px-3 py-2">CODE</th>
                  <th className="px-3 py-2">SUBJECT</th>
                  <th className="px-3 py-2">CREDITS</th>
                  <th className="px-3 py-2">INT</th>
                  <th className="px-3 py-2">EXT</th>
                  <th className="px-3 py-2">TOTAL</th>
                  <th className="px-3 py-2">GRADE</th>
                  <th className="px-3 py-2">POINT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {inspectStudent?.subjectResults?.map((sr, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="px-3 py-2 font-bold text-cyan-400">{sr.subjectCode}</td>
                    <td className="px-3 py-2 text-white font-sans">{sr.subjectName}</td>
                    <td className="px-3 py-2 font-bold text-purple-400">{sr.credits}</td>
                    <td className="px-3 py-2">{sr.internalMarks}</td>
                    <td className="px-3 py-2">{sr.externalMarks}</td>
                    <td className="px-3 py-2 font-bold text-white">{sr.totalMarks}</td>
                    <td className="px-3 py-2">
                      <span className="font-bold text-cyan-300">{sr.grade}</span>
                    </td>
                    <td className="px-3 py-2">{sr.gradePoint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={() => setInspectStudent(null)}>CLOSE TRANSCRIPT</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
