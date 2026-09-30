import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import { Department, Course, Section, Subject, GradingScheme } from '../models/Academic.js';
import { Exam } from '../models/Exam.js';
import { Mark } from '../models/Mark.js';
import { Result } from '../models/Result.js';
import { AuditLog, ProcessingRun, ReEvaluation } from '../models/LogsAndRuns.js';
import { ROLES, EXAM_STATUSES, EXAM_TYPES, DEFAULT_GRADING_SCHEME } from '../config/constants.js';
import { processStudentRecord } from '../services/calculationService.js';
import { computeRanks } from '../services/rankingService.js';

dotenv.config();

export const seedDatabase = async () => {
  console.log('🌱 Starting Digital EPS Database Seeding...');
  await connectDB();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Course.deleteMany({}),
    Section.deleteMany({}),
    Subject.deleteMany({}),
    GradingScheme.deleteMany({}),
    Exam.deleteMany({}),
    Mark.deleteMany({}),
    Result.deleteMany({}),
    AuditLog.deleteMany({}),
    ProcessingRun.deleteMany({}),
    ReEvaluation.deleteMany({}),
  ]);

  console.log('🧹 Cleaned existing database records.');

  // 1. Departments
  const deptCSE = await Department.create({
    name: 'Computer Science & Engineering',
    code: 'CSE',
    description: 'Department of Computer Science and Parallel Systems',
  });
  const deptECE = await Department.create({
    name: 'Electronics & Communication Engineering',
    code: 'ECE',
    description: 'Department of Electronics and VLSI Design',
  });

  // 2. Courses
  const courseBTech = await Course.create({
    name: 'Bachelor of Technology in Computer Science',
    code: 'BTECH-CSE',
    department: 'CSE',
    durationYears: 4,
    totalSemesters: 8,
  });

  // 3. Sections
  const secA = await Section.create({
    name: 'A',
    department: 'CSE',
    semester: 3,
    academicYear: '2025-2026',
    capacity: 60,
  });
  const secB = await Section.create({
    name: 'B',
    department: 'CSE',
    semester: 3,
    academicYear: '2025-2026',
    capacity: 60,
  });

  // 4. Subjects for Semester 3
  const subjectsData = [
    {
      code: 'CS301',
      name: 'Computer Architecture & Parallel Processing',
      department: 'CSE',
      semester: 3,
      credits: 4,
      maxInternalMarks: 30,
      maxExternalMarks: 70,
      passingPercentage: 40,
    },
    {
      code: 'CS302',
      name: 'Database Management Systems',
      department: 'CSE',
      semester: 3,
      credits: 4,
      maxInternalMarks: 30,
      maxExternalMarks: 70,
      passingPercentage: 40,
    },
    {
      code: 'CS303',
      name: 'Operating Systems',
      department: 'CSE',
      semester: 3,
      credits: 4,
      maxInternalMarks: 30,
      maxExternalMarks: 70,
      passingPercentage: 40,
    },
    {
      code: 'CS304',
      name: 'Design & Analysis of Algorithms',
      department: 'CSE',
      semester: 3,
      credits: 4,
      maxInternalMarks: 30,
      maxExternalMarks: 70,
      passingPercentage: 40,
    },
    {
      code: 'CS305',
      name: 'Computer Networks',
      department: 'CSE',
      semester: 3,
      credits: 3,
      maxInternalMarks: 30,
      maxExternalMarks: 70,
      passingPercentage: 40,
    },
    {
      code: 'CS306',
      name: 'Software Engineering & Agile Methodologies',
      department: 'CSE',
      semester: 3,
      credits: 3,
      maxInternalMarks: 30,
      maxExternalMarks: 70,
      passingPercentage: 40,
    },
  ];
  const subjects = await Subject.insertMany(subjectsData);
  console.log(`📚 Created ${subjects.length} subjects.`);

  // 5. Grading Scheme
  const gradingScheme = await GradingScheme.create(DEFAULT_GRADING_SCHEME);
  console.log('📊 Initialized Default 10-Point Relative & Absolute Grading Scheme.');

  // 6. Admin User
  const adminUser = await User.create({
    name: 'Prof. Rajesh Khanna (Exam Controller)',
    email: 'admin@eps.edu',
    password: 'Password@123',
    role: ROLES.ADMIN,
    department: 'CSE',
  });

  // 7. Teachers
  const teacherSharma = await User.create({
    name: 'Dr. Neha Sharma',
    email: 'teacher@eps.edu', // primary demo teacher
    password: 'Password@123',
    role: ROLES.TEACHER,
    department: 'CSE',
    employeeId: 'EMP-CSE-101',
    designation: 'Associate Professor',
    assignedSubjects: [
      {
        subjectId: subjects[0]._id,
        subjectCode: subjects[0].code,
        subjectName: subjects[0].name,
        section: 'A',
        semester: 3,
      },
      {
        subjectId: subjects[0]._id,
        subjectCode: subjects[0].code,
        subjectName: subjects[0].name,
        section: 'B',
        semester: 3,
      },
      {
        subjectId: subjects[1]._id,
        subjectCode: subjects[1].code,
        subjectName: subjects[1].name,
        section: 'A',
        semester: 3,
      },
    ],
  });

  const teacherVerma = await User.create({
    name: 'Prof. Amit Verma',
    email: 'verma@eps.edu',
    password: 'Password@123',
    role: ROLES.TEACHER,
    department: 'CSE',
    employeeId: 'EMP-CSE-102',
    designation: 'Assistant Professor',
    assignedSubjects: [
      {
        subjectId: subjects[2]._id,
        subjectCode: subjects[2].code,
        subjectName: subjects[2].name,
        section: 'A',
        semester: 3,
      },
      {
        subjectId: subjects[3]._id,
        subjectCode: subjects[3].code,
        subjectName: subjects[3].name,
        section: 'A',
        semester: 3,
      },
    ],
  });

  console.log('👨‍🏫 Seeded Admin and Teachers.');

  // 8. Students: 40 Students (20 in Section A, 20 in Section B)
  const studentNames = [
    'Aarav Patel', 'Diya Sen', 'Rohan Gupta', 'Ananya Sharma', 'Kabir Mehta',
    'Ishita Roy', 'Aryan Verma', 'Sanya Iyer', 'Aditya Joshi', 'Kavya Nair',
    'Vivaan Malhotra', 'Tanvi Saxena', 'Karan Singhania', 'Rhea Kapoor', 'Dev Dixit',
    'Mira Deshmukh', 'Yashwant Rao', 'Pooja Bhatt', 'Manish Pandey', 'Simran Kaur',
    'Gaurav Chopra', 'Sneha Reddy', 'Nikhil Agarwal', 'Priya Kulkarni', 'Siddharth Bose',
    'Meera Pillai', 'Varun Dhawan', 'Alia Sengupta', 'Kartik Aaryan', 'Tara Sutaria',
    'Harsh Vardhan', 'Avani Chaturvedi', 'Samarth Jain', 'Khushi Mukherjee', 'Arjun Das',
    'Nisha Goyal', 'Pranav Anand', 'Deepika Menon', 'Abhimanyu Roy', 'Bhavna Chauhan'
  ];

  const students = [];
  for (let i = 0; i < studentNames.length; i++) {
    const rollNumber = `24CS${String(i + 1).padStart(3, '0')}`;
    const section = i < 20 ? 'A' : 'B';
    const email = i === 0 ? 'student@eps.edu' : `student${i + 1}@eps.edu`;

    const std = await User.create({
      name: studentNames[i],
      email,
      password: 'Password@123',
      role: ROLES.STUDENT,
      department: 'CSE',
      rollNumber,
      semester: 3,
      section,
      course: 'BTECH-CSE',
    });
    students.push(std);
  }
  console.log(`🎓 Seeded ${students.length} students across Sections A & B.`);

  // 9. Exams
  const examEndTerm = await Exam.create({
    title: 'Semester 3 End-Term Examinations 2025-26',
    type: EXAM_TYPES.END_TERM,
    department: 'CSE',
    semester: 3,
    academicYear: '2025-2026',
    startDate: new Date('2026-05-10'),
    status: EXAM_STATUSES.MARKS_ENTRY,
    isMarksEntryLocked: false,
    subjects: subjects.map((s) => s._id),
    gradingScheme: gradingScheme._id,
    createdBy: adminUser._id,
  });

  const examMidTerm = await Exam.create({
    title: 'Semester 3 Mid-Term Examinations 2025-26',
    type: EXAM_TYPES.MID_TERM,
    department: 'CSE',
    semester: 3,
    academicYear: '2025-2026',
    startDate: new Date('2026-02-15'),
    status: EXAM_STATUSES.PUBLISHED,
    isMarksEntryLocked: true,
    subjects: subjects.map((s) => s._id),
    gradingScheme: gradingScheme._id,
    createdBy: adminUser._id,
  });

  console.log('📝 Created End-Term and Mid-Term Exams.');

  // 10. Generate Marks for both exams
  const generateMarksForExam = async (examObj) => {
    const markDocs = [];
    for (const std of students) {
      for (const sub of subjects) {
        // Deterministic realistic scores
        const seedVal = (parseInt(std.rollNumber.replace(/\D/g, ''), 10) * 17 + sub.code.charCodeAt(2) * 13) % 100;
        const isAbsent = seedVal === 99; // rare absent
        const internal = isAbsent ? 0 : 18 + (seedVal % 12); // 18 - 29
        const external = isAbsent ? 0 : 28 + (seedVal % 42); // 28 - 69
        const total = internal + external;

        markDocs.push({
          exam: examObj._id,
          student: std._id,
          rollNumber: std.rollNumber,
          studentName: std.name,
          subject: sub._id,
          subjectCode: sub.code,
          department: 'CSE',
          semester: 3,
          section: std.section,
          internalMarks: internal,
          externalMarks: external,
          totalMarks: total,
          isAbsent,
          enteredBy: teacherSharma._id,
        });
      }
    }
    return Mark.insertMany(markDocs);
  };

  const endTermMarks = await generateMarksForExam(examEndTerm);
  const midTermMarks = await generateMarksForExam(examMidTerm);
  console.log(`📊 Generated ${endTermMarks.length + midTermMarks.length} subject marks.`);

  // 11. Compute and publish Results for Mid-Term Exam so the Student Dashboard has immediate data!
  const subjectsMap = new Map();
  subjects.forEach((s) => subjectsMap.set(s.code, s));

  const studentResults = [];
  for (const std of students) {
    const studentMarks = midTermMarks.filter((m) => m.student.toString() === std._id.toString());
    const studentRecord = {
      studentId: std._id,
      rollNumber: std.rollNumber,
      studentName: std.name,
      department: std.department,
      semester: std.semester,
      section: std.section,
      marks: studentMarks.map((m) => {
        const sub = subjectsMap.get(m.subjectCode);
        return {
          subjectId: sub._id,
          subjectCode: sub.code,
          subjectName: sub.name,
          credits: sub.credits,
          maxInternalMarks: sub.maxInternalMarks,
          maxExternalMarks: sub.maxExternalMarks,
          internalMarks: m.internalMarks,
          externalMarks: m.externalMarks,
          isAbsent: m.isAbsent,
        };
      }),
    };

    const evaluated = processStudentRecord(studentRecord, DEFAULT_GRADING_SCHEME);
    studentResults.push(evaluated);
  }

  const rankedMidTerm = computeRanks(studentResults);
  const midTermResultDocs = rankedMidTerm.map((r) => ({
    exam: examMidTerm._id,
    student: r.studentId,
    rollNumber: r.rollNumber,
    studentName: r.studentName,
    department: r.department,
    semester: r.semester,
    section: r.section,
    subjectResults: r.subjectResults,
    totalMarksObtained: r.totalMarksObtained,
    maxPossibleMarks: r.maxPossibleMarks,
    percentage: r.percentage,
    sgpa: r.sgpa,
    cgpa: r.cgpa,
    status: r.status,
    backlogCount: r.backlogCount,
    backlogSubjects: r.backlogSubjects,
    sectionRank: r.sectionRank,
    overallRank: r.overallRank,
  }));
  await Result.insertMany(midTermResultDocs);
  console.log(`🏆 Published results for Mid-Term (${midTermResultDocs.length} students ranked).`);

  // 12. Create a demo Re-Evaluation Request for student 1
  const student1 = students[0];
  const demoReEval = await ReEvaluation.create({
    student: student1._id,
    studentName: student1.name,
    rollNumber: student1.rollNumber,
    exam: examMidTerm._id,
    examTitle: examMidTerm.title,
    subject: subjects[0]._id,
    subjectCode: subjects[0].code,
    subjectName: subjects[0].name,
    previousInternal: 22,
    previousExternal: 48,
    previousTotal: 70,
    previousGrade: 'A',
    requestedComponent: 'external',
    reason: 'Marks in Question 4B were not tabulated correctly in the answer booklet.',
    status: 'pending',
  });

  // 13. Audit Log entries
  await AuditLog.create([
    {
      userId: adminUser._id,
      userName: adminUser.name,
      userRole: ROLES.ADMIN,
      action: 'SYSTEM_INITIALIZATION',
      module: 'Seed',
      details: 'Initialized Digital EPS database with academic schemas, faculty, and candidate batches',
    },
    {
      userId: teacherSharma._id,
      userName: teacherSharma.name,
      userRole: ROLES.TEACHER,
      action: 'ENTER_MARKS',
      module: 'MarksEntry',
      details: 'Submitted marks for CS301 Section A & B',
    },
  ]);

  console.log('\n======================================================');
  console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('------------------------------------------------------');
  console.log('Demo Credentials:');
  console.log('  👑 Admin:   admin@eps.edu    / Password@123');
  console.log('  👨‍🏫 Teacher: teacher@eps.edu  / Password@123');
  console.log('  🎓 Student: student@eps.edu  / Password@123 (Roll: 24CS001)');
  console.log('======================================================\n');
};

// Run if called directly
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(async () => {
      await closeDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ Seeding failed:', err);
      await closeDB();
      process.exit(1);
    });
}
