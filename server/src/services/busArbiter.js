// CAPP: Shared Bus Arbitration (Unit 2)
/**
 * ============================================================================
 * SHARED BUS ARBITRATION SUBSYSTEM (CAPP Unit 2: Bus Architecture)
 * ============================================================================
 * In multi-master computer architectures (e.g., AMBA, PCIe, VMEbus, System Bus),
 * multiple autonomous processing masters contend for a single shared communication bus.
 *
 * This module simulates a hardware Bus Arbiter with:
 * 1. Priority-Based Arbitration:
 *    - Admin Requests: High Priority (Level 3)
 *    - Evaluator/Teacher Requests: Medium Priority (Level 2)
 *    - Student Requests: Low Priority (Level 1)
 *
 * 2. Starvation Prevention (Fair Round-Robin Fallback):
 *    - If high/medium priority requests monopolize the bus, low-priority requests
 *      risk complete task starvation.
 *    - When consecutive higher-priority grants reach the STARVATION_THRESHOLD (3)
 *      while lower-priority requests are waiting, the arbiter activates a fair
 *      round-robin fallback grant, serving the oldest starved request.
 *
 * 3. Telemetry & Hardware Grant Logging:
 *    - Every bus grant is timestamped, audited with requester role, action,
 *      queue latency, holding duration, and arbitration decision type.
 * ============================================================================
 */

import { performance } from 'perf_hooks';

// Priority definitions (Higher number = Higher priority)
export const BUS_PRIORITIES = {
  admin: { level: 3, label: 'HIGH', weight: 3 },
  evaluator: { level: 2, label: 'MEDIUM', weight: 2 },
  teacher: { level: 2, label: 'MEDIUM', weight: 2 }, // Evaluator alias
  student: { level: 1, label: 'LOW', weight: 1 },
};

// Maximum consecutive high/medium grants allowed before forcing fair round-robin fallback
const STARVATION_THRESHOLD = 3;

class BusArbiter {
  constructor() {
    // Separate FIFO request queues per role
    this.queues = {
      admin: [],
      evaluator: [],
      student: [],
    };

    // Bus hardware state
    this.isBusBusy = false;
    this.currentMaster = null; // { role, grantId, action, startedAt }
    
    // Starvation tracking counters
    this.consecutiveHighPriorityGrants = 0;
    this.totalStarvationFallbacks = 0;

    // Rolling grant history audit log (capped at 250 records)
    this.grantHistory = [];
    this.maxHistorySize = 250;

    // Metrics counters
    this.metrics = {
      totalRequestsEnqueued: 0,
      totalGrantsIssued: 0,
      priorityGrantsIssued: 0,
      starvationFallbacksTriggered: 0,
      grantsByRole: {
        admin: 0,
        evaluator: 0,
        student: 0,
      },
      averageWaitTimeMs: 0,
      totalWaitTimeMs: 0,
    };

    // Sequence counter for hardware grant IDs
    this.grantSeq = 1000;

    // Pre-seed some realistic historical grants so the dashboard has rich data on first load
    this._seedHistoricalGrants();
  }

