import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    bannerUrl: { type: String }, // Sẽ chứa link URL từ Cloudinary
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);