// CAPP: MESI Cache Coherence (Unit 6)
/**
 * ============================================================================
 * CACHE COHERENCE & OPTIMISTIC CONCURRENCY SUBSYSTEM (CAPP Unit 6: Multiprocessors & Coherence)
 * ============================================================================
 * In symmetric multi-core and multi-processor systems (SMP / MIMD), each
 * processing core or evaluator client possesses a private local cache.
 * When multiple cores access and mutate shared memory (e.g. student mark records),
 * data inconsistency and stale reads arise.
 *
 * This module implements:
 * 1. The Illinois MESI Protocol state machine:
 *    - [M] MODIFIED: Cache line dirty; present only in this core's cache.
 *    - [E] EXCLUSIVE: Cache line clean; present only in this core's cache.
 *    - [S] SHARED: Cache line clean; shared across multiple cores' caches.
 *    - [I] INVALID: Cache line stale/invalidated by a write from another core.
 *
 * 2. Snoop Bus & Invalidation Broadcast:
 *    - When Core A updates a student's marks, it broadcasts an Invalidation (INV)
 *      signal over the shared snoop bus.
 *    - All other cores (Core B, Core C, Core D) holding the line automatically
 *      transition to state [I], preventing stale evaluation reads.
 *    - LRU Cache copies are also refreshed or evicted.
 *
 * 3. Optimistic Locking (Version Numbering):
 *    - Every shared record has a monotonic integer version number.
 *    - Concurrent updates must supply `expectedVersion`.
 *    - If versions conflict, a Write-after-Write (WAW) hazard is flagged and
 *      the stale transaction is aborted (Optimistic Lock Conflict).
 * ============================================================================
 */

import { lruCache } from './lruCache.js';

export const CORES = [
  { id: 'core1', name: 'Evaluator Core 1 (CS301 Faculty)', role: 'evaluator', color: '#00F2FE' },
  { id: 'core2', name: 'Evaluator Core 2 (CS302 Faculty)', role: 'evaluator', color: '#10B981' },
  { id: 'core3', name: 'Exam Cell Core 3 (Admin Desk)', role: 'admin', color: '#8B5CF6' },
  { id: 'core4', name: 'Student Portal Core 4 (Read Node)', role: 'student', color: '#F59E0B' },
];

export const MESI_STATES = {
  MODIFIED: 'M',
  EXCLUSIVE: 'E',
  SHARED: 'S',
  INVALID: 'I',
};

class CacheCoherenceManager {
  constructor() {
    // Coherence directory holding shared records and per-core states
    this.directory = new Map();

    // SNOOP BUS event audit trail
    this.snoopEvents = [];
    this.maxSnoopEvents = 150;

    // Concurrency statistics
    this.stats = {
      totalReads: 0,
      totalWrites: 0,
      snoopInvalidationsBroadcast: 0,
      optimisticLockHits: 0,
      optimisticLockConflicts: 0,
      stateTransitions: {
        toModified: 0,
        toExclusive: 0,
        toShared: 0,
        toInvalid: 0,
      },
    };

    // Pre-seed demo records
    this._seedCoherenceRecords();
  }

