import SiteSetting from '../models/SiteSetting.js';
import { logAction } from './audit.controller.js'; // Nhúng hàm ghi log

// @desc    Lấy cấu hình trang web (Ai cũng xem được)
// @route   GET /api/v1/settings
export const getSettings = async (req, res, next) => {
  try {
    let settings = await SiteSetting.findOne();
    // Nếu database trống, tự tạo 1 dòng mặc định
    if (!settings) {
      settings = await SiteSetting.create({});
    }
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật cấu hình (Chỉ Admin)
// @route   PUT /api/v1/settings
export const updateSettings = async (req, res, next) => {
  try {
    let settings = await SiteSetting.findOne();
    if (!settings) {
      settings = await SiteSetting.create({});
    }

    // Tự động gộp tất cả dữ liệu gửi lên vào settings
    Object.assign(settings, req.body);

    const updatedSettings = await settings.save();

    // === GHI LOG LẠI HÀNH ĐỘNG CỦA ADMIN ===
    // Dùng req.user._id để biết Admin nào vừa sửa cấu hình
    await logAction(
      req.user._id, 
      'SỬA', 
      'Cài Đặt', 
      'Đã thay đổi cấu hình hệ thống (Phí ship, Chính sách, Liên hệ...)'
    );

    res.json(updatedSettings);
  } catch (error) {
    next(error);
  }
};