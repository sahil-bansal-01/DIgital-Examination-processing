import express from 'express';
import {
  getDepartments,
  createDepartment,
  getCourses,
  createCourse,
  getSections,
  createSection,
  getSubjects,
  createSubject,
  getTeachers,
  assignTeacher,
  getStudents,
  getGradingScheme,
  updateGradingScheme,
} from '../controllers/academicController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);

// Public read to authenticated users, Admin write
router.get('/departments', getDepartments);
router.post('/departments', authorize(ROLES.ADMIN), createDepartment);

router.get('/courses', getCourses);
router.post('/courses', authorize(ROLES.ADMIN), createCourse);

router.get('/sections', getSections);
router.post('/sections', authorize(ROLES.ADMIN), createSection);

router.get('/subjects', getSubjects);
router.post('/subjects', authorize(ROLES.ADMIN), createSubject);

router.get('/teachers', authorize(ROLES.ADMIN), getTeachers);
router.post('/teachers/assign', authorize(ROLES.ADMIN), assignTeacher);

router.get('/students', authorize(ROLES.ADMIN, ROLES.TEACHER), getStudents);

router.get('/grading-scheme', getGradingScheme);
router.put('/grading-scheme', authorize(ROLES.ADMIN), updateGradingScheme);

export default router;
