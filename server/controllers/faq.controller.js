import FAQ from '../models/FAQ.js';
import { logAction } from './audit.controller.js'; // Nhúng hàm ghi log

export const getFAQs = async (req, res, next) => {
  try {
    // THAY ĐỔI Ở ĐÂY
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const faqs = await FAQ.find(filter).sort({ createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    next(error);
  }
};

export const createFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.create(req.body);
    
    // GHI LOG: Thêm câu hỏi
    await logAction(
      req.user._id, 
      'THÊM', 
      'FAQ', 
      `Đã thêm câu hỏi thường gặp: "${faq.question}"`
    );

    res.status(201).json(faq);
  } catch (error) {
    next(error);
  }
};

export const updateFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    
    if (faq) {
      // GHI LOG: Sửa câu hỏi
      await logAction(
        req.user._id, 
        'SỬA', 
        'FAQ', 
        `Đã cập nhật câu hỏi: "${faq.question}"`
      );
    }

    res.json(faq);
  } catch (error) {
    next(error);
  }
};

export const deleteFAQ = async (req, res, next) => {
  try {
    // Tìm và lấy thông tin trước rồi mới xóa để lấy được nội dung ghi log
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    
    if (faq) {
      // GHI LOG: Xóa câu hỏi
      await logAction(
        req.user._id, 
        'XÓA', 
        'FAQ', 
        `Đã xóa câu hỏi: "${faq.question}"`
      );
    }

    res.json({ message: 'Đã xóa câu hỏi' });
  } catch (error) {
    next(error);
  }
};

export const toggleFAQStatus = async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) throw new Error('Không tìm thấy câu hỏi');

    faq.isActive = !faq.isActive;
    await faq.save();

    // GHI LOG: Ẩn/Hiện câu hỏi
    const statusText = faq.isActive ? 'hiện' : 'ẩn';
    await logAction(
      req.user._id, 
      'SỬA', 
      'FAQ', 
      `Đã ${statusText} câu hỏi: "${faq.question}"`
    );

    res.json({ message: 'Đã cập nhật trạng thái' });
  } catch (error) {
    next(error);
  }
};