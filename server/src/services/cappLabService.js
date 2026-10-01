import os from 'os';
import { performance } from 'perf_hooks';
import { getSharedWorkerPool } from '../workers/workerPool.js';
import { ProcessingRun } from '../models/LogsAndRuns.js';
import {
  runSequentialProcessing,
  runParallelProcessing,
} from './processingEngine.js';
import { DEFAULT_GRADING_SCHEME } from '../config/constants.js';

// Cache previous CPU times for accurate differential load calculation
let prevCpus = os.cpus();
let prevTimestamp = Date.now();

/**
 * Calculates current per-core CPU load percentages using delta times
 */
export const getCpuLoadPerCore = () => {
  const currentCpus = os.cpus();
  const currentTimestamp = Date.now();
  const timeDelta = currentTimestamp - prevTimestamp;

  const loads = currentCpus.map((cpu, index) => {
    const prev = prevCpus[index] || cpu;

    const idleDelta = cpu.times.idle - prev.times.idle;
    const totalDelta =
      cpu.times.user +
      cpu.times.nice +
      cpu.times.sys +
      cpu.times.irq +
      cpu.times.idle -
      (prev.times.user +
        prev.times.nice +
        prev.times.sys +
        prev.times.irq +
        prev.times.idle);

    let loadPercent = 0;
    if (totalDelta > 0) {
      loadPercent = Math.max(0, Math.min(100, Math.round(((totalDelta - idleDelta) / totalDelta) * 100)));
    }

    return {
      coreId: index,
      model: cpu.model,
      speedMHz: cpu.speed,
      loadPercent,
      userTime: cpu.times.user,
      sysTime: cpu.times.sys,
      idleTime: cpu.times.idle,
    };
  });

  // Update previous reference
  prevCpus = currentCpus;
  prevTimestamp = currentTimestamp;

  return loads;
};

/**
 * Returns overall system telemetry including multi-core stats and worker pool state
 */
export const getSystemTelemetry = () => {
  const cores = getCpuLoadPerCore();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const procMem = process.memoryUsage();

  // Get active worker pool state
  const pool = getSharedWorkerPool();
  const workerStatus = pool.workers.map((w) => ({
    id: w.id,
    isBusy: w.isBusy,
    currentChunkId: w.currentTask?.task?.chunkId || null,
    currentChunkName: w.currentTask?.task?.name || null,
  }));

  const activeWorkers = workerStatus.filter((w) => w.isBusy).length;
  const idleWorkers = workerStatus.length - activeWorkers;

  const avgCoreLoad = Math.round(
    cores.reduce((sum, c) => sum + c.loadPercent, 0) / Math.max(1, cores.length)
  );

  return {
    timestamp: new Date().toISOString(),
    cpu: {
      model: cores[0]?.model || 'Standard CPU Core',
      coreCount: cores.length,
      averageLoadPercent: avgCoreLoad,
      cores,
    },
    memory: {
      totalMB: Math.round(totalMem / (1024 * 1024)),
      usedMB: Math.round(usedMem / (1024 * 1024)),
      freeMB: Math.round(freeMem / (1024 * 1024)),
      usedPercent: Math.round((usedMem / totalMem) * 100),
      processHeapUsedMB: Number((procMem.heapUsed / (1024 * 1024)).toFixed(1)),
      processRssMB: Number((procMem.rss / (1024 * 1024)).toFixed(1)),
    },
    workerPool: {
      size: pool.size,
      activeCount: activeWorkers,
      idleCount: idleWorkers,
      queueLength: pool.queue.length,
      workers: workerStatus,
    },
  };
};

/**
 * Generates synthetic benchmark dataset for CAPP Lab live runs
 */
