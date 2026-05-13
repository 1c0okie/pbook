import express from 'express';
import { 
  getWishlist, 
  toggleWishlist,getUsers,           
  deleteUser,
  updateUserRole,
  updateUserProfile,
  updateUserPassword,
  addAddress,
  updateAddress, 
  deleteAddress, 
  setDefaultAddress,
  googleLogin,
  forgotPassword,
  resetPassword
 } from '../controllers/user.controller.js';
import { mustBeAuthenticated, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ... (các route cũ nếu có)

// THÊM 2 ROUTE NÀY:
router.route('/wishlist').get(mustBeAuthenticated, getWishlist);
router.route('/wishlist/toggle').post(mustBeAuthenticated, toggleWishlist);
router.route('/profile').put(mustBeAuthenticated, updateUserProfile);
router.route('/password').put(mustBeAuthenticated, updateUserPassword);
// ==========================================
// ROUTES CỦA ADMIN (THÊM MỚI TỪ ĐÂY)
// ==========================================
router.route('/')
  .get(mustBeAuthenticated, verifyAdmin, getUsers);

router.route('/google')
  .post(googleLogin);

router.route('/:id')
  .delete(mustBeAuthenticated, verifyAdmin, deleteUser);

router.route('/:id/role')
  .put(mustBeAuthenticated, verifyAdmin, updateUserRole);
// --- KHU VỰC SỔ ĐỊA CHỈ ---
// Thêm mới địa chỉ
router.post('/addresses', mustBeAuthenticated, addAddress); 

// Sửa và xóa địa chỉ
router.route('/addresses/:id')
  .put(mustBeAuthenticated, updateAddress)
  .delete(mustBeAuthenticated, deleteAddress);

// Đặt làm mặc định
router.put('/addresses/:id/default', mustBeAuthenticated, setDefaultAddress);

router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

export default router;