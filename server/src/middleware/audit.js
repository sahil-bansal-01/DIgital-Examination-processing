import { AuditLog } from '../models/LogsAndRuns.js';

export const logAudit = async ({
  userId,
  userName = 'System',
  userRole = 'system',
  action,
  module,
  details,
  oldValue = null,
  newValue = null,
  ipAddress = '',
}) => {
  try {
    await AuditLog.create({
      userId,
      userName,
      userRole,
      action,
      module,
      details,
      oldValue,
      newValue,
      ipAddress,
    });
  } catch (err) {
    console.error('Failed to create audit log entry:', err);
  }
};
