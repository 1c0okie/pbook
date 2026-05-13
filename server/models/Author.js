import mongoose from 'mongoose';

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    bio: { type: String },
    avatarUrl: { type: String }, // Sẽ chứa link URL từ Cloudinary
    // Liên kết hai chiều (Tùy chọn) để dễ dàng query sách của tác giả
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }] 
  },
  { timestamps: true }
);

export default mongoose.model('Author', authorSchema);