  /**
   * Evaluator Core reads a record (BusRd transaction)
   */
  readRecord(coreId, recordId) {
    this.stats.totalReads++;
    const record = this.directory.get(recordId);
    if (!record) {
      throw new Error(`Record ${recordId} not found in coherence directory.`);
    }

    const currentCoreState = record.coreStates[coreId] || { state: 'I', marks: null, version: null };

    // Check if another core currently has the line in MODIFIED (dirty)
    let dirtyOwnerCoreId = null;
    for (const [cId, cData] of Object.entries(record.coreStates)) {
      if (cId !== coreId && cData.state === MESI_STATES.MODIFIED) {
        dirtyOwnerCoreId = cId;
        break;
      }
    }

    let busAction = 'BusRd';
    if (dirtyOwnerCoreId) {
      // Dirty core must flush to main memory first!
      const dirtyData = record.coreStates[dirtyOwnerCoreId];
      record.mainMemoryMarks = dirtyData.marks;
      record.mainMemoryVersion = dirtyData.version;
      record.coreStates[dirtyOwnerCoreId].state = MESI_STATES.SHARED;
      record.coreStates[dirtyOwnerCoreId].lastEvent = 'Writeback to DB -> Shared (S)';
      this.stats.stateTransitions.toShared++;

      this._logSnoopEvent({
        action: 'FLUSH_WRITEBACK',
        recordId,
        sourceCore: dirtyOwnerCoreId,
        targetCore: coreId,
        details: `Core ${dirtyOwnerCoreId} flushed dirty line (${dirtyData.marks} marks) to memory. Transitioned M -> S.`,
      });
    }

    // Determine other cores holding valid lines (E or S)
    const validOtherCores = Object.entries(record.coreStates).filter(
      ([cId, cData]) => cId !== coreId && (cData.state === MESI_STATES.EXCLUSIVE || cData.state === MESI_STATES.SHARED)
    );

    let newState = MESI_STATES.EXCLUSIVE;
    if (validOtherCores.length > 0) {
      // Line is shared across multiple caches
      newState = MESI_STATES.SHARED;
      // Any exclusive holders must downgrade to shared
      validOtherCores.forEach(([cId, cData]) => {
        if (cData.state === MESI_STATES.EXCLUSIVE) {
          record.coreStates[cId].state = MESI_STATES.SHARED;
          record.coreStates[cId].lastEvent = 'Snoop BusRd: Downgraded E -> S';
          this.stats.stateTransitions.toShared++;
        }
      });
    }

    // Update requesting core state
    const prev = currentCoreState.state;
    record.coreStates[coreId] = {
      state: newState,
      marks: record.mainMemoryMarks,
      version: record.mainMemoryVersion,
      lastEvent: `BusRd: ${prev} -> ${newState}`,
      lastAccessedAt: new Date().toISOString(),
    };

    if (newState === MESI_STATES.EXCLUSIVE) {
      this.stats.stateTransitions.toExclusive++;
    } else {
      this.stats.stateTransitions.toShared++;
    }

    this._logSnoopEvent({
      action: busAction,
      recordId,
      sourceCore: coreId,
      targetCore: 'BROADCAST',
      details: `Core ${coreId} read record ${recordId}. Current state: [${newState}]. Value: ${record.mainMemoryMarks} (v${record.mainMemoryVersion}).`,
    });

    return {
      success: true,
      recordId,
      coreId,
      state: newState,
      marks: record.mainMemoryMarks,
      version: record.mainMemoryVersion,
      record: this._formatRecord(record),
    };
  }

