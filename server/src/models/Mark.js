import mongoose from 'mongoose';

const MarkSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rollNumber: { type: String, required: true, index: true },
    studentName: { type: String },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    subjectCode: { type: String, required: true, uppercase: true },
    department: { type: String, uppercase: true },
    semester: { type: Number },
    section: { type: String, uppercase: true, index: true },
    
    internalMarks: { type: Number, default: 0, min: 0 },
    externalMarks: { type: Number, default: 0, min: 0 },
    totalMarks: { type: Number, default: 0, min: 0 },
    isAbsent: { type: Boolean, default: false },
    
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MarkSchema.index({ exam: 1, student: 1, subject: 1 }, { unique: true });
MarkSchema.index({ exam: 1, section: 1 });

// Automatically compute totalMarks on save
MarkSchema.pre('save', function (next) {
  if (this.isAbsent) {
    this.internalMarks = 0;
    this.externalMarks = 0;
    this.totalMarks = 0;
  } else {
    this.totalMarks = (this.internalMarks || 0) + (this.externalMarks || 0);
  }
  next();
});

export const Mark = mongoose.model('Mark', MarkSchema);
