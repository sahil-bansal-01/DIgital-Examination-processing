import { Exam } from '../models/Exam.js';
import { Subject } from '../models/Academic.js';
import { logAudit } from '../middleware/audit.js';
import { EXAM_STATUSES } from '../config/constants.js';

export const getExams = async (req, res) => {
  try {
    const { department, semester, status } = req.query;
    const filter = {};
    if (department) filter.department = department.toUpperCase();
    if (semester) filter.semester = Number(semester);
    if (status) filter.status = status;

    const exams = await Exam.find(filter)
      .populate('subjects')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, exams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('subjects')
      .populate('gradingScheme')
      .populate('createdBy', 'name email');

    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createExam = async (req, res) => {
  try {
    const { title, type, department, semester, academicYear, startDate, subjects } = req.body;
    
    // Find subject IDs for department and semester if not explicitly passed
    let subjectIds = subjects;
    if (!subjectIds || subjectIds.length === 0) {
      const subs = await Subject.find({ department: department.toUpperCase(), semester: Number(semester) });
      subjectIds = subs.map((s) => s._id);
    }

    const exam = await Exam.create({
      title,
      type,
      department: department.toUpperCase(),
      semester: Number(semester),
      academicYear: academicYear || '2025-2026',
      startDate: startDate || new Date(),
      status: EXAM_STATUSES.SCHEDULED,
      subjects: subjectIds,
      createdBy: req.user.id,
    });

    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE_EXAM',
      module: 'ExamManagement',
      details: `Created exam "${exam.title}" (${exam.type}) for ${department} Sem-${semester}`,
      newValue: exam,
    });

    res.status(201).json({ success: true, exam });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateExamStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!Object.values(EXAM_STATUSES).includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid exam status' });
    }

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const oldStatus = exam.status;
    exam.status = status;
    if (status === EXAM_STATUSES.PUBLISHED) {
      exam.isMarksEntryLocked = true;
    }
    await exam.save();

    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPDATE_EXAM_STATUS',
      module: 'ExamManagement',
      details: `Changed status of "${exam.title}" from "${oldStatus}" to "${status}"`,
      oldValue: { status: oldStatus },
      newValue: { status },
    });

    res.json({ success: true, exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleLockMarksEntry = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const previousLock = exam.isMarksEntryLocked;
    exam.isMarksEntryLocked = !previousLock;
    await exam.save();

    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: exam.isMarksEntryLocked ? 'LOCK_MARKS_ENTRY' : 'UNLOCK_MARKS_ENTRY',
      module: 'ExamManagement',
      details: `${exam.isMarksEntryLocked ? 'Locked' : 'Unlocked'} marks entry for "${exam.title}"`,
      oldValue: { isMarksEntryLocked: previousLock },
      newValue: { isMarksEntryLocked: exam.isMarksEntryLocked },
    });

    res.json({
      success: true,
      message: `Marks entry ${exam.isMarksEntryLocked ? 'locked' : 'unlocked'} successfully`,
      isMarksEntryLocked: exam.isMarksEntryLocked,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