const generateSyntheticDataset = (count = 5000) => {
  const records = [];
  const sections = ['A', 'B', 'C', 'D'];
  const subjects = [
    { code: 'CS301', name: 'Computer Architecture', credits: 4, maxInternalMarks: 30, maxExternalMarks: 70 },
    { code: 'CS302', name: 'Parallel Processing Core', credits: 4, maxInternalMarks: 30, maxExternalMarks: 70 },
    { code: 'CS303', name: 'Operating Systems', credits: 4, maxInternalMarks: 30, maxExternalMarks: 70 },
    { code: 'CS304', name: 'Distributed Algorithms', credits: 4, maxInternalMarks: 30, maxExternalMarks: 70 },
  ];

  for (let i = 1; i <= count; i++) {
    const marks = subjects.map((sub) => ({
      subjectCode: sub.code,
      subjectName: sub.name,
      credits: sub.credits,
      maxInternalMarks: sub.maxInternalMarks,
      maxExternalMarks: sub.maxExternalMarks,
      internalMarks: Math.round(18 + Math.random() * 12),
      externalMarks: Math.round(30 + Math.random() * 40),
      isAbsent: false,
    }));

    records.push({
      studentId: `capp-synth-${i}`,
      rollNumber: `24CAPP${String(i).padStart(5, '0')}`,
      studentName: `Candidate ${i}`,
      department: 'CSE',
      semester: 3,
      section: sections[i % sections.length],
      marks,
    });
  }

  return records;
};

/**
 * Executes a sample workload in sequential or parallel mode and persists run metrics
 */
