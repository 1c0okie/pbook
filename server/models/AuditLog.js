import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Ai làm?
  action: { type: String, required: true }, // Làm gì? (VD: THÊM, SỬA, XÓA, ĐĂNG NHẬP)
  resource: { type: String, required: true }, // Tác động vào đâu? (VD: Sản phẩm, Đơn hàng, Cài đặt)
  description: { type: String, required: true }, // Chi tiết (VD: Đã xóa sản phẩm "Sách A")
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);