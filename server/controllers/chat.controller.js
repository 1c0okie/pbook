import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Lấy danh sách các khách hàng đã từng nhắn tin
export const getConversations = async (req, res, next) => {
  try {
    const senders = await Message.distinct('sender');
    const customers = await User.find({ _id: { $in: senders, $ne: req.user._id } })
                                .select('firstname lastname avatarUrl email')
                                .lean(); // Dùng lean() để dễ dàng chèn thêm thuộc tính

    // ĐẾM SỐ TIN NHẮN CHƯA ĐỌC TỪ DATABASE
    const formattedCustomers = await Promise.all(customers.map(async (customer) => {
       const unreadCount = await Message.countDocuments({
          sender: customer._id,
          isRead: false // Chỉ đếm những tin nhắn chưa đọc
       });
       return { ...customer, unreadCount };
    }));

    // Sắp xếp: Ưu tiên đẩy những người có tin nhắn chưa đọc lên trên cùng
    formattedCustomers.sort((a, b) => b.unreadCount - a.unreadCount);

    res.json(formattedCustomers);
  } catch (error) { next(error); }
};

// @desc    Lấy lịch sử chat và TỰ ĐỘNG ĐÁNH DẤU ĐÃ ĐỌC
export const getMessagesByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // 1. CẬP NHẬT TẤT CẢ TIN NHẮN DO KHÁCH GỬI THÀNH "ĐÃ ĐỌC"
    await Message.updateMany(
      { sender: userId, isRead: false },
      { $set: { isRead: true } }
    );

    // 2. Lấy lịch sử chat như bình thường
    const messages = await Message.find({
      $or: [ { sender: userId }, { receiver: userId } ]
    })
    .populate('attachedBook', 'title imageUrl sale_price') 
    .populate('attachedOrder')
    .sort({ createdAt: 1 }); 

    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      senderId: msg.sender,
      receiverId: msg.receiver,
      text: msg.text,
      attachedBook: msg.attachedBook,
      attachedOrder: msg.attachedOrder,
      timestamp: msg.createdAt
    }));

    res.json(formattedMessages);
  } catch (error) { next(error); }
};