import mongoose from 'mongoose';

// 1. Tạo Schema cho Review
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    avatarUrl: { type: String, default: "" },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" }, // <-- THÊM TRƯỜNG NÀY ĐỂ LƯU MÔ TẢ
    price: { type: Number, required: true },
    sale_price: { type: Number, default: 0 },
    imageUrl: { type: String, required: true }, 
    quantityInStock: { type: Number, required: true, default: 0 },
    sold: { type: Number, default: 0 }, 
    
    // Khóa ngoại liên kết
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
    
    // Thẻ phân loại hiển thị trên Frontend
    isTrending: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },

    reviews: [reviewSchema], 
    rating: { type: Number, required: true, default: 0 }, 
    numReviews: { type: Number, required: true, default: 0 }, 
  },
  { timestamps: true }
);

export default mongoose.model('Book', bookSchema);