export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

export const EXAM_STATUSES = {
  SCHEDULED: 'Scheduled',
  MARKS_ENTRY: 'Marks Entry',
  PROCESSING: 'Processing',
  PUBLISHED: 'Published',
};

export const EXAM_TYPES = {
  MID_TERM: 'mid-term',
  END_TERM: 'end-term',
  RE_EXAM: 're-exam',
};

export const DEFAULT_GRADING_SCHEME = {
  name: 'Standard 10-Point Relative & Absolute Grading',
  boundaries: [
    { grade: 'O', label: 'Outstanding', minPercentage: 90, gradePoint: 10 },
    { grade: 'A+', label: 'Excellent', minPercentage: 80, gradePoint: 9 },
    { grade: 'A', label: 'Very Good', minPercentage: 70, gradePoint: 8 },
    { grade: 'B+', label: 'Good', minPercentage: 60, gradePoint: 7 },
    { grade: 'B', label: 'Above Average', minPercentage: 50, gradePoint: 6 },
    { grade: 'C', label: 'Average', minPercentage: 45, gradePoint: 5 },
    { grade: 'P', label: 'Pass', minPercentage: 40, gradePoint: 4 },
    { grade: 'F', label: 'Fail', minPercentage: 0, gradePoint: 0 },
  ],
  passPercentagePerSubject: 40,
  overallPassPercentage: 40,
  maxGraceMarks: 5,
};
