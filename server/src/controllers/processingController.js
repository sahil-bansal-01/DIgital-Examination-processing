import { Exam } from '../models/Exam.js';
import { Mark } from '../models/Mark.js';
import { Subject, GradingScheme } from '../models/Academic.js';
import { ProcessingRun } from '../models/LogsAndRuns.js';
import {
  aggregateStudentMarks,
  runSequentialProcessing,
  runParallelProcessing,
} from '../services/processingEngine.js';
import { logAudit } from '../middleware/audit.js';
import { EXAM_STATUSES, DEFAULT_GRADING_SCHEME } from '../config/constants.js';

export const triggerExamProcessing = async (req, res) => {
  try {
    const { examId } = req.params;
    const {
      mode = 'parallel',
      workerCount = 4,
      chunkStrategy = 'fixed-batch',
      customChunkSize = null,
      workloadIntensity = 1,
    } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    // Fetch marks for this exam
    const marksList = await Mark.find({ exam: examId }).populate('student', 'name rollNumber section department');
    if (!marksList || marksList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No marks records found for this exam. Please enter or upload marks before processing.',
      });
    }

    // Fetch subjects map
    const subjects = await Subject.find({ department: exam.department, semester: exam.semester });
    const subjectsMap = new Map();
    subjects.forEach((s) => subjectsMap.set(s.code, s));

    // Aggregate into student records
    const studentRecords = aggregateStudentMarks(marksList, subjectsMap);

    // Fetch grading scheme
    let gradingScheme = await GradingScheme.findOne({ isDefault: true });
    if (!gradingScheme) gradingScheme = DEFAULT_GRADING_SCHEME;

    // Transition exam status
    exam.status = EXAM_STATUSES.PROCESSING;
    await exam.save();

    let resultPayload;
    const runId = `RUN-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    if (mode === 'sequential') {
      resultPayload = await runSequentialProcessing({
        examId,
        studentRecords,
        gradingScheme,
        saveToDb: true,
        workloadIntensity,
      });
    } else {
      resultPayload = await runParallelProcessing({
        examId,
        studentRecords,
        gradingScheme,
        workerCount: Number(workerCount),
        chunkStrategy,
        customChunkSize: customChunkSize ? Number(customChunkSize) : null,
        saveToDb: true,
        workloadIntensity,
      });
    }

    // Mark exam as Published
    exam.status = EXAM_STATUSES.PUBLISHED;
    exam.isMarksEntryLocked = true;
    await exam.save();

    // Save ProcessingRun metric document
    const runDoc = await ProcessingRun.create({
      runId,
      examId,
      examTitle: exam.title,
      mode: resultPayload.mode,
      recordCount: resultPayload.recordCount,
      workerCount: resultPayload.workerCount,
      chunkSize: resultPayload.chunkSize,
      chunkingStrategy: resultPayload.chunkingStrategy || 'none',
      stageTimings: resultPayload.stageTimings,
      totalTimeMs: resultPayload.totalTimeMs,
      speedup: resultPayload.speedup,
      efficiency: resultPayload.efficiency,
      throughput: resultPayload.throughput,
      memoryUsage: resultPayload.memoryUsage,
      status: 'completed',
      executedBy: req.user.id,
    });

    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'PROCESS_RESULTS',
      module: 'ProcessingEngine',
      details: `Processed results for "${exam.title}" in ${mode.toUpperCase()} mode (${resultPayload.recordCount} students, ${resultPayload.totalTimeMs}ms)`,
      newValue: { runId, totalTimeMs: resultPayload.totalTimeMs, throughput: resultPayload.throughput },
    });

    res.json({
      success: true,
      message: `Results processed successfully in ${mode} mode`,
      run: runDoc,
      summary: {
        totalStudents: resultPayload.recordCount,
        totalTimeMs: resultPayload.totalTimeMs,
        throughput: resultPayload.throughput,
        stageTimings: resultPayload.stageTimings,
        memoryUsage: resultPayload.memoryUsage,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Processing engine error', error: err.message });
  }
};

export const getProcessingRuns = async (req, res) => {
  try {
    const { examId, mode, limit = 20 } = req.query;
    const filter = {};
    if (examId) filter.examId = examId;
    if (mode) filter.mode = mode;

    const runs = await ProcessingRun.find(filter)
      .populate('executedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ success: true, count: runs.length, runs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
