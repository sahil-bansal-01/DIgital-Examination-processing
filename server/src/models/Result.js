import mongoose from 'mongoose';

const SubjectResultSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    subjectCode: { type: String, required: true },
    subjectName: { type: String, required: true },
    credits: { type: Number, required: true },
    maxInternalMarks: { type: Number, default: 30 },
    maxExternalMarks: { type: Number, default: 70 },
    internalMarks: { type: Number, default: 0 },
    externalMarks: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    grade: { type: String, required: true },
    gradePoint: { type: Number, required: true },
    isPass: { type: Boolean, required: true },
    graceMarksGiven: { type: Number, default: 0 },
    isAbsent: { type: Boolean, default: false },
  },
  { _id: false }
);

const ResultSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rollNumber: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    department: { type: String, required: true, uppercase: true, index: true },
    semester: { type: Number, required: true, index: true },
    section: { type: String, required: true, uppercase: true, index: true },
    
    subjectResults: [SubjectResultSchema],
    
    totalMarksObtained: { type: Number, required: true },
    maxPossibleMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    sgpa: { type: Number, required: true },
    cgpa: { type: Number, default: 0 },
    status: { type: String, enum: ['PASS', 'FAIL', 'WITHHELD'], required: true, index: true },
    backlogCount: { type: Number, default: 0 },
    backlogSubjects: [{ type: String }],
    
    sectionRank: { type: Number },
    overallRank: { type: Number },
    
    processingRunId: { type: String },
    processedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ResultSchema.index({ exam: 1, student: 1 }, { unique: true });
ResultSchema.index({ exam: 1, section: 1, overallRank: 1 });

export const Result = mongoose.model('Result', ResultSchema);
