import AuditLog from '../models/AuditLog.js';

// === 1. HÀM HELPER (Dùng nội bộ trong Backend) ===
// Hàm này gọi bất cứ khi nào cần ghi log
export const logAction = async (userId, action, resource, description) => {
  try {
    if (userId) {
      await AuditLog.create({ user: userId, action, resource, description });
    }
  } catch (error) {
    console.error('Lỗi khi ghi Audit Log:', error);
  }
};

// === 2. API CHO ADMIN XEM DANH SÁCH LOG ===
// @desc    Lấy danh sách nhật ký hoạt động
// @route   GET /api/v1/audit-logs
export const getLogs = async (req, res, next) => {
  try {
    // Lấy 200 hành động gần nhất (tránh load quá nhiều gây lag)
    const logs = await AuditLog.find()
      .populate('user', 'firstname lastname email')
      .sort({ createdAt: -1 })
      .limit(200); 
    res.json(logs);
  } catch (error) {
    next(error);
  }
};