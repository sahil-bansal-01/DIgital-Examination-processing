/**
 * ============================================================================
 * CAPP Parallel Decomposition & Chunking Module
 * ============================================================================
 * 
 * In Parallel Computing and Computer Architecture (CAPP), problem decomposition
 * is the process of breaking a large computational workload into discrete tasks
 * that can execute concurrently across multiple processing units (CPU cores/threads).
 * 
 * Granularity Tradeoff:
 * - Coarse-Grained (Large Chunks): Lower communication and serialization overhead,
 *   but higher risk of load imbalance if chunk execution times vary.
 * - Fine-Grained (Small Chunks): Excellent load balancing, but higher thread
 *   dispatching and message serialization (structured clone) overhead.
 * 
 * Amdahl's Law implication:
 * S(P) = 1 / ((1 - f) + (f / P))
 * The serial fraction (1 - f) includes this chunking stage and the subsequent
 * merge/ranking stage. Minimizing chunking overhead maximizes parallel efficiency.
 */

/**
 * Splits an array of student records into chunks based on the chosen strategy.
 * 
 * @param {Array} records - All student mark records
 * @param {String} strategy - 'fixed-batch' | 'section'
 * @param {Number} targetWorkers - Number of active worker threads
 * @param {Number} [customChunkSize] - Optional explicit chunk size
 * @returns {Array<{ chunkId: number, name: string, records: Array }>}
 */
export const createChunks = (records, strategy = 'fixed-batch', targetWorkers = 4, customChunkSize = null) => {
  if (!records || records.length === 0) return [];

  // Strategy 1: Natural Domain Decomposition by Academic Section
  if (strategy === 'section') {
    const sectionMap = new Map();
    for (const record of records) {
      const sec = record.section || 'General';
      if (!sectionMap.has(sec)) sectionMap.set(sec, []);
      sectionMap.get(sec).push(record);
    }

    const chunks = [];
    let chunkId = 0;
    for (const [secName, secRecords] of sectionMap.entries()) {
      chunks.push({
        chunkId: ++chunkId,
        name: `Section ${secName}`,
        records: secRecords,
      });
    }
    return chunks;
  }

  // Strategy 2: Fixed-Batch Decomposition (Data Parallelism)
  // If customChunkSize is provided, use it; otherwise compute optimal balanced chunk size
  const total = records.length;
  const chunkSize = customChunkSize && customChunkSize > 0
    ? customChunkSize
    : Math.max(1, Math.ceil(total / Math.max(1, targetWorkers)));

  const chunks = [];
  let chunkIndex = 0;

  for (let i = 0; i < total; i += chunkSize) {
    const slice = records.slice(i, i + chunkSize);
    chunks.push({
      chunkId: ++chunkIndex,
      name: `Batch ${chunkIndex} (${i + 1} - ${Math.min(i + chunkSize, total)})`,
      records: slice,
    });
  }

  return chunks;
};
