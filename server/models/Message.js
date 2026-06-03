import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null nếu là gửi chung cho Admin
  text: { type: String, default: "" },
  
  // Lưu đính kèm Sách hoặc Đơn hàng
  attachedBook: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  attachedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);