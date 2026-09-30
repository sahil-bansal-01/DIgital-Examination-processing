import { Mark } from '../models/Mark.js';
import { Exam } from '../models/Exam.js';
import { Subject } from '../models/Academic.js';
import User from '../models/User.js';
import { logAudit } from '../middleware/audit.js';
import { ROLES } from '../config/constants.js';

export const getMarks = async (req, res) => {
  try {
    const { examId, subjectId, section } = req.query;
    if (!examId) return res.status(400).json({ success: false, message: 'examId is required' });

    const filter = { exam: examId };
    if (subjectId) filter.subject = subjectId;
    if (section) filter.section = section.toUpperCase();

    const marks = await Mark.find(filter)
      .populate('student', 'name rollNumber section')
      .populate('subject', 'code name credits maxInternalMarks maxExternalMarks')
      .sort({ rollNumber: 1 });

    res.json({ success: true, count: marks.length, marks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const batchSaveMarks = async (req, res) => {
  try {
    const { examId, subjectId, section, marks } = req.body;
    if (!examId || !subjectId || !Array.isArray(marks)) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    if (exam.isMarksEntryLocked) {
      return res.status(403).json({ success: false, message: 'Marks entry is locked for this exam.' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    // Role check for teachers: verify assignment
    if (req.user.role === ROLES.TEACHER) {
      const isAssigned = req.user.assignedSubjects?.some(
        (a) => a.subjectCode === subject.code && (!section || a.section === section.toUpperCase())
      );
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: `You are not assigned to enter marks for ${subject.code} Section ${section || 'Any'}`,
        });
      }
    }

    const updated = [];
    const auditChanges = [];

    for (const item of marks) {
      const { rollNumber, internalMarks, externalMarks, isAbsent } = item;
      if (!rollNumber) continue;

      let student = await User.findOne({ rollNumber: rollNumber.trim() });
      if (!student) continue;

      const filter = { exam: examId, student: student._id, subject: subjectId };
      const existing = await Mark.findOne(filter);

      const internal = isAbsent ? 0 : Math.min(subject.maxInternalMarks, Math.max(0, Number(internalMarks || 0)));
      const external = isAbsent ? 0 : Math.min(subject.maxExternalMarks, Math.max(0, Number(externalMarks || 0)));
      const total = internal + external;

      if (existing) {
        const oldVal = { internal: existing.internalMarks, external: existing.externalMarks, total: existing.totalMarks };
        existing.internalMarks = internal;
        existing.externalMarks = external;
        existing.totalMarks = total;
        existing.isAbsent = !!isAbsent;
        existing.enteredBy = req.user.id;
        await existing.save();
        updated.push(existing);

        auditChanges.push({
          rollNumber,
          oldValue: oldVal,
          newValue: { internal, external, total, isAbsent },
        });
      } else {
        const newMark = await Mark.create({
          exam: examId,
          student: student._id,
          rollNumber: student.rollNumber,
          studentName: student.name,
          subject: subjectId,
          subjectCode: subject.code,
          department: student.department || exam.department,
          semester: exam.semester,
          section: section ? section.toUpperCase() : student.section || 'A',
          internalMarks: internal,
          externalMarks: external,
          totalMarks: total,
          isAbsent: !!isAbsent,
          enteredBy: req.user.id,
        });
        updated.push(newMark);
        auditChanges.push({
          rollNumber,
          oldValue: null,
          newValue: { internal, external, total, isAbsent },
        });
      }
    }

    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPDATE_MARKS_BATCH',
      module: 'MarksEntry',
      details: `Saved ${updated.length} mark records for ${subject.code} (${exam.title})`,
      newValue: auditChanges.slice(0, 10), // sample first 10 for log brevity
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Successfully saved ${updated.length} mark records`,
      count: updated.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Validates raw rows from CSV or spreadsheet upload
 * Returns clean validation report with exact line/roll errors
 */
export const validateAndUploadMarksCSV = async (req, res) => {
  try {
    const { examId, subjectId, section, rows } = req.body;
    if (!examId || !subjectId || !Array.isArray(rows)) {
      return res.status(400).json({ success: false, message: 'Invalid payload. rows array is required.' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    if (exam.isMarksEntryLocked) {
      return res.status(403).json({ success: false, message: 'Marks entry is locked for this exam.' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    const errors = [];
    const validRecords = [];
    const seenRollNumbers = new Set();

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNum = index + 1;
      const rollNumber = (row.rollNumber || row['Roll Number'] || row['RollNo'] || '').toString().trim();

      if (!rollNumber) {
        errors.push({ row: rowNum, rollNumber: 'N/A', error: 'Missing roll number' });
        continue;
      }

      if (seenRollNumbers.has(rollNumber.toUpperCase())) {
        errors.push({ row: rowNum, rollNumber, error: 'Duplicate roll number in upload file' });
        continue;
      }
      seenRollNumbers.add(rollNumber.toUpperCase());

      const student = await User.findOne({ rollNumber: rollNumber });
      if (!student) {
        errors.push({ row: rowNum, rollNumber, error: `Student with roll number "${rollNumber}" not found in system` });
        continue;
      }

      const isAbsent = Boolean(
        row.isAbsent === true ||
        row.isAbsent === 'true' ||
        row.isAbsent === '1' ||
        String(row.status || '').toUpperCase() === 'AB'
      );

      const rawInternal = row.internalMarks !== undefined ? row.internalMarks : row['Internal Marks'];
      const rawExternal = row.externalMarks !== undefined ? row.externalMarks : row['External Marks'];

      const internal = Number(rawInternal || 0);
      const external = Number(rawExternal || 0);

      if (!isAbsent) {
        if (isNaN(internal) || internal < 0) {
          errors.push({ row: rowNum, rollNumber, error: `Internal marks must be a positive number (found "${rawInternal}")` });
          continue;
        }
        if (internal > subject.maxInternalMarks) {
          errors.push({ row: rowNum, rollNumber, error: `Internal marks (${internal}) exceeds maximum allowed (${subject.maxInternalMarks})` });
          continue;
        }
        if (isNaN(external) || external < 0) {
          errors.push({ row: rowNum, rollNumber, error: `External marks must be a positive number (found "${rawExternal}")` });
          continue;
        }
        if (external > subject.maxExternalMarks) {
          errors.push({ row: rowNum, rollNumber, error: `External marks (${external}) exceeds maximum allowed (${subject.maxExternalMarks})` });
          continue;
        }
      }

      validRecords.push({
        studentId: student._id,
        rollNumber: student.rollNumber,
        studentName: student.name,
        section: section ? section.toUpperCase() : student.section || 'A',
        internalMarks: isAbsent ? 0 : internal,
        externalMarks: isAbsent ? 0 : external,
        isAbsent,
      });
    }

    // If commit flag is set, save the valid records to DB
    const commit = req.body.commit === true;
    let savedCount = 0;

    if (commit && validRecords.length > 0) {
      for (const rec of validRecords) {
        const total = rec.isAbsent ? 0 : rec.internalMarks + rec.externalMarks;
        await Mark.findOneAndUpdate(
          { exam: examId, student: rec.studentId, subject: subjectId },
          {
            exam: examId,
            student: rec.studentId,
            rollNumber: rec.rollNumber,
            studentName: rec.studentName,
            subject: subjectId,
            subjectCode: subject.code,
            department: exam.department,
            semester: exam.semester,
            section: rec.section,
            internalMarks: rec.internalMarks,
            externalMarks: rec.externalMarks,
            totalMarks: total,
            isAbsent: rec.isAbsent,
            enteredBy: req.user.id,
          },
          { upsert: true, new: true }
        );
        savedCount++;
      }

      await logAudit({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'CSV_MARKS_UPLOAD',
        module: 'MarksEntry',
        details: `Imported ${savedCount} records via CSV for ${subject.code} (${exam.title}). ${errors.length} validation errors flagged.`,
        newValue: { savedCount, errorCount: errors.length },
      });
    }

    res.json({
      success: true,
      totalRows: rows.length,
      validCount: validRecords.length,
      errorCount: errors.length,
      errors,
      committed: commit,
      savedCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
