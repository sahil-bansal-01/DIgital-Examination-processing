import { ReEvaluation } from '../models/LogsAndRuns.js';
import { Result } from '../models/Result.js';
import { Mark } from '../models/Mark.js';
import { Exam } from '../models/Exam.js';
import { Subject, GradingScheme } from '../models/Academic.js';
import { aggregateStudentMarks, runSequentialProcessing } from '../services/processingEngine.js';
import { logAudit } from '../middleware/audit.js';

export const createReEvaluationRequest = async (req, res) => {
  try {
    const { examId, subjectId, requestedComponent = 'external', reason } = req.body;
    if (!examId || !subjectId || !reason) {
      return res.status(400).json({ success: false, message: 'examId, subjectId, and reason are required' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    // Find current mark
    const mark = await Mark.findOne({ exam: examId, student: req.user.id, subject: subjectId });
    if (!mark) {
      return res.status(404).json({ success: false, message: 'Mark record not found for this subject' });
    }

    // Find current result for grade
    const resultDoc = await Result.findOne({ exam: examId, student: req.user.id });
    const subRes = resultDoc?.subjectResults?.find((s) => s.subjectCode === subject.code);

    const reEval = await ReEvaluation.create({
      student: req.user.id,
      studentName: req.user.name,
      rollNumber: req.user.rollNumber,
      exam: examId,
      examTitle: exam.title,
      subject: subjectId,
      subjectCode: subject.code,
      subjectName: subject.name,
      previousInternal: mark.internalMarks,
      previousExternal: mark.externalMarks,
      previousTotal: mark.totalMarks,
      previousGrade: subRes?.grade || 'N/A',
      requestedComponent,
      reason,
      status: 'pending',
    });

    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'SUBMIT_REEVAL_REQUEST',
      module: 'ReEvaluation',
      details: `Student ${req.user.name} (${req.user.rollNumber}) submitted re-evaluation for ${subject.code}`,
      newValue: reEval,
    });

    res.status(201).json({ success: true, message: 'Re-evaluation request submitted successfully', reEval });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getReEvaluationRequests = async (req, res) => {
  try {
    const { status, examId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (examId) filter.exam = examId;

    // Students only see their own
    if (req.user.role === 'student') {
      filter.student = req.user.id;
    }

    const requests = await ReEvaluation.find(filter)
      .populate('student', 'name rollNumber email section department')
      .populate('subject', 'code name')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const reviewReEvaluationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, updatedInternal, updatedExternal, reviewRemarks } = req.body;
    // action: 'approve' | 'reject'

    const reEval = await ReEvaluation.findById(id);
    if (!reEval) return res.status(404).json({ success: false, message: 'Request not found' });
    if (reEval.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This request has already been reviewed' });
    }

    if (action === 'reject') {
      reEval.status = 'rejected';
      reEval.reviewedBy = req.user.id;
      reEval.reviewRemarks = reviewRemarks || 'Marks verified, no discrepancy found.';
      reEval.reviewedAt = new Date();
      await reEval.save();

      await logAudit({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'REJECT_REEVAL',
        module: 'ReEvaluation',
        details: `Rejected re-evaluation for ${reEval.studentName} in ${reEval.subjectCode}`,
      });

      return res.json({ success: true, message: 'Re-evaluation request rejected', reEval });
    }

    if (action === 'approve') {
      reEval.status = 'approved';
      reEval.reviewedBy = req.user.id;
      reEval.reviewRemarks = reviewRemarks || 'Marks updated after re-evaluation.';
      reEval.reviewedAt = new Date();

      const newInternal = updatedInternal !== undefined ? Number(updatedInternal) : reEval.previousInternal;
      const newExternal = updatedExternal !== undefined ? Number(updatedExternal) : reEval.previousExternal;
      const newTotal = newInternal + newExternal;

      reEval.updatedInternal = newInternal;
      reEval.updatedExternal = newExternal;
      reEval.updatedTotal = newTotal;
      await reEval.save();

      // Update the Mark document
      const mark = await Mark.findOne({ exam: reEval.exam, student: reEval.student, subject: reEval.subject });
      if (mark) {
        mark.internalMarks = newInternal;
        mark.externalMarks = newExternal;
        mark.totalMarks = newTotal;
        await mark.save();
      }

      // Recalculate results for this exam
      const allMarks = await Mark.find({ exam: reEval.exam }).populate('student', 'name rollNumber section department');
      const exam = await Exam.findById(reEval.exam);
      const subjects = await Subject.find({ department: exam.department, semester: exam.semester });
      const subjectsMap = new Map();
      subjects.forEach((s) => subjectsMap.set(s.code, s));

      const studentRecords = aggregateStudentMarks(allMarks, subjectsMap);
      const gradingScheme = (await GradingScheme.findOne({ isDefault: true })) || {};

      // Quick recalculation & ranking
      await runSequentialProcessing({
        examId: reEval.exam,
        studentRecords,
        gradingScheme,
        saveToDb: true,
        workloadIntensity: 0,
      });

      await logAudit({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'APPROVE_REEVAL',
        module: 'ReEvaluation',
        details: `Approved re-evaluation for ${reEval.studentName} in ${reEval.subjectCode}. Marks updated from ${reEval.previousTotal} to ${newTotal}. Exam results recalculated.`,
      });

      return res.json({
        success: true,
        message: 'Re-evaluation approved and exam results successfully recalculated!',
        reEval,
      });
    }

    res.status(400).json({ success: false, message: 'Invalid action. Must be "approve" or "reject".' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
