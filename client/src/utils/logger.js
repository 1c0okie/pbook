import AuditLog from '../models/AuditLog.js';

export const createLog = async (req, action, module, details) => {
  try {
    await AuditLog.create({
      user: req.user._id,
      action,
      module,
      details,
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent']
    });
  } catch (error) {
    console.error('Lỗi ghi Audit Log:', error);
  }
};