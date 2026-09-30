import express from 'express';
import {
  getExamResults,
  getSectionAnalytics,
  getMyResults,
  exportResultsCSV,
} from '../controllers/resultController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);

// Student personal results
router.get('/my-results', authorize(ROLES.STUDENT), getMyResults);

// Results view and analytics
router.get('/', authorize(ROLES.ADMIN, ROLES.TEACHER), getExamResults);
router.get('/analytics', authorize(ROLES.ADMIN, ROLES.TEACHER), getSectionAnalytics);
router.get('/export-csv', authorize(ROLES.ADMIN), exportResultsCSV);

export default router;
