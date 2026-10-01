import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    action: { type: String, required: true }, // e.g. 'UPDATE_MARKS', 'LOCK_EXAM', 'PROCESS_RESULTS', 'APPROVE_REEVAL'
    module: { type: String, required: true }, // e.g. 'MarksEntry', 'ExamManagement', 'ProcessingEngine'
    details: { type: String },
    oldValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

const ProcessingRunSchema = new mongoose.Schema(
  {
    runId: { type: String, required: true, unique: true, index: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
    examTitle: { type: String },
    mode: { type: String, enum: ['sequential', 'parallel'], required: true },
    recordCount: { type: Number, required: true },
    workerCount: { type: Number, default: 1 },
    chunkSize: { type: Number, default: 0 },
    chunkingStrategy: { type: String, default: 'fixed-batch' },
    
    stageTimings: {
      fetch: { type: Number, default: 0 },
      validate: { type: Number, default: 0 },
      compute: { type: Number, default: 0 },
      rank: { type: Number, default: 0 },
      merge: { type: Number, default: 0 },
      save: { type: Number, default: 0 },
    },
    chunks: [
      {
        chunkId: { type: Number },
        workerId: { type: Number },
        startTime: { type: Number },
        endTime: { type: Number },
        durationMs: { type: Number },
        recordCount: { type: Number },
      },
    ],
    totalTimeMs: { type: Number, required: true },
    speedup: { type: Number, default: 1 },
    efficiency: { type: Number, default: 1 },
    throughput: { type: Number, default: 0 }, // records per second
    
    memoryUsage: {
      heapUsedMB: { type: Number },
      rssMB: { type: Number },
    },
    
    status: { type: String, enum: ['completed', 'failed'], default: 'completed' },
    error: { type: String },
    executedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ProcessingRunSchema.index({ createdAt: -1 });

export const ProcessingRun = mongoose.model('ProcessingRun', ProcessingRunSchema);

const ReEvaluationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentName: { type: String, required: true },
    rollNumber: { type: String, required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
    examTitle: { type: String },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    subjectCode: { type: String, required: true },
    subjectName: { type: String, required: true },
    
    previousInternal: { type: Number },
    previousExternal: { type: Number },
    previousTotal: { type: Number },
    previousGrade: { type: String },
    
    requestedComponent: { type: String, enum: ['internal', 'external', 'both'], default: 'external' },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    
    updatedInternal: { type: Number },
    updatedExternal: { type: Number },
    updatedTotal: { type: Number },
    updatedGrade: { type: String },
    
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewRemarks: { type: String },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export const ReEvaluation = mongoose.model('ReEvaluation', ReEvaluationSchema);
