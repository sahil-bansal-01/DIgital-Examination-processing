import { Worker } from 'worker_threads';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKER_SCRIPT = path.join(__dirname, 'resultWorker.js');

/**
 * ============================================================================
 * CAPP Worker Pool Manager
 * ============================================================================
 * 
 * In parallel computer architecture, repeatedly spawning OS threads incurs
 * non-trivial thread creation overhead (kernel stack allocation, context creation).
 * 
 * A Worker Pool maintains a set of persistent, pre-spawned worker threads.
 * When chunks of work arrive, the pool acts as a centralized Task Dispatcher:
 * 1. Chunks are enqueued in a FIFO Task Queue.
 * 2. As workers become IDLE, tasks are dequeued and dispatched.
 * 3. Thread telemetry (progress, CPU execution time) is captured.
 * 4. Chunks are gathered and synchronized at the barrier (Join phase).
 * 
 * Fault Tolerance:
 * If a worker thread encounters an uncaught exception or dies, the pool catches
 * the exit event, spawns a replacement worker thread, and requeues the failed chunk.
 */

export class WorkerPool {
  /**
   * @param {Number} size - Number of threads in the pool (default: CPU cores)
   */
  constructor(size = os.cpus().length) {
    this.size = Math.max(1, size);
    this.workers = []; // Array of { id, worker, isBusy, currentTask }
    this.queue = [];
    this.isDestroyed = false;
    this.init();
  }

  init() {
    for (let i = 1; i <= this.size; i++) {
      this.spawnWorker(i);
    }
  }

  spawnWorker(id) {
    const worker = new Worker(WORKER_SCRIPT);
    const workerEntry = {
      id,
      worker,
      isBusy: false,
      currentTask: null,
    };

    worker.on('error', (err) => {
      console.error(`❌ [WorkerPool] Worker #${id} runtime error:`, err);
      if (workerEntry.currentTask && workerEntry.currentTask.retryCount < 2) {
        workerEntry.currentTask.retryCount++;
        console.warn(`🔄 Re-queueing failed chunk #${workerEntry.currentTask.task.chunkId} (Attempt ${workerEntry.currentTask.retryCount})`);
        this.queue.unshift(workerEntry.currentTask);
      }
      this.replaceWorker(id);
    });

    worker.on('exit', (code) => {
      if (code !== 0 && !this.isDestroyed) {
        console.warn(`⚠️ [WorkerPool] Worker #${id} stopped with exit code ${code}. Respawning replacement thread...`);
        this.replaceWorker(id);
      }
    });

    this.workers.push(workerEntry);
  }

  replaceWorker(id) {
    const index = this.workers.findIndex((w) => w.id === id);
    if (index !== -1) {
      try {
        this.workers[index].worker.terminate();
      } catch (_) {}
      this.workers.splice(index, 1);
    }
    if (!this.isDestroyed) {
      this.spawnWorker(id);
      this.dispatch();
    }
  }

  /**
   * Resizes worker pool dynamically if needed
   */
  resize(targetSize) {
    if (this.size === targetSize) return;
    if (targetSize > this.size) {
      for (let i = this.size + 1; i <= targetSize; i++) {
        this.spawnWorker(i);
      }
    } else {
      const excess = this.workers.splice(targetSize);
      for (const entry of excess) {
        try {
          entry.worker.terminate();
        } catch (_) {}
      }
    }
    this.size = targetSize;
  }

  /**
   * Executes a collection of chunks across the worker pool
   * 
   * @param {Array} chunks - Output of createChunks()
   * @param {Object} options - { gradingScheme, workloadIntensity, onProgress }
   * @returns {Promise<Array>} - Array of results from all chunks
   */
  async processChunks(chunks, options = {}) {
    const { gradingScheme, workloadIntensity = 1, onProgress = null } = options;
    const completedResults = [];
    const totalChunks = chunks.length;
    let chunksFinished = 0;

    return new Promise((resolve, reject) => {
      if (chunks.length === 0) return resolve([]);

      chunks.forEach((chunk) => {
        this.queue.push({
          task: {
            chunkId: chunk.chunkId,
            name: chunk.name,
            records: JSON.parse(JSON.stringify(chunk.records)),
            gradingScheme: JSON.parse(JSON.stringify(gradingScheme || {})),
            workloadIntensity,
          },
          retryCount: 0,
          onComplete: (data) => {
            completedResults.push(data);
            chunksFinished++;
            if (chunksFinished === totalChunks) {
              resolve(completedResults);
            }
          },
          onError: (err) => {
            reject(err);
          },
          onProgress,
        });
      });

      this.dispatch();
    });
  }

  dispatch() {
    if (this.isDestroyed || this.queue.length === 0) return;

    for (const workerEntry of this.workers) {
      if (!workerEntry.isBusy && this.queue.length > 0) {
        const queueItem = this.queue.shift();
        workerEntry.isBusy = true;
        workerEntry.currentTask = queueItem;

        queueItem.dispatchedAt = performance.now();

        const messageHandler = (msg) => {
          if (msg.type === 'PROGRESS') {
            if (queueItem.onProgress) {
              queueItem.onProgress({
                workerId: workerEntry.id,
                chunkId: msg.chunkId,
                processedCount: msg.processedCount,
                totalCount: msg.totalCount,
                percent: msg.percent,
              });
            }
          } else if (msg.type === 'COMPLETE') {
            const completedAt = performance.now();
            workerEntry.worker.removeListener('message', messageHandler);
            workerEntry.isBusy = false;
            workerEntry.currentTask = null;
            
            const chunkTiming = {
              chunkId: msg.chunkId,
              workerId: workerEntry.id,
              startTime: Number(queueItem.dispatchedAt.toFixed(2)),
              endTime: Number(completedAt.toFixed(2)),
              durationMs: Number((completedAt - queueItem.dispatchedAt).toFixed(2)),
              recordCount: msg.count || (queueItem.task?.records?.length || 0),
            };
            msg.chunkTiming = chunkTiming;

            queueItem.onComplete(msg);
            this.dispatch(); // Pick up next task in queue
          } else if (msg.type === 'ERROR') {
            workerEntry.worker.removeListener('message', messageHandler);
            workerEntry.isBusy = false;
            workerEntry.currentTask = null;
            queueItem.onError(new Error(msg.error));
            this.dispatch();
          }
        };

        workerEntry.worker.on('message', messageHandler);

        // Send task payload to worker
        workerEntry.worker.postMessage({
          ...queueItem.task,
          workerId: workerEntry.id,
        });
      }
    }
  }

  destroy() {
    this.isDestroyed = true;
    for (const w of this.workers) {
      try {
        w.worker.terminate();
      } catch (_) {}
    }
    this.workers = [];
    this.queue = [];
  }
}

// Global warm worker pool instance
let globalPool = null;

export const getSharedWorkerPool = (size = os.cpus().length) => {
  if (!globalPool) {
    globalPool = new WorkerPool(size);
  } else {
    globalPool.resize(size);
  }
  return globalPool;
};
