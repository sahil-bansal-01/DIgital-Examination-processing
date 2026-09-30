import {
  runSequentialProcessing,
  runParallelProcessing,
} from '../services/processingEngine.js';
import { DEFAULT_GRADING_SCHEME } from '../config/constants.js';
import os from 'os';

// In-memory synthetic dataset cache for rapid CAPP experimentation
let cachedSyntheticDataset = [];
let cachedDatasetSize = 0;

// SSE subscribers for live worker pool visualizer
const sseClients = new Set();

export const subscribeToProgressStream = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const client = { id: Date.now(), res };
  sseClients.add(client);

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'SSE stream active' })}\n\n`);

  req.on('close', () => {
    sseClients.delete(client);
  });
};

const broadcastSSE = (data) => {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.res.write(payload);
    } catch (_) {
      sseClients.delete(client);
    }
  }
};

/**
 * Generates N synthetic student records for CAPP benchmarking
 */
export const generateSyntheticData = async (req, res) => {
  try {
    const { count = 10000, subjectCount = 6 } = req.body;
    const N = Math.min(100000, Math.max(500, Number(count)));

    const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const subjects = [
      { code: 'CS301', name: 'Computer Architecture & Parallel Processing', credits: 4 },
      { code: 'CS302', name: 'Database Management Systems', credits: 4 },
      { code: 'CS303', name: 'Operating Systems', credits: 4 },
      { code: 'CS304', name: 'Design & Analysis of Algorithms', credits: 4 },
      { code: 'CS305', name: 'Computer Networks', credits: 3 },
      { code: 'CS306', name: 'Software Engineering', credits: 3 },
    ].slice(0, subjectCount);

    const generated = [];
    for (let i = 1; i <= N; i++) {
      const rollNumber = `24CS${String(i).padStart(6, '0')}`;
      const section = sections[i % sections.length];
      const marks = [];

      for (const sub of subjects) {
        const isAbsent = Math.random() < 0.02; // 2% absent
        const internal = isAbsent ? 0 : Math.round(15 + Math.random() * 15); // 15-30
        const external = isAbsent ? 0 : Math.round(25 + Math.random() * 45); // 25-70
        marks.push({
          subjectCode: sub.code,
          subjectName: sub.name,
          credits: sub.credits,
          maxInternalMarks: 30,
          maxExternalMarks: 70,
          internalMarks: internal,
          externalMarks: external,
          isAbsent,
        });
      }

      generated.push({
        studentId: `synth-${i}`,
        rollNumber,
        studentName: `Synthetic Candidate ${i}`,
        department: 'CSE',
        semester: 3,
        section,
        marks,
      });
    }

    cachedSyntheticDataset = generated;
    cachedDatasetSize = N;

    res.json({
      success: true,
      message: `Successfully generated ${N.toLocaleString()} student mark records`,
      count: N,
      sample: generated.slice(0, 3),
      cachedSize: cachedDatasetSize,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate synthetic dataset', error: err.message });
  }
};

/**
 * Runs the CAPP Race Benchmark:
 * Executes Sequential and Parallel engines on the exact same dataset
 * Returns full comparative metrics: speedup, efficiency, throughput, stage-by-stage timings
 */
export const runRaceBenchmark = async (req, res) => {
  try {
    const {
      datasetSize = 10000,
      workerCount = os.cpus().length,
      chunkStrategy = 'fixed-batch',
      customChunkSize = null,
      workloadIntensity = 2,
    } = req.body;

    let dataset = cachedSyntheticDataset;
    if (dataset.length === 0 || dataset.length !== Number(datasetSize)) {
      // Auto-generate if not cached
      const N = Number(datasetSize);
      const tempRecords = [];
      const sections = ['A', 'B', 'C', 'D'];
      for (let i = 1; i <= N; i++) {
        tempRecords.push({
          studentId: `s-${i}`,
          rollNumber: `24CS${String(i).padStart(6, '0')}`,
          studentName: `Student ${i}`,
          department: 'CSE',
          semester: 3,
          section: sections[i % sections.length],
          marks: [
            { subjectCode: 'CS301', credits: 4, internalMarks: 24, externalMarks: 58 },
            { subjectCode: 'CS302', credits: 4, internalMarks: 22, externalMarks: 61 },
            { subjectCode: 'CS303', credits: 4, internalMarks: 20, externalMarks: 52 },
            { subjectCode: 'CS304', credits: 4, internalMarks: 26, externalMarks: 65 },
          ],
        });
      }
      dataset = tempRecords;
      cachedSyntheticDataset = tempRecords;
      cachedDatasetSize = N;
    }

    // Broadcast race start
    broadcastSSE({ type: 'RACE_START', datasetSize: dataset.length, workerCount });

    // 1. Run Sequential Mode
    broadcastSSE({ type: 'STAGE_UPDATE', stage: 'Running Sequential Baseline...' });
    const sequentialResult = await runSequentialProcessing({
      studentRecords: dataset,
      gradingScheme: DEFAULT_GRADING_SCHEME,
      saveToDb: false,
      workloadIntensity: Number(workloadIntensity),
      onProgress: (p) => broadcastSSE({ type: 'SEQ_PROGRESS', ...p }),
    });

    // 2. Run Parallel Mode with WorkerPool
    broadcastSSE({ type: 'STAGE_UPDATE', stage: `Running Parallel Mode (${workerCount} Workers)...` });
    const parallelResult = await runParallelProcessing({
      studentRecords: dataset,
      gradingScheme: DEFAULT_GRADING_SCHEME,
      workerCount: Number(workerCount),
      chunkStrategy,
      customChunkSize: customChunkSize ? Number(customChunkSize) : null,
      saveToDb: false,
      workloadIntensity: Number(workloadIntensity),
      sequentialBaselineTime: sequentialResult.totalTimeMs,
      onProgress: (p) => broadcastSSE({ type: 'PAR_PROGRESS', ...p }),
    });

    // Compute Comparative CAPP Metrics
    const T_seq = sequentialResult.totalTimeMs;
    const T_par = parallelResult.totalTimeMs;
    const speedup = Number((T_seq / Math.max(0.1, T_par)).toFixed(2));
    const P = Number(workerCount);
    const efficiency = Number((speedup / P).toFixed(2));

    // Amdahl's Law theoretical speedup estimation:
    // parallel fraction f (compute/validate) vs serial fraction (chunking, merge, final rank)
    const serialTimePar = (parallelResult.stageTimings.validate || 0) + (parallelResult.stageTimings.merge || 0) + (parallelResult.stageTimings.rank || 0);
    const parallelFraction = Math.max(0.7, Math.min(0.99, 1 - (serialTimePar / Math.max(1, T_par))));
    const amdahlTheoreticalSpeedup = Number((1 / ((1 - parallelFraction) + (parallelFraction / P))).toFixed(2));

    const raceReport = {
      datasetSize: dataset.length,
      workerCount: P,
      chunkStrategy,
      chunkSize: parallelResult.chunkSize,
      sequential: {
        totalTimeMs: T_seq,
        throughput: sequentialResult.throughput,
        stageTimings: sequentialResult.stageTimings,
        memoryUsage: sequentialResult.memoryUsage,
      },
      parallel: {
        totalTimeMs: T_par,
        throughput: parallelResult.throughput,
        stageTimings: parallelResult.stageTimings,
        memoryUsage: parallelResult.memoryUsage,
      },
      metrics: {
        speedup,
        efficiency,
        amdahlTheoreticalSpeedup,
        parallelFraction: Number((parallelFraction * 100).toFixed(1)),
        timeSavedMs: Number((T_seq - T_par).toFixed(2)),
        percentageImprovement: Number((((T_seq - T_par) / T_seq) * 100).toFixed(1)),
        winner: T_par < T_seq ? 'parallel' : 'sequential',
      },
    };

    broadcastSSE({ type: 'RACE_COMPLETE', report: raceReport });

    res.json({
      success: true,
      report: raceReport,
    });
  } catch (err) {
    broadcastSSE({ type: 'RACE_ERROR', error: err.message });
    res.status(500).json({ success: false, message: 'Benchmark execution failed', error: err.message });
  }
};

/**
 * Runs Worker Scaling Benchmark across 1, 2, 4, 8 threads
 */
export const runWorkerScalingBenchmark = async (req, res) => {
  try {
    const { datasetSize = 10000, workloadIntensity = 2 } = req.body;
    let dataset = cachedSyntheticDataset;
    if (dataset.length === 0 || dataset.length !== Number(datasetSize)) {
      const N = Number(datasetSize);
      const tempRecords = [];
      for (let i = 1; i <= N; i++) {
        tempRecords.push({
          studentId: `w-${i}`,
          rollNumber: `24CS${String(i).padStart(6, '0')}`,
          studentName: `Student ${i}`,
          department: 'CSE',
          semester: 3,
          section: 'A',
          marks: [
            { subjectCode: 'CS301', credits: 4, internalMarks: 25, externalMarks: 60 },
            { subjectCode: 'CS302', credits: 4, internalMarks: 23, externalMarks: 58 },
            { subjectCode: 'CS303', credits: 4, internalMarks: 27, externalMarks: 64 },
          ],
        });
      }
      dataset = tempRecords;
    }

    // 1. Sequential baseline
    const seq = await runSequentialProcessing({
      studentRecords: dataset,
      gradingScheme: DEFAULT_GRADING_SCHEME,
      saveToDb: false,
      workloadIntensity: Number(workloadIntensity),
    });
    const T_seq = seq.totalTimeMs;

    // Test thread configurations: 1, 2, 4, 8 (or up to CPU cores)
    const threadCounts = [1, 2, 4, 8].filter((t) => t <= Math.max(8, os.cpus().length));
    const scalingResults = [];

    for (const workers of threadCounts) {
      const par = await runParallelProcessing({
        studentRecords: dataset,
        gradingScheme: DEFAULT_GRADING_SCHEME,
        workerCount: workers,
        saveToDb: false,
        workloadIntensity: Number(workloadIntensity),
        sequentialBaselineTime: T_seq,
      });

      const sp = Number((T_seq / Math.max(0.1, par.totalTimeMs)).toFixed(2));
      const eff = Number((sp / workers).toFixed(2));

      scalingResults.push({
        workers,
        timeMs: par.totalTimeMs,
        speedup: sp,
        idealSpeedup: workers,
        efficiency: eff,
        throughput: par.throughput,
      });
    }

    res.json({
      success: true,
      sequentialTimeMs: T_seq,
      scalingResults,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
