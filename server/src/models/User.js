import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../config/constants.js';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(ROLES), required: true, index: true },
    department: { type: String, trim: true },
    
    // For Students
    rollNumber: { type: String, unique: true, sparse: true, trim: true, index: true },
    semester: { type: Number },
    section: { type: String, trim: true },
    course: { type: String, trim: true },
    
    // For Teachers
    employeeId: { type: String, unique: true, sparse: true, trim: true },
    designation: { type: String, default: 'Assistant Professor' },
    assignedSubjects: [
      {
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
        subjectCode: String,
        subjectName: String,
        section: String,
        semester: Number,
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', UserSchema);
