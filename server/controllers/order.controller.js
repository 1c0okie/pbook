import Order from '../models/Order.js';
import Book from '../models/Book.js';
import { logAction } from './audit.controller.js'; // <-- IMPORT HÀM GHI LOG
import payos from '../config/payos.js';


// @desc    Tạo đơn hàng mới
// @route   POST /api/v1/orders
// @access  Private (Chỉ user đã đăng nhập)
export const createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalAmount } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error('Giỏ hàng trống');
    }

    // 1. Kiểm tra lại tồn kho một lần nữa trước khi tạo đơn (chống Double Booking)
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      const book = await Book.findById(item.book);
      
      if (!book) {
        res.status(404);
        throw new Error(`Sách ${item.title} không còn tồn tại.`);
      }
      if (book.quantityInStock < item.qty) {
        res.status(400);
        throw new Error(`Sách ${book.title} chỉ còn ${book.quantityInStock} cuốn, không đủ số lượng bạn đặt.`);
      }
    }

    // 2. Tạo đơn hàng (Snapshot Data)
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalAmount,
      status: paymentMethod === 'QR' ? 'Chờ thanh toán' : 'Chờ xác nhận',
    });
    const createdOrder = await order.save();

    // 3. Trừ tồn kho và tăng số lượng đã bán
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      await Book.findByIdAndUpdate(item.book, {
        $inc: { quantityInStock: -item.qty, sold: item.qty }
      });
    }

    // === GHI LOG: KHÁCH ĐẶT HÀNG ===
    await logAction(req.user._id, 'THÊM', 'Đơn Hàng', `Khách hàng đã đặt đơn mới #${createdOrder._id.toString().slice(-8).toUpperCase()} (Tổng: ${totalAmount}đ)`);

    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết đơn hàng (Dùng cho trang hóa đơn)
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    // Populate user để lấy tên và email người mua
    const order = await Order.findById(req.params.id).populate('user', 'firstname lastname email');

    if (order) {
      // Chỉ Admin hoặc chủ nhân đơn hàng mới được xem
      if (req.user.isAdmin || order.user._id.toString() === req.user._id.toString()) {
        res.json(order);
      } else {
        res.status(403);
        throw new Error('Bạn không có quyền xem đơn hàng này');
      }
    } else {
      res.status(404);
      throw new Error('Không tìm thấy đơn hàng');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy danh sách đơn hàng của user đang đăng nhập
// @route   GET /api/v1/orders/myorders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy tất cả đơn hàng của hệ thống
// @route   GET /api/v1/orders
// @access  Private/Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id firstname lastname')
      .sort({ createdAt: -1 }); // Mới nhất lên đầu
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

/// @desc    Cập nhật trạng thái đơn hàng (Dành cho ADMIN)
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // === ĐỒNG BỘ: NẾU ADMIN HỦY ĐƠN -> HOÀN LẠI SÁCH VÀO KHO ===
      if (req.body.status === 'Đã hủy' && order.status !== 'Đã hủy') {
        for (let i = 0; i < order.orderItems.length; i++) {
          const item = order.orderItems[i];
          await Book.findByIdAndUpdate(item.book, {
            $inc: { quantityInStock: item.qty, sold: -item.qty }
          });
        }
      }

      order.status = req.body.status;
      
      // Nếu trạng thái là Đã giao, cập nhật ngày giờ giao và coi như đã thanh toán
      if (req.body.status === 'Đã giao') {
        order.deliveredAt = Date.now();
        order.isPaid = true;
        if(!order.paidAt) order.paidAt = Date.now();
      }

      const updatedOrder = await order.save();

      // === GHI LOG: ADMIN ĐỔI TRẠNG THÁI ===
      await logAction(req.user._id, 'SỬA', 'Đơn Hàng', `Admin đã cập nhật trạng thái đơn #${order._id.toString().slice(-8).toUpperCase()} thành "${req.body.status}"`);

      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Không tìm thấy đơn hàng');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Khách hàng tự hủy đơn hàng
// @route   PUT /api/v1/orders/:id/cancel
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new Error('Không tìm thấy đơn hàng');

    // Kiểm tra quyền sở hữu
    if (order.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Bạn không có quyền hủy đơn hàng này');
    }

    // Chỉ được hủy khi đơn hàng chưa giao hoặc chưa bị hủy trước đó
    if (order.status === 'Đang giao hàng' || order.status === 'Đã giao' || order.status === 'Đã hủy') {
      res.status(400);
      throw new Error('Không thể hủy đơn hàng đã được vận chuyển hoặc đã xử lý');
    }

    // === ĐỒNG BỘ: KHÁCH TỰ HỦY ĐƠN -> HOÀN LẠI SÁCH VÀO KHO ===
    for (let i = 0; i < order.orderItems.length; i++) {
      const item = order.orderItems[i];
      await Book.findByIdAndUpdate(item.book, {
        $inc: { quantityInStock: item.qty, sold: -item.qty }
      });
    }
    // === ĐỒNG BỘ MỚI: HỦY LUÔN LINK THANH TOÁN TRÊN PAYOS ===
    if (order.paymentMethod === 'QR' && order.payosOrderCode) {
      try {

        await payos.paymentRequests.cancel(order.payosOrderCode, { cancellationReason: "Khach hang huy don" });
      } catch (err) {
        console.log("PayOS Cancel Error (Có thể link đã hết hạn):", err.message);
      }
    }

    order.status = 'Đã hủy';
    await order.save();


    // === GHI LOG: KHÁCH HỦY ĐƠN ===
    await logAction(req.user._id, 'HỦY', 'Đơn Hàng', `Khách hàng tự hủy đơn #${order._id.toString().slice(-8).toUpperCase()}`);

    res.json({ message: 'Đơn hàng đã được hủy thành công và sách đã hoàn kho' });
  } catch (error) {
    next(error);
  }
};

