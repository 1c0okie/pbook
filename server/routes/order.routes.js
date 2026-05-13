import express from 'express';
import { 
  createOrder, 
  getOrderById, 
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  confirmOrderReceipt,
  createPaymentLink,
  payosWebhook
} from '../controllers/order.controller.js';
import { mustBeAuthenticated, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/webhook', payosWebhook);

// Route cho User
router.route('/').post(mustBeAuthenticated, createOrder);
router.route('/myorders').get(mustBeAuthenticated, getMyOrders);

// Route cho Admin
router.route('/').get(mustBeAuthenticated, verifyAdmin, getAllOrders);
router.route('/:id/status').put(mustBeAuthenticated, verifyAdmin, updateOrderStatus);

// Cần đặt các route có param /:id xuống dưới cùng để tránh bị trùng với /myorders
router.route('/:id').get(mustBeAuthenticated, getOrderById);
router.route('/:id/cancel').put(mustBeAuthenticated, cancelOrder);
router.route('/:id/confirm').put(mustBeAuthenticated, confirmOrderReceipt);

router.route('/:id/create-payment-link').post(mustBeAuthenticated, createPaymentLink);
export default router;