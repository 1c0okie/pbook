import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'Tin tức' },
  imageUrl: { type: String },
  summary: { type: String, required: true },
  content: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isPinned: { type: Boolean, default: false } // <--- THÊM DÒNG NÀY (Mặc định không ghim)
}, { timestamps: true });

export default mongoose.model('Post', postSchema);