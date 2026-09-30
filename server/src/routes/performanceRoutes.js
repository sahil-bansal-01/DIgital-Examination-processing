import express from 'express';
import {
  generateSyntheticData,
  runRaceBenchmark,
  runWorkerScalingBenchmark,
  subscribeToProgressStream,
} from '../controllers/performanceController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// SSE stream doesn't require bearer token in header for browser EventSource compatibility, or can accept token in query
router.get('/stream-progress', subscribeToProgressStream);

router.use(authenticate);

router.post('/generate-synthetic', generateSyntheticData);
router.post('/race', runRaceBenchmark);
router.post('/scaling-workers', runWorkerScalingBenchmark);

export default router;
