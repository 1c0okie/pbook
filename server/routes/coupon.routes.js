import express from 'express';
import { 
  verifyCoupon, 
  createCoupon, 
  getCoupons, 
  deleteCoupon, 
  toggleCouponStatus,
  getPromoCoupons,    // Thêm hàm mới
  toggleShowOnHome    // Thêm hàm mới
} from '../controllers/coupon.controller.js';
import { mustBeAuthenticated, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ============================================
// CÁC ROUTE KHÔNG CÓ PARAM (ĐẶT LÊN TRÊN CÙNG)
// ============================================

// Lấy mã cho trang chủ (Ai cũng xem được, không cần đăng nhập)
router.get('/promo', getPromoCoupons); 

// Route cho User (Checkout)
router.post('/verify', mustBeAuthenticated, verifyCoupon);

// Lấy tất cả & Tạo mới (Admin)
router.route('/')
  .get(mustBeAuthenticated, verifyAdmin, getCoupons)
  .post(mustBeAuthenticated, verifyAdmin, createCoupon);

// ============================================
// CÁC ROUTE CÓ ĐUÔI /:id (PHẢI ĐẶT Ở DƯỚI CÙNG)
// ============================================

router.route('/:id')
  .delete(mustBeAuthenticated, verifyAdmin, deleteCoupon);

router.route('/:id/status')
  .put(mustBeAuthenticated, verifyAdmin, toggleCouponStatus);

// API Mới: Đổi trạng thái hiển thị trang chủ
router.route('/:id/show-home')
  .put(mustBeAuthenticated, verifyAdmin, toggleShowOnHome);

export default router;