  /**
   * Evaluator Core updates marks with Optimistic Locking check (BusRdX / BusUpgr transaction)
   * Broadcasts invalidation to all other cores.
   */
  updateRecord({ coreId, recordId, updatedMarks, expectedVersion }) {
    this.stats.totalWrites++;
    const record = this.directory.get(recordId);
    if (!record) {
      throw new Error(`Record ${recordId} not found in coherence directory.`);
    }

    // 1. OPTIMISTIC LOCKING VERIFICATION
    const currentDbVersion = record.mainMemoryVersion;
    if (Number(expectedVersion) !== currentDbVersion) {
      this.stats.optimisticLockConflicts++;
      const conflictMsg = `Optimistic Locking Conflict: Write rejected! Core ${coreId} submitted expected version ${expectedVersion}, but Main Memory version is ${currentDbVersion}. Another core has committed changes.`;

      this._logSnoopEvent({
        action: 'OPTIMISTIC_LOCK_ABORT',
        recordId,
        sourceCore: coreId,
        targetCore: 'ALL',
        details: conflictMsg,
      });

      return {
        success: false,
        conflict: true,
        error: 'OPTIMISTIC_LOCK_CONFLICT',
        message: conflictMsg,
        currentVersion: currentDbVersion,
        submittedVersion: Number(expectedVersion),
        record: this._formatRecord(record),
      };
    }

    // 2. SUCCESSFUL OPTIMISTIC LOCK
    this.stats.optimisticLockHits++;
    const nextVersion = currentDbVersion + 1;
    const oldMarks = record.mainMemoryMarks;

    // 3. SNOOP BUS BROADCAST: Invalidate all other cores!
    const invalidatedCores = [];
    for (const [cId, cData] of Object.entries(record.coreStates)) {
      if (cId !== coreId) {
        if (cData.state !== MESI_STATES.INVALID) {
          invalidatedCores.push(cId);
          record.coreStates[cId] = {
            state: MESI_STATES.INVALID,
            marks: null, // Data now invalid/stale
            version: null,
            lastEvent: `Snoop Invalidation: ${cData.state} -> [I] by ${coreId}`,
            lastAccessedAt: new Date().toISOString(),
          };
          this.stats.stateTransitions.toInvalid++;
          this.stats.snoopInvalidationsBroadcast++;
        }
      }
    }

    // 4. Update writing core to MODIFIED [M]
    const prev = record.coreStates[coreId]?.state || 'I';
    record.coreStates[coreId] = {
      state: MESI_STATES.MODIFIED,
      marks: Number(updatedMarks),
      version: nextVersion,
      lastEvent: `Write (BusUpgr): ${prev} -> [M]`,
      lastAccessedAt: new Date().toISOString(),
    };
    this.stats.stateTransitions.toModified++;

    // 5. Update Main Memory record
    record.mainMemoryMarks = Number(updatedMarks);
    record.mainMemoryVersion = nextVersion;

    // 6. Invalidate global LRU Cache key for this student
    try {
      lruCache.invalidate(`student:${record.rollNumber}`);
      lruCache.invalidate(`result:MID_TERM:${record.rollNumber}`);
    } catch {
      // LRU cache invalidation safe catch
    }

    const logDetails = `Core ${coreId} updated marks (${oldMarks} -> ${updatedMarks}) for ${record.studentName}. Version bumped to v${nextVersion}. Invalidated caches in: [${invalidatedCores.join(', ') || 'none'}].`;

    this._logSnoopEvent({
      action: 'BUS_UPGRADE_INVALIDATE',
      recordId,
      sourceCore: coreId,
      targetCore: 'ALL_OTHER_CORES',
      details: logDetails,
    });

    return {
      success: true,
      conflict: false,
      recordId,
      coreId,
      state: MESI_STATES.MODIFIED,
      marks: Number(updatedMarks),
      version: nextVersion,
      invalidatedCores,
      message: `Successfully updated marks to ${updatedMarks}. Snoop broadcast invalidated other cores to avoid stale reads.`,
      record: this._formatRecord(record),
    };
  }

  /**
   * Automatically invalidates cached copies across evaluators when a student's marks or record is updated
   */
  invalidateRecordAcrossEvaluators(recordIdOrRoll, updaterCoreId = 'core1') {
    const recordsToInvalidate = [];
    if (this.directory.has(recordIdOrRoll)) {
      recordsToInvalidate.push(this.directory.get(recordIdOrRoll));
    } else {
      for (const rec of this.directory.values()) {
        if (rec.rollNumber === recordIdOrRoll || rec.recordId.includes(recordIdOrRoll)) {
          recordsToInvalidate.push(rec);
        }
      }
    }

    recordsToInvalidate.forEach((record) => {
      for (const [cId, cData] of Object.entries(record.coreStates)) {
        if (cId !== updaterCoreId && cData.state !== MESI_STATES.INVALID) {
          record.coreStates[cId] = {
            state: MESI_STATES.INVALID,
            marks: null,
            version: null,
            lastEvent: `Snoop Invalidation: External Update -> [I]`,
            lastAccessedAt: new Date().toISOString(),
          };
          this.stats.stateTransitions.toInvalid++;
          this.stats.snoopInvalidationsBroadcast++;
        }
      }
    });

    try {
      lruCache.invalidate(`student:${recordIdOrRoll}`);
      lruCache.invalidate(`result:MID_TERM:${recordIdOrRoll}`);
    } catch {
      // safe catch
    }
  }

