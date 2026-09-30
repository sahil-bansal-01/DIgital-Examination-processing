import { DEFAULT_GRADING_SCHEME } from '../config/constants.js';

/**
 * Calculates grade and grade point for a given percentage based on grading scheme boundaries
 */
export const calculateGrade = (percentage, boundaries = DEFAULT_GRADING_SCHEME.boundaries) => {
  // Sort boundaries descending by minPercentage
  const sorted = [...boundaries].sort((a, b) => b.minPercentage - a.minPercentage);
  for (const b of sorted) {
    if (percentage >= b.minPercentage) {
      return { grade: b.grade, gradePoint: b.gradePoint, label: b.label };
    }
  }
  return { grade: 'F', gradePoint: 0, label: 'Fail' };
};

/**
 * Evaluates a single student record with all their subject marks
 * Can be run in main thread (sequential) or worker thread (parallel)
 */
export const processStudentRecord = (studentRecord, gradingScheme = DEFAULT_GRADING_SCHEME) => {
  const { studentId, rollNumber, studentName, department, semester, section, marks = [] } = studentRecord;
  
  const boundaries = gradingScheme.boundaries || DEFAULT_GRADING_SCHEME.boundaries;
  const passPercentagePerSubject = gradingScheme.passPercentagePerSubject || 40;
  const maxGraceMarks = gradingScheme.maxGraceMarks || 5;

  let totalMarksObtained = 0;
  let maxPossibleMarks = 0;
  let totalWeightedGradePoints = 0;
  let totalCredits = 0;
  let backlogCount = 0;
  const backlogSubjects = [];
  const subjectResults = [];

  for (const mark of marks) {
    const internal = mark.isAbsent ? 0 : Number(mark.internalMarks || 0);
    const external = mark.isAbsent ? 0 : Number(mark.externalMarks || 0);
    let total = internal + external;
    const maxSubjectMarks = (mark.maxInternalMarks || 30) + (mark.maxExternalMarks || 70);
    const passingMarksRequired = Math.ceil((passPercentagePerSubject / 100) * maxSubjectMarks);
    
    maxPossibleMarks += maxSubjectMarks;
    let graceGiven = 0;
    let isPass = false;

    if (!mark.isAbsent) {
      if (total >= passingMarksRequired) {
        isPass = true;
      } else if (total + maxGraceMarks >= passingMarksRequired) {
        // Award grace marks
        graceGiven = passingMarksRequired - total;
        total = passingMarksRequired;
        isPass = true;
      }
    }

    const percentage = mark.isAbsent ? 0 : (total / maxSubjectMarks) * 100;
    const gradeInfo = mark.isAbsent
      ? { grade: 'AB', gradePoint: 0 }
      : isPass
      ? calculateGrade(percentage, boundaries)
      : { grade: 'F', gradePoint: 0 };

    totalMarksObtained += total;
    const credits = Number(mark.credits || 4);
    totalCredits += credits;
    totalWeightedGradePoints += credits * gradeInfo.gradePoint;

    if (!isPass) {
      backlogCount++;
      backlogSubjects.push(mark.subjectCode);
    }

    subjectResults.push({
      subjectId: mark.subjectId,
      subjectCode: mark.subjectCode,
      subjectName: mark.subjectName,
      credits,
      maxInternalMarks: mark.maxInternalMarks || 30,
      maxExternalMarks: mark.maxExternalMarks || 70,
      internalMarks: internal,
      externalMarks: external,
      totalMarks: total,
      percentage: Number(percentage.toFixed(2)),
      grade: gradeInfo.grade,
      gradePoint: gradeInfo.gradePoint,
      isPass,
      graceMarksGiven: graceGiven,
      isAbsent: !!mark.isAbsent,
    });
  }

  const overallPercentage = maxPossibleMarks > 0 ? (totalMarksObtained / maxPossibleMarks) * 100 : 0;
  const sgpa = totalCredits > 0 ? totalWeightedGradePoints / totalCredits : 0;
  const status = backlogCount === 0 ? 'PASS' : 'FAIL';

  return {
    studentId,
    rollNumber,
    studentName,
    department,
    semester,
    section,
    subjectResults,
    totalMarksObtained,
    maxPossibleMarks,
    percentage: Number(overallPercentage.toFixed(2)),
    sgpa: Number(sgpa.toFixed(2)),
    cgpa: Number(sgpa.toFixed(2)), // For single semester or default
    status,
    backlogCount,
    backlogSubjects,
  };
};
