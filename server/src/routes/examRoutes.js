import express from 'express';
import {
  getExams,
  getExamById,
  createExam,
  updateExamStatus,
  toggleLockMarksEntry,
} from '../controllers/examController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getExams);
router.get('/:id', getExamById);
router.post('/', authorize(ROLES.ADMIN), createExam);
router.patch('/:id/status', authorize(ROLES.ADMIN), updateExamStatus);
router.patch('/:id/toggle-lock', authorize(ROLES.ADMIN), toggleLockMarksEntry);

export default router;