// @desc    Khách hàng xác nhận đã nhận hàng
// @route   PUT /api/v1/orders/:id/confirm
export const confirmOrderReceipt = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new Error('Không tìm thấy đơn hàng');

    if (order.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Không có quyền thao tác');
    }

    // Chỉ xác nhận khi đang giao hàng
    if (order.status !== 'Đang giao hàng') {
      res.status(400);
      throw new Error('Đơn hàng hiện không ở trạng thái đang vận chuyển');
    }

    order.status = 'Đã giao';
    order.isPaid = true; // Thường nhận hàng COD là đã thanh toán
    order.paidAt = Date.now();
    await order.save();

    // === GHI LOG: KHÁCH XÁC NHẬN NHẬN HÀNG ===
    await logAction(req.user._id, 'SỬA', 'Đơn Hàng', `Khách hàng đã xác nhận nhận thành công đơn #${order._id.toString().slice(-8).toUpperCase()}`);

    res.json({ message: 'Cảm ơn bạn đã xác nhận nhận hàng!' });
  } catch (error) {
    next(error);
  }
};


// ... (các hàm cũ giữ nguyên)

// ... (Các hàm tạo đơn hàng, lấy đơn hàng của bạn giữ nguyên)

// @desc    Tạo link thanh toán PayOS
// @route   POST /api/v1/orders/:id/create-payment-link
export const createPaymentLink = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new Error("Không tìm thấy đơn hàng");

    // FIX 1: Dùng Date.now() kết hợp random để đảm bảo orderCode 100% là số nguyên và DUY NHẤT
    const uniqueOrderCode = Number(String(Date.now()).slice(-9)) + Math.floor(Math.random() * 1000);

    // FIX 2: Đảm bảo luôn có URL hợp lệ kể cả khi quên khai báo biến môi trường CLIENT_URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    const body = {
      orderCode: uniqueOrderCode, 
      amount: Math.round(order.totalAmount), // Đảm bảo amount không bị lẻ số thập phân
      description: `Thanh toan don ${order._id.toString().slice(-6).toUpperCase()}`,
      returnUrl: `${clientUrl}/profile?code=00&id=${order._id}`, 
      cancelUrl: `${clientUrl}/profile?cancel=true&id=${order._id}`
    };

    console.log("Đang gửi data lên PayOS:", body); // <-- Ghi log để bạn dễ debug

    // Gọi API PayOS
    const paymentLinkRes = await payos.paymentRequests.create(body);
    
    // Lưu lại mã vào DB
    order.payosOrderCode = body.orderCode;
    await order.save();

    res.json({
      checkoutUrl: paymentLinkRes.checkoutUrl, 
      qrCode: paymentLinkRes.qrCode, 
      accountNumber: paymentLinkRes.accountNumber,
      accountName: paymentLinkRes.accountName,
      bin: paymentLinkRes.bin, 
      amount: paymentLinkRes.amount,
      description: paymentLinkRes.description,
      orderCode: paymentLinkRes.orderCode
    });
  } catch (error) {
    // FIX 3: In ra chính xác thông báo lỗi từ server PayOS
    console.error("LỖI TẠO LINK PAYOS:", error.message || error);
    res.status(500).json({ 
      message: 'Không thể tạo mã thanh toán từ PayOS. Kiểm tra log backend.',
      error: error.message 
    });
  }
};
// @desc    Nhận Webhook từ PayOS (CÚ PHÁP MỚI)
// @route   POST /api/v1/orders/webhook
export const payosWebhook = async (req, res) => {
  try {
    // Xác thực chữ ký webhook từ PayOS xem có hợp lệ không
    payos.webhooks.verify(req.body);
    
    const data = req.body.data;
    const code = req.body.code;

    // "00" là mã thành công của VietQR/PayOS
    if (code === "00") {
      const order = await Order.findOne({ payosOrderCode: data.orderCode });
      
      if (order && order.totalAmount === data.amount) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = 'Chờ xác nhận';
        await order.save();
      }
    }
    
    // Luôn trả về HTTP 200 OK để PayOS ngừng gửi lại thông báo
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error.message);
    res.status(400).json({ success: false, message: "Invalid webhook" });
  }
};