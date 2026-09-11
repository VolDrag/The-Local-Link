import AuditLog from '../models/AuditLog.js';

export const writeAudit = async ({ admin, action, targetType, targetId, details = {}, req }) => {
  try {
    await AuditLog.create({
      admin: admin?._id || admin,
      action,
      targetType,
      targetId: targetId || undefined,
      details,
      ip: req?.ip,
      userAgent: req?.headers?.['user-agent'],
    });
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
  }
};
