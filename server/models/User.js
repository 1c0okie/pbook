import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    isAdmin: { type: Boolean, required: true, default: false },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    // Thêm vào bên trong userSchema
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // THÊM TRƯỜNG NÀY:
    addresses: [
      {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        city: { type: String, required: true },
        address: { type: String, required: true },
        isDefault: { type: Boolean, default: false } // Đánh dấu địa chỉ mặc định
      }
    ]
  },
  { timestamps: true }
);

// Middleware băm mật khẩu trước khi lưu
userSchema.pre('save', async function () {
  // Nếu trường password KHÔNG bị thay đổi (Ví dụ: chỉ đang cập nhật Wishlist)
  // thì dừng lại (return) và bỏ qua việc băm mật khẩu
  if (!this.isModified('password')) {
    return; // <-- Thay next() hoặc return next() bằng return;
  }

  // Chỉ chạy xuống dưới đây nếu đang tạo user mới hoặc đổi mật khẩu
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.error("Lỗi mã hóa mật khẩu:", error);
  }
});

// Method kiểm tra mật khẩu
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);