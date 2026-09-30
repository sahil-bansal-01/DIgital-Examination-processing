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
  O: '#06b6d4',
  'A+': '#3b82f6',
  A: '#6366f1',
  'B+': '#8b5cf6',
  B: '#a855f7',
  C: '#f59e0b',
  P: '#10b981',
  F: '#ef4444',
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
            // Pick first published or first exam
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Results Analytics & Official Reports</h1>
          <p className="text-xs text-slate-400 mt-1">
            Section-wise performance distribution, topper leaderboards, subject difficulty indexes, and exportable grade registers.
          </p>
        </div>

        <Button variant="outline" icon={Download} onClick={handleExportCSV}>
          Export CSV Register
        </Button>
      </div>

      {/* Selector & Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Examination
          </label>
          <select
            value={selectedExamId}
            onChange={(e) => {
              setSelectedExamId(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            {exams.map((ex) => (
              <option key={ex._id} value={ex._id}>
                {ex.title} ({ex.status})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Section Filter
          </label>
          <select
            value={selectedSection}
            onChange={(e) => {
              setSelectedSection(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Cohorts (Section A & B)</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Evaluation Outcome
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Candidates</option>
            <option value="PASS">Passed Candidates</option>
            <option value="FAIL">Backlog Candidates</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Search Candidate
          </label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              fetchResultsAndAnalytics();
            }}
            className="relative"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search candidate or roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
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
            color="indigo"
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
          <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Top Academic Performers (Dean's List)
            </h3>
            <p className="text-xs text-slate-400 mb-4">Rank leaders by aggregate weighted SGPA and percentage</p>

            <div className="space-y-2.5">
              {analytics.toppers?.map((t) => (
                <div
                  key={t.rollNumber}
                  className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                        t.rank === 1
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : t.rank === 2
                          ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                          : t.rank === 3
                          ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{t.rank}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{t.name}</p>
                      <p className="text-xs font-mono text-cyan-400">
                        {t.rollNumber} • Sec {t.section}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold font-mono text-emerald-400">
                      {t.sgpa} <span className="text-xs text-slate-500">SGPA</span>
                    </span>
                    <p className="text-[11px] text-slate-400 font-mono">{t.percentage}% Aggregate</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grade Distribution Chart */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Grade Distribution Spectrum</h3>
              <p className="text-xs text-slate-400 mb-4">Subject grades awarded across all candidate papers</p>

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
                        outerRadius={80}
                        innerRadius={45}
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
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                    No grade distribution data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABULATED RESULTS REGISTER */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Master Tabulation Register</h3>
            <p className="text-xs text-slate-400">
              Complete published candidate scores, SGPA, pass/fail status, and section ranks
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            {resultsData.totalCount} Registered Candidates
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs text-slate-400 font-mono uppercase">
              <tr>
                <th className="px-5 py-3.5">Rank</th>
                <th className="px-5 py-3.5">Roll Number</th>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">Section</th>
                <th className="px-5 py-3.5">Sec Rank</th>
                <th className="px-5 py-3.5">Marks Obtained</th>
                <th className="px-5 py-3.5">Percentage</th>
                <th className="px-5 py-3.5">SGPA</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {resultsData.results?.map((res) => (
                <tr key={res._id} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3.5 font-mono font-bold text-white">#{res.overallRank}</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-cyan-400">{res.rollNumber}</td>
                  <td className="px-5 py-3.5 font-medium text-white">{res.studentName}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant="indigo">Sec {res.section}</Badge>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-400">#{res.sectionRank}</td>
                  <td className="px-5 py-3.5 font-mono text-xs">
                    {res.totalMarksObtained} / {res.maxPossibleMarks}
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold">{res.percentage}%</td>
                  <td className="px-5 py-3.5 font-mono font-extrabold text-cyan-400 text-base">
                    {res.sgpa}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={res.status === 'PASS' ? 'pass' : 'fail'}>
                      {res.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => setInspectStudent(res)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
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
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>
            Page {resultsData.currentPage} of {resultsData.totalPages || 1}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={ChevronLeft}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= resultsData.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* STUDENT SUBJECT BREAKDOWN MODAL */}
      <Modal
        isOpen={!!inspectStudent}
        onClose={() => setInspectStudent(null)}
        title={`Candidate Evaluation Transcript: ${inspectStudent?.studentName}`}
        subtitle={`Roll: ${inspectStudent?.rollNumber} • Section ${inspectStudent?.section} • SGPA: ${inspectStudent?.sgpa}`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 uppercase font-mono text-slate-400">
                <tr>
                  <th className="px-3 py-2.5">Code</th>
                  <th className="px-3 py-2.5">Subject</th>
                  <th className="px-3 py-2.5">Credits</th>
                  <th className="px-3 py-2.5">Internal</th>
                  <th className="px-3 py-2.5">External</th>
                  <th className="px-3 py-2.5">Total</th>
                  <th className="px-3 py-2.5">Grade</th>
                  <th className="px-3 py-2.5">Grade Point</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {inspectStudent?.subjectResults?.map((sr, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="px-3 py-2 font-mono font-bold text-cyan-400">{sr.subjectCode}</td>
                    <td className="px-3 py-2 text-white">{sr.subjectName}</td>
                    <td className="px-3 py-2 font-mono">{sr.credits}</td>
                    <td className="px-3 py-2 font-mono">{sr.internalMarks}</td>
                    <td className="px-3 py-2 font-mono">{sr.externalMarks}</td>
                    <td className="px-3 py-2 font-mono font-bold text-white">{sr.totalMarks}</td>
                    <td className="px-3 py-2">
                      <span className="font-mono font-bold text-cyan-300">{sr.grade}</span>
                    </td>
                    <td className="px-3 py-2 font-mono">{sr.gradePoint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={() => setInspectStudent(null)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
