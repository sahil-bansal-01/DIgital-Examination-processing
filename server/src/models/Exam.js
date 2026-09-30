import mongoose from 'mongoose';
import { EXAM_STATUSES, EXAM_TYPES } from '../config/constants.js';

const ExamSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: Object.values(EXAM_TYPES), default: EXAM_TYPES.END_TERM },
    department: { type: String, required: true, uppercase: true },
    semester: { type: Number, required: true },
    academicYear: { type: String, required: true, default: '2025-2026' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: {
      type: String,
      enum: Object.values(EXAM_STATUSES),
      default: EXAM_STATUSES.SCHEDULED,
      index: true,
    },
    isMarksEntryLocked: { type: Boolean, default: false },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    gradingScheme: { type: mongoose.Schema.Types.ObjectId, ref: 'GradingScheme' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Exam = mongoose.model('Exam', ExamSchema);
