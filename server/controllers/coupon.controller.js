import Coupon from '../models/Coupon.js';
import { logAction } from './audit.controller.js'; // Nhúng hàm ghi log

// @desc    Kiểm tra & Áp dụng mã giảm giá (Dành cho User)
// @route   POST /api/v1/coupons/verify
export const verifyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      res.status(404);
      throw new Error('Mã giảm giá không tồn tại!');
    }
    if (!coupon.isActive) {
      res.status(400);
      throw new Error('Mã giảm giá này đã bị vô hiệu hóa!');
    }
    if (new Date(coupon.expiryDate) < new Date()) {
      res.status(400);
      throw new Error('Mã giảm giá đã hết hạn!');
    }

    res.json({ 
      message: 'Áp dụng mã thành công!',
      discount: coupon.discount, 
      code: coupon.code 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Tạo mã mới (Dành cho Admin)
// @route   POST /api/v1/coupons
export const createCoupon = async (req, res, next) => {
  try {
    const { code, discount, expiryDate } = req.body;
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      res.status(400);
      throw new Error('Mã này đã tồn tại!');
    }
    const coupon = await Coupon.create({ code: code.toUpperCase(), discount, expiryDate });
    
    // GHI LOG: Thêm mã giảm giá
    await logAction(
      req.user._id, 
      'THÊM', 
      'Mã Giảm Giá', 
      `Đã tạo mã giảm giá mới: ${coupon.code} (Giảm ${coupon.discount}%)`
    );

    res.status(201).json(coupon);
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy tất cả mã giảm giá
// @route   GET /api/v1/coupons
// @access  Private/Admin
export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa mã giảm giá
// @route   DELETE /api/v1/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      res.status(404);
      throw new Error('Không tìm thấy mã giảm giá');
    }

    // GHI LOG: Xóa mã giảm giá
    await logAction(
      req.user._id, 
      'XÓA', 
      'Mã Giảm Giá', 
      `Đã xóa mã giảm giá: ${coupon.code}`
    );

    res.json({ message: 'Đã xóa mã giảm giá' });
  } catch (error) {
    next(error);
  }
};

// @desc    Bật/Tắt trạng thái mã giảm giá
// @route   PUT /api/v1/coupons/:id/status
// @access  Private/Admin
export const toggleCouponStatus = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      res.status(404);
      throw new Error('Không tìm thấy mã giảm giá');
    }
    coupon.isActive = !coupon.isActive; // Đảo ngược trạng thái
    await coupon.save();

    // GHI LOG: Sửa trạng thái mã
    await logAction(
      req.user._id, 
      'SỬA', 
      'Mã Giảm Giá', 
      `Đã ${coupon.isActive ? 'BẬT' : 'TẮT'} trạng thái hoạt động của mã: ${coupon.code}`
    );

    res.json({ message: `Đã ${coupon.isActive ? 'bật' : 'tắt'} mã giảm giá`, isActive: coupon.isActive });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy danh sách mã giảm giá để hiển thị ở trang chủ
// @route   GET /api/v1/coupons/promo
// @access  Public
export const getPromoCoupons = async (req, res, next) => {
  try {
    // Chỉ lấy các mã đang hoạt động, được phép hiện trang chủ và chưa hết hạn
    const coupons = await Coupon.find({ 
      isActive: true,
      isShowOnHome: true,
      expiryDate: { $gt: new Date() } // Đảm bảo mã chưa hết hạn
    }).sort({ discount: -1 }); // Ưu tiên xếp mã giảm giá cao nhất lên đầu

    res.json(coupons);
  } catch (error) {
    next(error);
  }
};

// @desc    Bật/Tắt trạng thái hiển thị trang chủ
// @route   PUT /api/v1/coupons/:id/show-home
// @access  Private/Admin
export const toggleShowOnHome = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      res.status(404);
      throw new Error('Không tìm thấy mã giảm giá');
    }
    
    // Đảo ngược trạng thái
    coupon.isShowOnHome = !coupon.isShowOnHome; 
    await coupon.save();

    // GHI LOG (Đồng bộ với hệ thống audit của bạn)
    await logAction(
      req.user._id, 
      'SỬA', 
      'Mã Giảm Giá', 
      `Đã ${coupon.isShowOnHome ? 'HIỆN' : 'ẨN'} mã ${coupon.code} trên trang chủ`
    );

    res.json({ 
      message: `Đã ${coupon.isShowOnHome ? 'hiện' : 'ẩn'} mã trên trang chủ`, 
      isShowOnHome: coupon.isShowOnHome 
    });
  } catch (error) {
    next(error);
  }
};