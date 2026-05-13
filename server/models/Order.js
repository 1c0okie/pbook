import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // CƠ CHẾ SNAPSHOT: Lưu cứng thông tin sách lúc mua
    orderItems: [
      {
        title: { type: String, required: true },
        qty: { type: Number, required: true },
        imageUrl: { type: String, required: true },
        price: { type: Number, required: true }, // Giá chốt lúc mua (sale_price hoặc price)
        book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true }, // Vẫn giữ Ref để lúc cần có thể link ngược lại
      },
    ],
    
    // CƠ CHẾ SNAPSHOT: Lưu cứng địa chỉ giao hàng
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
    },
    
    paymentMethod: { type: String, required: true }, // COD, VNPay, Momo...
    
    itemsPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalAmount: { type: Number, required: true, default: 0.0 },
    
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    payosOrderCode: { type: Number }, // Mã đơn hàng trả về từ PayOS (nếu thanh toán qua PayOS) 
    status: { 
      type: String, 
      required: true, 
      enum: ['Chờ thanh toán' , 'Chờ xác nhận', 'Đang giao hàng', 'Đã giao', 'Đã hủy'],
      default: 'Chờ xác nhận' 
    },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);