  /**
   * Helper to format record for API output
   */
  _formatRecord(rec) {
    return {
      recordId: rec.recordId,
      rollNumber: rec.rollNumber,
      studentName: rec.studentName,
      subjectCode: rec.subjectCode,
      subjectName: rec.subjectName,
      mainMemoryMarks: rec.mainMemoryMarks,
      mainMemoryVersion: rec.mainMemoryVersion,
      coreStates: rec.coreStates,
    };
  }

  /**
   * Returns full MESI Matrix across all tracked records and cores
   */
  getMatrix() {
    const records = Array.from(this.directory.values()).map((r) => this._formatRecord(r));

    return {
      records,
      cores: CORES,
      stats: this.stats,
      snoopEvents: this.snoopEvents.slice(0, 50),
      summary: {
        totalRecords: records.length,
        modifiedCount: records.reduce((cnt, r) => cnt + Object.values(r.coreStates).filter((c) => c.state === 'M').length, 0),
        exclusiveCount: records.reduce((cnt, r) => cnt + Object.values(r.coreStates).filter((c) => c.state === 'E').length, 0),
        sharedCount: records.reduce((cnt, r) => cnt + Object.values(r.coreStates).filter((c) => c.state === 'S').length, 0),
        invalidCount: records.reduce((cnt, r) => cnt + Object.values(r.coreStates).filter((c) => c.state === 'I').length, 0),
      },
    };
  }

