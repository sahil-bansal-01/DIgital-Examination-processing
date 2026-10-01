import express from 'express';
import {
  getSystemTelemetry,
  getLatestRun,
  getRunHistory,
  getAmdahlComparisonData,
  runSampleWorkload,
} from '../services/cappLabService.js';

const router = express.Router();

/**
 * GET /api/capp-lab/system-telemetry
 * Real-time CPU core loads, memory telemetry, and worker pool state
 */
router.get('/system-telemetry', async (req, res) => {
  try {
    const telemetry = getSystemTelemetry();
    res.json({
      success: true,
      data: telemetry,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve system telemetry',
      error: err.message,
    });
  }
});

/**
 * GET /api/capp-lab/latest-run
 * Returns most recent processing run with stage timings and chunk execution metrics
 */
router.get('/latest-run', async (req, res) => {
  try {
    const run = await getLatestRun();
    res.json({
      success: true,
      data: run,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve latest run metrics',
      error: err.message,
    });
  }
});

/**
 * GET /api/capp-lab/runs
 * Returns past processing runs for the Gantt timeline selector
 */
router.get('/runs', async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 15));
    const runs = await getRunHistory(limit);
    res.json({
      success: true,
      data: runs,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve run history',
      error: err.message,
    });
  }
});

/**
 * GET /api/capp-lab/amdahl-data
 * Returns empirical parallel fraction and real measured speedup points
 */
router.get('/amdahl-data', async (req, res) => {
  try {
    const data = await getAmdahlComparisonData();
    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to compute Amdahl comparison data',
      error: err.message,
    });
  }
});

/**
 * POST /api/capp-lab/trigger-run
 * Triggers a live sequential or parallel sample run to observe multi-core behavior
 */
router.post('/trigger-run', async (req, res) => {
  try {
    const {
      mode = 'parallel',
      workerCount = 4,
      recordCount = 6000,
      workloadIntensity = 2,
    } = req.body;

    const result = await runSampleWorkload({
      mode,
      workerCount: Number(workerCount),
      recordCount: Number(recordCount),
      workloadIntensity: Number(workloadIntensity),
    });

    res.json({
      success: true,
      message: `Completed ${mode} workload run with ${result.run.recordCount} records`,
      data: result.run,
      parallelFraction: result.parallelFraction,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to execute sample workload',
      error: err.message,
    });
  }
});

export default router;
