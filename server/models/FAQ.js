import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  isActive: { type: Boolean, default: true } // Cho phép Admin tạm ẩn câu hỏi nếu nó không còn phù hợp
}, { timestamps: true });

export default mongoose.model('FAQ', faqSchema);