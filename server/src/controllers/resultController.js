import { Result } from '../models/Result.js';
import { Exam } from '../models/Exam.js';
import { Subject } from '../models/Academic.js';
import { ROLES } from '../config/constants.js';

/**
 * Gets exam results with pagination, search, section filter, status filter, and sorting
 */
export const getExamResults = async (req, res) => {
  try {
    const {
      examId,
      section,
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = 'overallRank',
      sortOrder = 'asc',
    } = req.query;

    if (!examId) return res.status(400).json({ success: false, message: 'examId is required' });

    const filter = { exam: examId };
    if (section) filter.section = section.toUpperCase();
    if (status) filter.status = status.toUpperCase();

    if (search) {
      filter.$or = [
        { rollNumber: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOption = {};
    sortOption[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);
    const [results, totalCount] = await Promise.all([
      Result.find(filter).sort(sortOption).skip(skip).limit(Number(limit)),
      Result.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: results.length,
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
      currentPage: Number(page),
      results,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Section-wise analytics: pass %, toppers, grade distribution, subject difficulty
 */
export const getSectionAnalytics = async (req, res) => {
  try {
    const { examId, section } = req.query;
    if (!examId) return res.status(400).json({ success: false, message: 'examId is required' });

    const filter = { exam: examId };
    if (section) filter.section = section.toUpperCase();

    const allResults = await Result.find(filter);
    if (!allResults.length) {
      return res.json({
        success: true,
        analytics: {
          totalStudents: 0,
          passCount: 0,
          failCount: 0,
          passPercentage: 0,
          averageSgpa: 0,
          highestSgpa: 0,
          lowestSgpa: 0,
          toppers: [],
          gradeDistribution: {},
          subjectDifficulty: [],
        },
      });
    }

    const totalStudents = allResults.length;
    let passCount = 0;
    let sumSgpa = 0;
    let highestSgpa = 0;
    let lowestSgpa = 10;
    const gradeDistribution = { O: 0, 'A+': 0, A: 0, 'B+': 0, B: 0, C: 0, P: 0, F: 0 };
    const subjectStats = new Map();

    for (const r of allResults) {
      if (r.status === 'PASS') passCount++;
      sumSgpa += r.sgpa || 0;
      if (r.sgpa > highestSgpa) highestSgpa = r.sgpa;
      if (r.sgpa < lowestSgpa) lowestSgpa = r.sgpa;

      for (const sr of r.subjectResults || []) {
        if (!gradeDistribution[sr.grade]) gradeDistribution[sr.grade] = 0;
        gradeDistribution[sr.grade]++;

        if (!subjectStats.has(sr.subjectCode)) {
          subjectStats.set(sr.subjectCode, {
            code: sr.subjectCode,
            name: sr.subjectName,
            totalMarks: 0,
            count: 0,
            failCount: 0,
          });
        }
        const ss = subjectStats.get(sr.subjectCode);
        ss.totalMarks += sr.totalMarks;
        ss.count++;
        if (!sr.isPass) ss.failCount++;
      }
    }

    const toppers = [...allResults]
      .sort((a, b) => a.overallRank - b.overallRank)
      .slice(0, 5)
      .map((t) => ({
        rank: t.overallRank,
        sectionRank: t.sectionRank,
        rollNumber: t.rollNumber,
        name: t.studentName,
        section: t.section,
        sgpa: t.sgpa,
        percentage: t.percentage,
      }));

    const subjectDifficulty = Array.from(subjectStats.values()).map((s) => ({
      code: s.code,
      name: s.name,
      averageMarks: Number((s.totalMarks / s.count).toFixed(1)),
      failRate: Number(((s.failCount / s.count) * 100).toFixed(1)),
      // Difficulty index: Higher fail rate + lower average marks = higher difficulty (0 - 100 scale)
      difficultyScore: Number((s.failCount / s.count * 60 + (100 - (s.totalMarks / s.count)) * 0.4).toFixed(1)),
    })).sort((a, b) => b.difficultyScore - a.difficultyScore);

    res.json({
      success: true,
      analytics: {
        totalStudents,
        passCount,
        failCount: totalStudents - passCount,
        passPercentage: Number(((passCount / totalStudents) * 100).toFixed(1)),
        averageSgpa: Number((sumSgpa / totalStudents).toFixed(2)),
        highestSgpa,
        lowestSgpa: lowestSgpa === 10 && passCount === 0 ? 0 : lowestSgpa,
        toppers,
        gradeDistribution,
        subjectDifficulty,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Student's view: gets personal results across all exams/semesters
 */
export const getMyResults = async (req, res) => {
  try {
    const studentId = req.user.id;
    const results = await Result.find({ student: studentId })
      .populate('exam', 'title type semester academicYear status')
      .sort({ createdAt: -1 });

    // Calculate CGPA across all completed semesters
    let totalSgpa = 0;
    let semesterCount = 0;
    let activeBacklogs = 0;

    results.forEach((r) => {
      totalSgpa += r.sgpa || 0;
      semesterCount++;
      activeBacklogs += r.backlogCount || 0;
    });

    const cgpa = semesterCount > 0 ? Number((totalSgpa / semesterCount).toFixed(2)) : 0;

    res.json({
      success: true,
      summary: {
        totalSemesters: semesterCount,
        cgpa,
        activeBacklogs,
      },
      results,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Export results as CSV format
 */
export const exportResultsCSV = async (req, res) => {
  try {
    const { examId, section } = req.query;
    if (!examId) return res.status(400).send('examId is required');

    const exam = await Exam.findById(examId);
    const filter = { exam: examId };
    if (section) filter.section = section.toUpperCase();

    const results = await Result.find(filter).sort({ overallRank: 1 });
    if (!results.length) return res.status(404).send('No results found to export');

    // Dynamically build subject headers
    const subjects = results[0].subjectResults.map((s) => s.subjectCode);
    const headers = ['Overall Rank', 'Section Rank', 'Roll Number', 'Student Name', 'Section', ...subjects.map((s) => `${s} (Total)`), ...subjects.map((s) => `${s} (Grade)`), 'Total Marks', 'Percentage', 'SGPA', 'Status', 'Backlogs'];

    const rows = results.map((r) => {
      const subjectTotals = subjects.map((subCode) => {
        const sr = r.subjectResults.find((s) => s.subjectCode === subCode);
        return sr ? (sr.isAbsent ? 'AB' : sr.totalMarks) : '-';
      });
      const subjectGrades = subjects.map((subCode) => {
        const sr = r.subjectResults.find((s) => s.subjectCode === subCode);
        return sr ? sr.grade : '-';
      });

      return [
        r.overallRank,
        r.sectionRank,
        `"${r.rollNumber}"`,
        `"${r.studentName}"`,
        r.section,
        ...subjectTotals,
        ...subjectGrades,
        r.totalMarksObtained,
        r.percentage,
        r.sgpa,
        r.status,
        r.backlogCount,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="results_${exam ? exam.title.replace(/\s+/g, '_') : 'export'}.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