export const runSampleWorkload = async ({
  mode = 'parallel',
  workerCount = os.cpus().length,
  recordCount = 6000,
  workloadIntensity = 2,
}) => {
  const N = Math.min(25000, Math.max(1000, Number(recordCount)));
  const dataset = generateSyntheticDataset(N);
  const workers = Math.max(1, Math.min(32, Number(workerCount)));

  let resultPayload;
  const runId = `CAPP-LAB-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  if (mode === 'sequential') {
    resultPayload = await runSequentialProcessing({
      studentRecords: dataset,
      gradingScheme: DEFAULT_GRADING_SCHEME,
      saveToDb: false,
      workloadIntensity: Number(workloadIntensity),
    });
  } else {
    resultPayload = await runParallelProcessing({
      studentRecords: dataset,
      gradingScheme: DEFAULT_GRADING_SCHEME,
      workerCount: workers,
      chunkStrategy: 'fixed-batch',
      saveToDb: false,
      workloadIntensity: Number(workloadIntensity),
    });
  }

  // Calculate Amdahl's metrics
  const serialTime =
    (resultPayload.stageTimings.validate || 0) +
    (resultPayload.stageTimings.merge || 0) +
    (resultPayload.stageTimings.rank || 0);
  const totalTime = Math.max(1, resultPayload.totalTimeMs);
  const parallelFraction = Math.max(0.6, Math.min(0.98, 1 - serialTime / totalTime));

  // Persist run in ProcessingRun so it appears in past runs & Gantt timeline
  const runDoc = await ProcessingRun.create({
    runId,
    examId: '000000000000000000000000', // synthetic reference
    examTitle: `CAPP Lab ${mode.toUpperCase()} Run (${N.toLocaleString()} records, ${mode === 'parallel' ? workers : 1} workers)`,
    mode: resultPayload.mode,
    recordCount: resultPayload.recordCount,
    workerCount: resultPayload.workerCount,
    chunkSize: resultPayload.chunkSize,
    chunkingStrategy: resultPayload.chunkingStrategy || 'none',
    stageTimings: resultPayload.stageTimings,
    chunks: resultPayload.chunks || [],
    totalTimeMs: resultPayload.totalTimeMs,
    speedup: resultPayload.speedup,
    efficiency: resultPayload.efficiency,
    throughput: resultPayload.throughput,
    memoryUsage: resultPayload.memoryUsage,
    status: 'completed',
  });

  return {
    run: runDoc,
    parallelFraction: Number((parallelFraction * 100).toFixed(1)),
  };
};

/**
 * Helper to ensure a run object has realistic chunks if it was a legacy run
 */
export const normalizeRunChunks = (run) => {
  const runObj = run.toObject ? run.toObject() : { ...run };
  if (runObj.chunks && runObj.chunks.length > 0) {
    return runObj;
  }

  // Synthesize proportional chunks for legacy runs without stored chunks
  const workerCount = Math.max(1, runObj.workerCount || 1);
  const computeTime = runObj.stageTimings?.compute || runObj.totalTimeMs * 0.7;
  const chunkCount = runObj.mode === 'sequential' ? 1 : Math.max(workerCount, Math.round(workerCount * 1.5));
  const recordCount = runObj.recordCount || 5000;
  const perChunkRecords = Math.ceil(recordCount / chunkCount);

  const chunks = [];
  const validateOffset = runObj.stageTimings?.validate || 0;

  for (let i = 0; i < chunkCount; i++) {
    const workerId = (i % workerCount) + 1;
    const chunkDuration = Number((computeTime / (chunkCount / workerCount) * (0.9 + Math.random() * 0.2)).toFixed(2));
    const startOffset = Number((validateOffset + (Math.floor(i / workerCount) * (computeTime / (chunkCount / workerCount)))).toFixed(2));

    chunks.push({
      chunkId: i + 1,
      workerId,
      startTime: startOffset,
      endTime: Number((startOffset + chunkDuration).toFixed(2)),
      durationMs: chunkDuration,
      recordCount: perChunkRecords,
    });
  }

  runObj.chunks = chunks;
  return runObj;
};

/**
 * Returns latest run for Pipeline and Timeline views
 */
export const getLatestRun = async () => {
  let latest = await ProcessingRun.findOne({ status: 'completed' }).sort({ createdAt: -1 });

  if (!latest) {
    // Auto-create a sample run so the view has authentic CAPP data right out of the box
    const sample = await runSampleWorkload({ mode: 'parallel', workerCount: 4, recordCount: 4000, workloadIntensity: 1 });
    latest = sample.run;
  }

  return normalizeRunChunks(latest);
};

/**
 * Returns list of recent runs for timeline comparison
 */
export const getRunHistory = async (limit = 10) => {
  const runs = await ProcessingRun.find({ status: 'completed' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('runId examTitle mode recordCount workerCount totalTimeMs speedup efficiency stageTimings chunks createdAt');

  if (runs.length === 0) {
    await runSampleWorkload({ mode: 'sequential', workerCount: 1, recordCount: 4000 });
    await runSampleWorkload({ mode: 'parallel', workerCount: 4, recordCount: 4000 });
    const fresh = await ProcessingRun.find({ status: 'completed' }).sort({ createdAt: -1 }).limit(limit);
    return fresh.map(normalizeRunChunks);
  }

  return runs.map(normalizeRunChunks);
};

/**
 * Compiles real measured Amdahl data from completed runs
 */
export const getAmdahlComparisonData = async () => {
  const runs = await ProcessingRun.find({ status: 'completed' }).sort({ createdAt: -1 }).limit(30);

  // Group by worker count and calculate average measured speedup
  const workerGroups = new Map();

  for (const r of runs) {
    const w = r.workerCount || 1;
    if (!workerGroups.has(w)) {
      workerGroups.set(w, { totalSpeedup: 0, count: 0, totalTime: 0 });
    }
    const g = workerGroups.get(w);
    g.totalSpeedup += r.speedup || 1;
    g.totalTime += r.totalTimeMs;
    g.count += 1;
  }

  const measuredPoints = [];
  for (const [workers, data] of workerGroups.entries()) {
    measuredPoints.push({
      workers,
      measuredSpeedup: Number((data.totalSpeedup / data.count).toFixed(2)),
      sampleCount: data.count,
    });
  }

  // Sort by worker count
  measuredPoints.sort((a, b) => a.workers - b.workers);

  // Estimate empirical parallel fraction (P) from latest runs
  let avgParallelFraction = 0.88;
  if (runs.length > 0) {
    const fractions = runs.map((r) => {
      const serial = (r.stageTimings?.validate || 0) + (r.stageTimings?.merge || 0) + (r.stageTimings?.rank || 0);
      const total = Math.max(1, r.totalTimeMs);
      return Math.max(0.6, Math.min(0.98, 1 - serial / total));
    });
    avgParallelFraction = Number(
      (fractions.reduce((sum, f) => sum + f, 0) / fractions.length).toFixed(3)
    );
  }

  return {
    empiricalParallelFraction: avgParallelFraction,
    measuredPoints,
    systemCores: os.cpus().length,
  };
};
