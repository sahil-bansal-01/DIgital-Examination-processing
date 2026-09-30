import express from 'express';
import {
  getMarks,
  batchSaveMarks,
  validateAndUploadMarksCSV,
} from '../controllers/marksController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(ROLES.ADMIN, ROLES.TEACHER), getMarks);
router.post('/batch', authorize(ROLES.ADMIN, ROLES.TEACHER), batchSaveMarks);
router.post('/upload-csv', authorize(ROLES.ADMIN, ROLES.TEACHER), validateAndUploadMarksCSV);

export default router;
