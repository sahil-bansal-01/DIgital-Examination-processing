import express from 'express';
import {
  triggerExamProcessing,
  getProcessingRuns,
} from '../controllers/processingController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);

router.post('/exam/:examId', authorize(ROLES.ADMIN), triggerExamProcessing);
router.get('/runs', authorize(ROLES.ADMIN), getProcessingRuns);

export default router;
