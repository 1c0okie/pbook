import express from 'express';
import { 
  verifyCoupon, 
  createCoupon, 
  getCoupons, 
  deleteCoupon, 
  toggleCouponStatus 
} from '../controllers/coupon.controller.js';
import { mustBeAuthenticated, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Route cho User (Checkout)
router.post('/verify', mustBeAuthenticated, verifyCoupon);

// Route cho Admin
router.route('/')
  .get(mustBeAuthenticated, verifyAdmin, getCoupons)
  .post(mustBeAuthenticated, verifyAdmin, createCoupon);

router.route('/:id')
  .delete(mustBeAuthenticated, verifyAdmin, deleteCoupon);

router.route('/:id/status')
  .put(mustBeAuthenticated, verifyAdmin, toggleCouponStatus);

export default router;