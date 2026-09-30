import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const Department = mongoose.model('Department', DepartmentSchema);

const CourseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    department: { type: String, required: true, uppercase: true },
    durationYears: { type: Number, default: 4 },
    totalSemesters: { type: Number, default: 8 },
  },
  { timestamps: true }
);

export const Course = mongoose.model('Course', CourseSchema);

const SectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, uppercase: true, trim: true }, // e.g. 'A', 'B', 'C'
    department: { type: String, required: true, uppercase: true },
    semester: { type: Number, required: true },
    academicYear: { type: String, default: '2025-2026' },
    capacity: { type: Number, default: 60 },
  },
  { timestamps: true }
);

SectionSchema.index({ department: 1, semester: 1, name: 1 }, { unique: true });

export const Section = mongoose.model('Section', SectionSchema);

const SubjectSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, uppercase: true },
    semester: { type: Number, required: true, index: true },
    credits: { type: Number, required: true, default: 4, min: 1 },
    maxInternalMarks: { type: Number, required: true, default: 30 },
    maxExternalMarks: { type: Number, required: true, default: 70 },
    passingPercentage: { type: Number, required: true, default: 40 },
    isElective: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Subject = mongoose.model('Subject', SubjectSchema);

const GradingSchemeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: 'Default 10-Point Relative & Absolute' },
    isDefault: { type: Boolean, default: true },
    boundaries: [
      {
        grade: { type: String, required: true },
        label: { type: String },
        minPercentage: { type: Number, required: true },
        gradePoint: { type: Number, required: true },
      },
    ],
    passPercentagePerSubject: { type: Number, default: 40 },
    overallPassPercentage: { type: Number, default: 40 },
    maxGraceMarks: { type: Number, default: 5 },
  },
  { timestamps: true }
);

export const GradingScheme = mongoose.model('GradingScheme', GradingSchemeSchema);
