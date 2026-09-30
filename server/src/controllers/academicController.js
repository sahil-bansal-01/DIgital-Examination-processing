import { Department, Course, Section, Subject, GradingScheme } from '../models/Academic.js';
import User from '../models/User.js';
import { ROLES, DEFAULT_GRADING_SCHEME } from '../config/constants.js';
import { logAudit } from '../middleware/audit.js';

// Departments
export const getDepartments = async (req, res) => {
  try {
    const list = await Department.find().sort({ code: 1 });
    res.json({ success: true, departments: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const dept = await Department.create({ name, code: code.toUpperCase(), description });
    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE_DEPARTMENT',
      module: 'AcademicSetup',
      details: `Created department ${code}`,
      newValue: dept,
    });
    res.status(201).json({ success: true, department: dept });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Courses
export const getCourses = async (req, res) => {
  try {
    const list = await Course.find().sort({ code: 1 });
    res.json({ success: true, courses: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, course });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Sections
export const getSections = async (req, res) => {
  try {
    const { department, semester } = req.query;
    const filter = {};
    if (department) filter.department = department.toUpperCase();
    if (semester) filter.semester = Number(semester);
    const list = await Section.find(filter).sort({ semester: 1, name: 1 });
    res.json({ success: true, sections: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createSection = async (req, res) => {
  try {
    const section = await Section.create(req.body);
    res.status(201).json({ success: true, section });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Subjects
export const getSubjects = async (req, res) => {
  try {
    const { department, semester } = req.query;
    const filter = {};
    if (department) filter.department = department.toUpperCase();
    if (semester) filter.semester = Number(semester);
    const list = await Subject.find(filter).sort({ code: 1 });
    res.json({ success: true, subjects: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE_SUBJECT',
      module: 'AcademicSetup',
      details: `Created subject ${subject.code} (${subject.name})`,
      newValue: subject,
    });
    res.status(201).json({ success: true, subject });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Teachers and Assignments
export const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: ROLES.TEACHER }).select('-password').sort({ name: 1 });
    res.json({ success: true, teachers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const assignTeacher = async (req, res) => {
  try {
    const { teacherId, subjectId, section, semester } = req.body;
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== ROLES.TEACHER) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const assignment = {
      subjectId: subject._id,
      subjectCode: subject.code,
      subjectName: subject.name,
      section: section.toUpperCase(),
      semester: semester || subject.semester,
    };

    // Prevent duplicates
    const exists = teacher.assignedSubjects.some(
      (a) => a.subjectCode === subject.code && a.section === assignment.section
    );
    if (!exists) {
      teacher.assignedSubjects.push(assignment);
      await teacher.save();
    }

    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'ASSIGN_TEACHER',
      module: 'AcademicSetup',
      details: `Assigned ${teacher.name} to ${subject.code} Section ${assignment.section}`,
      newValue: assignment,
    });

    res.json({ success: true, teacher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Students List
export const getStudents = async (req, res) => {
  try {
    const { department, semester, section, search } = req.query;
    const filter = { role: ROLES.STUDENT };
    if (department) filter.department = department.toUpperCase();
    if (semester) filter.semester = Number(semester);
    if (section) filter.section = section.toUpperCase();
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const students = await User.find(filter).select('-password').sort({ rollNumber: 1 });
    res.json({ success: true, count: students.length, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Grading Scheme
export const getGradingScheme = async (req, res) => {
  try {
    let scheme = await GradingScheme.findOne({ isDefault: true });
    if (!scheme) {
      scheme = await GradingScheme.create(DEFAULT_GRADING_SCHEME);
    }
    res.json({ success: true, gradingScheme: scheme });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateGradingScheme = async (req, res) => {
  try {
    let scheme = await GradingScheme.findOne({ isDefault: true });
    const oldVal = scheme ? scheme.toObject() : null;
    if (!scheme) {
      scheme = new GradingScheme({ ...req.body, isDefault: true });
    } else {
      Object.assign(scheme, req.body);
    }
    await scheme.save();

    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPDATE_GRADING_SCHEME',
      module: 'AcademicSetup',
      details: 'Updated global grading boundaries and pass criteria',
      oldValue: oldVal,
      newValue: scheme,
    });

    res.json({ success: true, gradingScheme: scheme });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