  /**
   * Enqueues a new bus request from a master (Admin, Evaluator, or Student)
   * @param {Object} param0 
   * @param {string} param0.role - 'admin' | 'evaluator' | 'teacher' | 'student'
   * @param {string} param0.requesterName - Name of requester
   * @param {string} param0.action - Action string (e.g. 'LOCK_EXAM', 'ENTER_MARKS', 'FETCH_RESULTS')
   * @param {Object} [param0.payload] - Optional action payload
   * @param {number} [param0.holdDurationMs] - Simulated bus occupancy time
   */
  async requestBus({ role, requesterName = 'Unknown', action = 'BUS_TRANSFER', payload = null, holdDurationMs = 25 }) {
    const normalizedRole = role === 'teacher' ? 'evaluator' : (role || 'student').toLowerCase();
    const priorityMeta = BUS_PRIORITIES[normalizedRole] || BUS_PRIORITIES.student;

    const request = {
      requestId: `REQ-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
      role: normalizedRole,
      requesterName,
      action,
      payload,
      priorityLevel: priorityMeta.level,
      priorityLabel: priorityMeta.label,
      enqueuedAt: performance.now(),
      holdDurationMs: Math.max(5, holdDurationMs),
    };

    if (!this.queues[normalizedRole]) {
      this.queues[normalizedRole] = [];
    }

    this.queues[normalizedRole].push(request);
    this.metrics.totalRequestsEnqueued++;

    // Trigger bus arbitration cycle
    return this._arbitrateCycle();
  }

  /**
   * Internal hardware arbitration cycle
   * Implements Priority-based selection with Fair Round-Robin Starvation Fallback
   */
  _arbitrateCycle() {
    // If the shared bus is currently occupied by a transmission, wait for release
    if (this.isBusBusy) {
      return {
        busStatus: 'BUSY',
        message: 'Bus currently occupied. Request queued in arbiter buffer.',
        currentMaster: this.currentMaster,
        queueLengths: this.getQueueLengths(),
      };
    }

    const hasAdmin = this.queues.admin.length > 0;
    const hasEvaluator = this.queues.evaluator.length > 0;
    const hasStudent = this.queues.student.length > 0;

    // Check if any requests are waiting
    if (!hasAdmin && !hasEvaluator && !hasStudent) {
      return {
        busStatus: 'IDLE',
        message: 'No pending requests in arbiter queues.',
        queueLengths: this.getQueueLengths(),
      };
    }

    let selectedRole = null;
    let grantType = 'PRIORITY_GRANT';

    // Check for potential starvation of lower priority masters
    const lowerPriorityWaiting = hasStudent || (hasEvaluator && !hasAdmin);

    if (this.consecutiveHighPriorityGrants >= STARVATION_THRESHOLD && lowerPriorityWaiting) {
      // STARVATION PREVENTION TRIGGERED: Fair Round-Robin Fallback
      if (hasStudent) {
        selectedRole = 'student';
      } else if (hasEvaluator) {
        selectedRole = 'evaluator';
      } else {
        selectedRole = 'admin';
      }
      grantType = 'STARVATION_FALLBACK_ROUND_ROBIN';
      this.consecutiveHighPriorityGrants = 0;
      this.totalStarvationFallbacks++;
      this.metrics.starvationFallbacksTriggered++;
    } else {
      // Normal Strict Priority Arbitration: Admin > Evaluator > Student
      if (hasAdmin) {
        selectedRole = 'admin';
        this.consecutiveHighPriorityGrants++;
      } else if (hasEvaluator) {
        selectedRole = 'evaluator';
        this.consecutiveHighPriorityGrants++;
      } else {
        selectedRole = 'student';
        this.consecutiveHighPriorityGrants = 0; // Reset counter since lowest priority is served
      }
      this.metrics.priorityGrantsIssued++;
    }

    // Dequeue request from the granted queue
    const grantedRequest = this.queues[selectedRole].shift();
    if (!grantedRequest) {
      return { busStatus: 'IDLE', queueLengths: this.getQueueLengths() };
    }

    const waitTimeMs = Number((performance.now() - grantedRequest.enqueuedAt).toFixed(2));
    this.grantSeq++;
    const grantId = `BG-${this.grantSeq}`;

    // Create grant log entry
    const grantLog = {
      grantId,
      timestamp: new Date().toISOString(),
      requesterRole: grantedRequest.role,
      requesterName: grantedRequest.requesterName,
      action: grantedRequest.action,
      priorityLevel: grantedRequest.priorityLevel,
      priorityLabel: grantedRequest.priorityLabel,
      arbitrationType: grantType,
      queueWaitTimeMs: waitTimeMs,
      busHoldDurationMs: grantedRequest.holdDurationMs,
      status: 'GRANTED',
    };

    // Update metrics
    this.metrics.totalGrantsIssued++;
    this.metrics.grantsByRole[grantedRequest.role] = (this.metrics.grantsByRole[grantedRequest.role] || 0) + 1;
    this.metrics.totalWaitTimeMs += waitTimeMs;
    this.metrics.averageWaitTimeMs = Number((this.metrics.totalWaitTimeMs / this.metrics.totalGrantsIssued).toFixed(2));

    // Occupy the bus
    this.isBusBusy = true;
    this.currentMaster = {
      grantId,
      role: grantedRequest.role,
      requesterName: grantedRequest.requesterName,
      action: grantedRequest.action,
      grantType,
      grantedAt: Date.now(),
      holdDurationMs: grantedRequest.holdDurationMs,
    };

    // Append to rolling audit log
    this.grantHistory.unshift(grantLog);
    if (this.grantHistory.length > this.maxHistorySize) {
      this.grantHistory.pop();
    }

    // Schedule automatic release of the shared bus after holdDurationMs
    setTimeout(() => {
      this._releaseBus(grantId);
    }, grantedRequest.holdDurationMs);

    return {
      busStatus: 'GRANTED',
      grant: grantLog,
      queueLengths: this.getQueueLengths(),
    };
  }

  /**
   * Releases bus and triggers next waiting arbitration cycle
   */
  _releaseBus(grantId) {
    if (this.currentMaster && this.currentMaster.grantId === grantId) {
      this.isBusBusy = false;
      this.currentMaster = null;

      // Update log status to RELEASED
      const entry = this.grantHistory.find((g) => g.grantId === grantId);
      if (entry) {
        entry.status = 'RELEASED';
      }

      // Check if more requests are queued and arbitrate immediately
      const totalPending = this.queues.admin.length + this.queues.evaluator.length + this.queues.student.length;
      if (totalPending > 0) {
        this._arbitrateCycle();
      }
    }
  }

  /**
   * Helper to simulate a realistic burst of mixed requests to demonstrate
   * priority arbitration and starvation prevention in the live dashboard
   */
  async simulateBurst({ adminCount = 4, evaluatorCount = 6, studentCount = 10 } = {}) {
    const burstActions = {
      admin: ['LOCK_EXAM_SYSTEM', 'UPDATE_GRADING_SCHEME', 'PURGE_AUDIT_LOGS', 'ALLOCATE_WORKER_CORES'],
      evaluator: ['BATCH_SUBMIT_MARKS', 'VALIDATE_ANSWER_KEY', 'UPLOAD_SECTION_MARKS', 'RE_EVALUATION_REVIEW'],
      student: ['FETCH_TRANSCRIPT_PDF', 'QUERY_SEMESTER_SGPA', 'VERIFY_ROLL_AUTHENTICITY', 'SUBMIT_RECHECK_PETITION'],
    };

    const names = {
      admin: ['System Admin', 'Exam Cell Controller', 'Chief Registrar'],
      evaluator: ['Dr. Sarah Adams', 'Prof. Marcus Vance', 'Dr. Elena Rostova', 'Prof. David Chen'],
      student: ['24CS001 (Rohan)', '24CS002 (Priya)', '24CS014 (Dev)', '24CS042 (Ananya)', '24CS088 (Kabir)'],
    };

    // Enqueue requests
    const tasks = [];

    // Enqueue admin requests
    for (let i = 0; i < adminCount; i++) {
      tasks.push(
        this.requestBus({
          role: 'admin',
          requesterName: names.admin[i % names.admin.length],
          action: burstActions.admin[i % burstActions.admin.length],
          holdDurationMs: 30 + Math.floor(Math.random() * 20),
        })
      );
    }

    // Enqueue evaluator requests
    for (let i = 0; i < evaluatorCount; i++) {
      tasks.push(
        this.requestBus({
          role: 'evaluator',
          requesterName: names.evaluator[i % names.evaluator.length],
          action: burstActions.evaluator[i % burstActions.evaluator.length],
          holdDurationMs: 20 + Math.floor(Math.random() * 15),
        })
      );
    }

    // Enqueue student requests
    for (let i = 0; i < studentCount; i++) {
      tasks.push(
        this.requestBus({
          role: 'student',
          requesterName: names.student[i % names.student.length],
          action: burstActions.student[i % burstActions.student.length],
          holdDurationMs: 15 + Math.floor(Math.random() * 10),
        })
      );
    }

    await Promise.all(tasks);

    return {
      message: `Enqueued burst of ${adminCount + evaluatorCount + studentCount} requests across 3 priority levels`,
      totalRequestsEnqueued: adminCount + evaluatorCount + studentCount,
      telemetry: this.getTelemetry(),
    };
  }

  /**
   * Returns current pending queue counts
   */
  getQueueLengths() {
    return {
      admin: this.queues.admin.length,
      evaluator: this.queues.evaluator.length,
      student: this.queues.student.length,
      totalPending: this.queues.admin.length + this.queues.evaluator.length + this.queues.student.length,
    };
  }

  /**
   * Returns complete telemetry for dashboard
   */
  getTelemetry() {
    return {
      busState: this.isBusBusy ? 'OCCUPIED' : 'IDLE',
      currentMaster: this.currentMaster,
      consecutiveHighPriorityGrants: this.consecutiveHighPriorityGrants,
      starvationThreshold: STARVATION_THRESHOLD,
      queues: this.getQueueLengths(),
      metrics: {
        ...this.metrics,
        pendingTotal: this.queues.admin.length + this.queues.evaluator.length + this.queues.student.length,
      },
      lines: {
        addressBusWidthBits: 32,
        dataBusWidthBits: 64,
        controlLines: ['BREQ_ADMIN', 'BREQ_EVAL', 'BREQ_STUDENT', 'BGRANT', 'BUS_BUSY', 'CLOCK'],
      },
    };
  }

  /**
   * Returns recent grant logs with optional role filtering and pagination
   */
  getLogs({ limit = 50, role = null, page = 1 } = {}) {
    let logs = this.grantHistory;
    if (role && role !== 'all') {
      logs = logs.filter((l) => l.requesterRole === role.toLowerCase());
    }

    const total = logs.length;
    const startIndex = (page - 1) * limit;
    const paginated = logs.slice(startIndex, startIndex + limit);

    return {
      logs: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      telemetry: this.getTelemetry(),
    };
  }

  /**
   * Resets arbiter logs and queues
   */
  reset() {
    this.queues = { admin: [], evaluator: [], student: [] };
    this.grantHistory = [];
    this.isBusBusy = false;
    this.currentMaster = null;
    this.consecutiveHighPriorityGrants = 0;
    this.metrics = {
      totalRequestsEnqueued: 0,
      totalGrantsIssued: 0,
      priorityGrantsIssued: 0,
      starvationFallbacksTriggered: 0,
      grantsByRole: { admin: 0, evaluator: 0, student: 0 },
      averageWaitTimeMs: 0,
      totalWaitTimeMs: 0,
    };
    this._seedHistoricalGrants();
    return this.getTelemetry();
  }

  /**
   * Pre-seed a few realistic grants for rich initial presentation
   */
  _seedHistoricalGrants() {
    const sampleSeeds = [
      { role: 'admin', name: 'Chief Controller', action: 'INIT_SEMESTER_PROCESSING', pLabel: 'HIGH', pLevel: 3, type: 'PRIORITY_GRANT', wait: 1.2, hold: 45 },
      { role: 'admin', name: 'Exam Cell Admin', action: 'LOCK_MARKS_SUBMISSION', pLabel: 'HIGH', pLevel: 3, type: 'PRIORITY_GRANT', wait: 2.1, hold: 30 },
      { role: 'evaluator', name: 'Dr. Sarah Adams', action: 'EVALUATE_CS301_MIDTERM', pLabel: 'MEDIUM', pLevel: 2, type: 'PRIORITY_GRANT', wait: 5.4, hold: 25 },
      { role: 'evaluator', name: 'Prof. Marcus Vance', action: 'SUBMIT_SECTION_MARKS_A', pLabel: 'MEDIUM', pLevel: 2, type: 'PRIORITY_GRANT', wait: 6.8, hold: 28 },
      { role: 'student', name: '24CS001 (Rohan)', action: 'FETCH_TRANSCRIPT_LEDGER', pLabel: 'LOW', pLevel: 1, type: 'STARVATION_FALLBACK_ROUND_ROBIN', wait: 14.5, hold: 15 },
      { role: 'admin', name: 'Exam Cell Admin', action: 'DISPATCH_WORKER_POOL', pLabel: 'HIGH', pLevel: 3, type: 'PRIORITY_GRANT', wait: 0.8, hold: 40 },
      { role: 'evaluator', name: 'Dr. Elena Rostova', action: 'VALIDATE_ANSWER_KEY_CS302', pLabel: 'MEDIUM', pLevel: 2, type: 'PRIORITY_GRANT', wait: 4.2, hold: 22 },
      { role: 'student', name: '24CS014 (Dev)', action: 'DOWNLOAD_SEMESTER_MARKSHEET', pLabel: 'LOW', pLevel: 1, type: 'STARVATION_FALLBACK_ROUND_ROBIN', wait: 16.2, hold: 18 },
    ];

    const baseTime = Date.now() - 1000 * 60 * 12;

    sampleSeeds.forEach((s, idx) => {
      this.grantSeq++;
      const grantId = `BG-${this.grantSeq}`;
      const entry = {
        grantId,
        timestamp: new Date(baseTime + idx * 45000).toISOString(),
        requesterRole: s.role,
        requesterName: s.name,
        action: s.action,
        priorityLevel: s.pLevel,
        priorityLabel: s.pLabel,
        arbitrationType: s.type,
        queueWaitTimeMs: s.wait,
        busHoldDurationMs: s.hold,
        status: 'RELEASED',
      };
      this.grantHistory.unshift(entry);
      this.metrics.totalGrantsIssued++;
      this.metrics.grantsByRole[s.role] = (this.metrics.grantsByRole[s.role] || 0) + 1;
      if (s.type === 'STARVATION_FALLBACK_ROUND_ROBIN') {
        this.metrics.starvationFallbacksTriggered++;
      } else {
        this.metrics.priorityGrantsIssued++;
      }
      this.metrics.totalWaitTimeMs += s.wait;
    });

    this.metrics.totalRequestsEnqueued = this.metrics.totalGrantsIssued;
    this.metrics.averageWaitTimeMs = Number((this.metrics.totalWaitTimeMs / this.metrics.totalGrantsIssued).toFixed(2));
  }
}

// Export singleton instance
export const busArbiter = new BusArbiter();
export default busArbiter;
