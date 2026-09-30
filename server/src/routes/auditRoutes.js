import express from 'express';
import { AuditLog } from '../models/LogsAndRuns.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get('/', async (req, res) => {
  try {
    const { module, action, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (module) filter.module = module;
    if (action) filter.action = action;

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, totalCount] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: logs.length,
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
      currentPage: Number(page),
      logs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
