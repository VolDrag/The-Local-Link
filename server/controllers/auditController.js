import AuditLog from '../models/AuditLog.js';

export const getAuditLogs = async (req, res) => {
  try {
    const { targetType, limit = 100 } = req.query;
    const filter = targetType ? { targetType } : {};
    const logs = await AuditLog.find(filter)
      .populate('admin', 'username email')
      .sort({ createdAt: -1 })
      .limit(Math.min(parseInt(limit, 10) || 100, 300));
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load audit logs' });
  }
};
