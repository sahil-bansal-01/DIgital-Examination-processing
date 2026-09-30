import express from 'express';
import {
  createReEvaluationRequest,
  getReEvaluationRequests,
  reviewReEvaluationRequest,
} from '../controllers/reEvaluationController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);

// Student submits
router.post('/', authorize(ROLES.STUDENT), createReEvaluationRequest);

// List requests (Student views own, Admin views all)
router.get('/', authorize(ROLES.STUDENT, ROLES.ADMIN), getReEvaluationRequests);

// Admin reviews and approves/rejects
router.patch('/:id/review', authorize(ROLES.ADMIN), reviewReEvaluationRequest);

export default router;
