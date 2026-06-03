import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import Message from './models/Message.js';
import User from './models/User.js';
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
import chatRoutes from './routes/chat.routes.js'; // Route cho Chat
// ==========================================
// 1. IMPORT THƯ VIỆN CHO SOCKET.IO
// ==========================================
import http from 'http';
import { Server } from 'socket.io';

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
app.use('/api/v1/chat', chatRoutes); // Route cho Chat
// ==========================================
// 2. KHỞI TẠO HTTP SERVER VÀ SOCKET.IO
// ==========================================
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Lưu ý: Khi lên production, bạn nên thay "*" bằng domain frontend của bạn (VD: "https://pbook.com")
    methods: ["GET", "POST"]
  }
});

// Lắng nghe các kết nối từ client
io.on('connection', (socket) => {
  console.log(`[Socket] Khách hàng kết nối: ${socket.id}`);
// Khi người dùng (hoặc admin) đăng nhập, đưa họ vào 1 "phòng"
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`[Socket] 🚪 Đã join phòng: ${room}`);
  });
// Lắng nghe sự kiện gửi tin nhắn mới
  socket.on('send_message', async (messageData) => {
    try {
      const validReceiver = (typeof messageData.receiverId === 'string') ? messageData.receiverId : null;

      // 1. LƯU VÀO DATABASE ĐỂ LẤY MÃ _ID CHUẨN
      const savedMsg = await Message.create({
        sender: messageData.senderId,
        receiver: validReceiver,
        text: messageData.text,
        attachedBook: messageData.attachedBook?._id || messageData.attachedBook || null,
        attachedOrder: messageData.attachedOrder?._id || messageData.attachedOrder || null
      });

      // 2. GÓI DỮ LIỆU ĐÃ CÓ KÈM _ID CỦA DATABASE ĐỂ TRẢ VỀ FRONTEND
      const emitData = {
        _id: savedMsg._id, // Quan trọng: Có ID này Frontend mới chịu render real-time
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        receiverId: validReceiver,
        text: messageData.text,
        attachedBook: messageData.attachedBook,
        attachedOrder: messageData.attachedOrder,
        timestamp: savedMsg.createdAt
      };

      // 3. PHÁT TIN NHẮN
      if (validReceiver) {
        // Nếu là Admin trả lời User -> Bắn thẳng về phòng của User
        io.to(validReceiver).emit('receive_message', emitData);
      } else {
        // Nếu là User nhắn -> Bắn vào phòng chung của Admin
        io.to('admin_room').emit('receive_message', emitData);
        
        // Tự động trả lời khi Admin offline
        const adminSockets = await io.in('admin_room').fetchSockets();
        if (adminSockets.length === 0) {
          const defaultAdmin = await User.findOne({ isAdmin: true });
          if (defaultAdmin) {
            const autoMsg = await Message.create({
              sender: defaultAdmin._id,
              receiver: messageData.senderId,
              text: "👋 Chào bạn, hiện tại Admin không online. Chúng tôi đã ghi nhận tin nhắn và sẽ phản hồi bạn sớm nhất có thể nhé!",
            });
            
            io.to(messageData.senderId).emit('receive_message', {
              _id: autoMsg._id,
              senderId: defaultAdmin._id.toString(),
              senderName: "Hệ thống tự động",
              receiverId: messageData.senderId,
              text: autoMsg.text,
              timestamp: autoMsg.createdAt
            });
          }
        }
      }
    } catch (error) {
      console.error("Lỗi socket send_message:", error);
    }
  });
  socket.on('disconnect', () => {
    console.log(`[Socket] Khách hàng ngắt kết nối: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

// ==========================================
// 3. ĐỔI app.listen THÀNH server.listen
// ==========================================
server.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Socket.io is ready!`);
});