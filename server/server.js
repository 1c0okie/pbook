import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import authorRoutes from './routes/author.routes.js';
import bookRoutes from './routes/book.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import orderRoutes from './routes/order.routes.js';
import userRoutes from './routes/user.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import settingRoutes from './routes/setting.routes.js';
import postRoutes from './routes/post.routes.js';
import faqRoutes from './routes/faq.routes.js';
import contactRoutes from './routes/contact.routes.js';
import auditRoutes from './routes/audit.routes.js'; // Route cho Audit Log
dotenv.config();
connectDB();
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Phân tích JSON body
// Tạo một Route mặc định để UptimeRobot kiểm tra (Health Check)
app.get('/', (req, res) => {
  res.status(200).send('Backend PBook đang chạy ngon lành!');
});
// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes); // Route danh mục
app.use('/api/v1/authors', authorRoutes);     // Route tác giả
app.use('/api/v1/books', bookRoutes);        // Route Sách
app.use('/api/v1/upload', uploadRoutes);     // Route Upload Ảnh
app.use('/api/v1/orders', orderRoutes);     // Route Đơn hàng
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/settings', settingRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/faqs', faqRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/audit-logs', auditRoutes); // Route cho Audit Log
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});