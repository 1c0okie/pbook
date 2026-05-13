import Contact from '../models/Contact.js';
import { logAction } from './audit.controller.js'; // Import hàm ghi log

// @desc    Khách hàng gửi liên hệ (Public)
export const sendContact = async (req, res, next) => {
  try {
    const contact = await Contact.create(req.body);
    
    // GHI LOG: Khách gửi liên hệ mới
    await logAction(
      req.user?._id, // Nếu khách vãng lai chưa đăng nhập thì sẽ là undefined, Audit Log sẽ hiện là "Hệ thống"
      'THÊM', 
      'Liên Hệ', 
      `Có lời nhắn liên hệ mới từ: ${contact.name} (${contact.email})`
    );

    res.status(201).json({ message: 'Gửi liên hệ thành công', contact });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy danh sách liên hệ (Admin) - Thao tác XEM nên không cần ghi log
export const getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa liên hệ (Admin)
export const deleteContact = async (req, res, next) => {
  try {
    // Lấy thông tin contact trước khi xóa để lấy tên người gửi ghi vào log
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (contact) {
      // GHI LOG: Admin xóa liên hệ
      await logAction(
        req.user._id, 
        'XÓA', 
        'Liên Hệ', 
        `Đã xóa tin nhắn liên hệ của: ${contact.name}`
      );
    }

    res.json({ message: 'Đã xóa liên hệ' });
  } catch (error) {
    next(error);
  }
};

// @desc    Đánh dấu đã đọc (Admin)
export const markAsRead = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (contact) {
      contact.isRead = true;
      await contact.save();

      // GHI LOG: Admin thay đổi trạng thái
      await logAction(
        req.user._id, 
        'SỬA', 
        'Liên Hệ', 
        `Đã đánh dấu Đã Đọc cho tin nhắn của: ${contact.name}`
      );
    }
    res.json({ message: 'Đã đánh dấu đã đọc' });
  } catch (error) {
    next(error);
  }
};