  /**
   * Internal helper to log snoop bus activities
   */
  _logSnoopEvent({ action, recordId, sourceCore, targetCore, details }) {
    const event = {
      id: `SNOOP-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
      timestamp: new Date().toISOString(),
      action,
      recordId,
      sourceCore,
      targetCore,
      details,
    };

    this.snoopEvents.unshift(event);
    if (this.snoopEvents.length > this.maxSnoopEvents) {
      this.snoopEvents.pop();
    }
  }

  /**
   * Resets coherence directory
   */
  reset() {
    this.directory.clear();
    this.snoopEvents = [];
    this.stats = {
      totalReads: 0,
      totalWrites: 0,
      snoopInvalidationsBroadcast: 0,
      optimisticLockHits: 0,
      optimisticLockConflicts: 0,
      stateTransitions: { toModified: 0, toExclusive: 0, toShared: 0, toInvalid: 0 },
    };
    this._seedCoherenceRecords();
    return this.getMatrix();
  }

  /**
   * Pre-seed representative records demonstrating all 4 MESI states
   */
  _seedCoherenceRecords() {
    const seedData = [
      {
        recordId: 'REC-24CS001-CS301',
        rollNumber: '24CS001',
        studentName: 'Aarav Sharma',
        subjectCode: 'CS301',
        subjectName: 'Computer Architecture & Parallel Processing',
        marks: 88,
        version: 2,
        cores: {
          core1: { state: 'M', marks: 88, version: 2, lastEvent: 'Local Write: S -> [M]' },
          core2: { state: 'I', marks: null, version: null, lastEvent: 'Snoop INV from Core 1' },
          core3: { state: 'I', marks: null, version: null, lastEvent: 'Snoop INV from Core 1' },
          core4: { state: 'I', marks: null, version: null, lastEvent: 'Initial' },
        },
      },
      {
        recordId: 'REC-24CS002-CS301',
        rollNumber: '24CS002',
        studentName: 'Aditi Patel',
        subjectCode: 'CS301',
        subjectName: 'Computer Architecture & Parallel Processing',
        marks: 92,
        version: 1,
        cores: {
          core1: { state: 'S', marks: 92, version: 1, lastEvent: 'BusRd: Loaded Shared' },
          core2: { state: 'S', marks: 92, version: 1, lastEvent: 'BusRd: Loaded Shared' },
          core3: { state: 'S', marks: 92, version: 1, lastEvent: 'BusRd: Loaded Shared' },
          core4: { state: 'I', marks: null, version: null, lastEvent: 'Unloaded' },
        },
      },
      {
        recordId: 'REC-24CS014-CS302',
        rollNumber: '24CS014',
        studentName: 'Dev Mukherjee',
        subjectCode: 'CS302',
        subjectName: 'Operating Systems & Concurrency',
        marks: 85,
        version: 1,
        cores: {
          core1: { state: 'I', marks: null, version: null, lastEvent: 'Unloaded' },
          core2: { state: 'E', marks: 85, version: 1, lastEvent: 'BusRd: Exclusive Clean' },
          core3: { state: 'I', marks: null, version: null, lastEvent: 'Unloaded' },
          core4: { state: 'I', marks: null, version: null, lastEvent: 'Unloaded' },
        },
      },
      {
        recordId: 'REC-24CS025-CS303',
        rollNumber: '24CS025',
        studentName: 'Ishita Sen',
        subjectCode: 'CS303',
        subjectName: 'Design & Analysis of Algorithms',
        marks: 78,
        version: 3,
        cores: {
          core1: { state: 'I', marks: null, version: null, lastEvent: 'Snoop Invalidate' },
          core2: { state: 'I', marks: null, version: null, lastEvent: 'Snoop Invalidate' },
          core3: { state: 'M', marks: 78, version: 3, lastEvent: 'Admin Override Write' },
          core4: { state: 'I', marks: null, version: null, lastEvent: 'Initial' },
        },
      },
      {
        recordId: 'REC-24CS042-CS301',
        rollNumber: '24CS042',
        studentName: 'Ananya Roy',
        subjectCode: 'CS301',
        subjectName: 'Computer Architecture & Parallel Processing',
        marks: 81,
        version: 1,
        cores: {
          core1: { state: 'S', marks: 81, version: 1, lastEvent: 'BusRd: Loaded Shared' },
          core2: { state: 'I', marks: null, version: null, lastEvent: 'Initial' },
          core3: { state: 'S', marks: 81, version: 1, lastEvent: 'BusRd: Loaded Shared' },
          core4: { state: 'S', marks: 81, version: 1, lastEvent: 'BusRd: Loaded Shared' },
        },
      },
    ];

    seedData.forEach((sd) => {
      this.directory.set(sd.recordId, {
        recordId: sd.recordId,
        rollNumber: sd.rollNumber,
        studentName: sd.studentName,
        subjectCode: sd.subjectCode,
        subjectName: sd.subjectName,
        mainMemoryMarks: sd.marks,
        mainMemoryVersion: sd.version,
        coreStates: {
          core1: { ...sd.cores.core1, lastAccessedAt: new Date().toISOString() },
          core2: { ...sd.cores.core2, lastAccessedAt: new Date().toISOString() },
          core3: { ...sd.cores.core3, lastAccessedAt: new Date().toISOString() },
          core4: { ...sd.cores.core4, lastAccessedAt: new Date().toISOString() },
        },
      });
    });

    this._logSnoopEvent({
      action: 'BOOTSTRAP_DIRECTORY',
      recordId: 'ALL',
      sourceCore: 'SYSTEM',
      targetCore: 'ALL',
      details: 'MESI Coherence Directory initialized with 5 multi-core academic cohorts.',
    });
  }
}

// Export singleton instance
export const cacheCoherence = new CacheCoherenceManager();
export default cacheCoherence;
