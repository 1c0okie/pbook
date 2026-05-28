import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true }, // VD: TET2026
  discount: { type: Number, required: true, min: 1, max: 100 }, // Phần trăm giảm (1 - 100)
  expiryDate: { type: Date, required: true }, // Ngày hết hạn
  isActive: { type: Boolean, default: true }, // Trạng thái (Bật/Tắt),
  isShowOnHome: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Coupon', couponSchema);