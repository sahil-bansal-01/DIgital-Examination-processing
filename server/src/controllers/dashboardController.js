import User from '../models/User.js';
import { Exam } from '../models/Exam.js';
import { Mark } from '../models/Mark.js';
import { Result } from '../models/Result.js';
import { ProcessingRun, AuditLog } from '../models/LogsAndRuns.js';
import { ROLES, EXAM_STATUSES } from '../config/constants.js';

export const getDashboardStats = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole === ROLES.ADMIN) {
      const [
        totalStudents,
        totalTeachers,
        totalExams,
        activeExams,
        processingRunsCount,
        recentRuns,
        recentAuditLogs,
      ] = await Promise.all([
        User.countDocuments({ role: ROLES.STUDENT }),
        User.countDocuments({ role: ROLES.TEACHER }),
        Exam.countDocuments(),
        Exam.countDocuments({ status: { $in: [EXAM_STATUSES.MARKS_ENTRY, EXAM_STATUSES.PROCESSING] } }),
        ProcessingRun.countDocuments(),
        ProcessingRun.find().sort({ createdAt: -1 }).limit(5),
        AuditLog.find().sort({ createdAt: -1 }).limit(8),
      ]);

      // Calculate overall pass percentage trend across published exams
      const publishedExams = await Exam.find({ status: EXAM_STATUSES.PUBLISHED }).limit(6);
      const passRateTrends = [];

      for (const ex of publishedExams) {
        const totalInExam = await Result.countDocuments({ exam: ex._id });
        const passInExam = await Result.countDocuments({ exam: ex._id, status: 'PASS' });
        passRateTrends.push({
          examTitle: ex.title,
          department: ex.department,
          semester: ex.semester,
          total: totalInExam,
          passed: passInExam,
          passPercentage: totalInExam > 0 ? Number(((passInExam / totalInExam) * 100).toFixed(1)) : 0,
        });
      }

      return res.json({
        success: true,
        role: ROLES.ADMIN,
        stats: {
          totalStudents,
          totalTeachers,
          totalExams,
          activeExams,
          processingRunsCount,
        },
        passRateTrends,
        recentRuns,
        recentAuditLogs,
      });
    }

    if (userRole === ROLES.TEACHER) {
      const teacher = await User.findById(req.user.id);
      const assigned = teacher.assignedSubjects || [];

      // Find exams currently in 'Marks Entry'
      const openExams = await Exam.find({ status: EXAM_STATUSES.MARKS_ENTRY });
      const pendingSubmissions = [];

      for (const ex of openExams) {
        for (const asgn of assigned) {
          const count = await Mark.countDocuments({
            exam: ex._id,
            subjectCode: asgn.subjectCode,
            section: asgn.section,
          });

          // Check if marks are entered or pending
          pendingSubmissions.push({
            examId: ex._id,
            examTitle: ex.title,
            subjectCode: asgn.subjectCode,
            subjectName: asgn.subjectName,
            section: asgn.section,
            enteredCount: count,
            isLocked: ex.isMarksEntryLocked,
          });
        }
      }

      return res.json({
        success: true,
        role: ROLES.TEACHER,
        assignedSubjects: assigned,
        openExamsCount: openExams.length,
        pendingSubmissions,
      });
    }

    if (userRole === ROLES.STUDENT) {
      const results = await Result.find({ student: req.user.id })
        .populate('exam', 'title type semester academicYear status')
        .sort({ createdAt: -1 });

      const latestResult = results[0] || null;
      let totalSgpa = 0;
      let backlogs = 0;
      const gpaHistory = [];

      results.forEach((r) => {
        totalSgpa += r.sgpa || 0;
        backlogs += r.backlogCount || 0;
        gpaHistory.push({
          semester: `Sem ${r.semester}`,
          sgpa: r.sgpa,
          percentage: r.percentage,
          examTitle: r.exam?.title || `Semester ${r.semester}`,
        });
      });

      const cgpa = results.length > 0 ? Number((totalSgpa / results.length).toFixed(2)) : 0;

      return res.json({
        success: true,
        role: ROLES.STUDENT,
        studentInfo: {
          name: req.user.name,
          rollNumber: req.user.rollNumber,
          department: req.user.department,
          semester: req.user.semester,
          section: req.user.section,
        },
        cgpa,
        activeBacklogs: backlogs,
        latestResult,
        gpaHistory: gpaHistory.reverse(),
      });
    }

    res.status(400).json({ success: false, message: 'Unknown role' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
