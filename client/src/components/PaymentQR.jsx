import React, { useState, useEffect } from 'react';
import { formatPrice } from '../utils/format';
import toast from 'react-hot-toast';
import { orderService } from '../services/order.service';

const PaymentQR = ({ orderId, payosData, onPaymentSuccess }) => {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 phút đếm ngược

  // Tạo link ảnh QR trực tiếp từ VietQR dựa trên data PayOS trả về
  const qrUrl = `https://img.vietqr.io/image/${payosData.bin}-${payosData.accountNumber}-compact2.png?amount=${payosData.amount}&addInfo=${encodeURIComponent(payosData.description)}&accountName=${encodeURIComponent(payosData.accountName)}`;

  // 1. Hiệu ứng đếm ngược thời gian
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // 2. Tự động kiểm tra trạng thái đơn hàng (Polling) mỗi 3 giây
  useEffect(() => {
    const checkPaymentInterval = setInterval(async () => {
      try {
        const currentOrder = await orderService.getById(orderId);
        // Webhook ở backend đã update isPaid = true nếu có tiền vào
        if (currentOrder.isPaid) {
          clearInterval(checkPaymentInterval);
          toast.success('Giao dịch thành công! Đã nhận được thanh toán.');
          onPaymentSuccess(); // Tự động đóng QR và chuyển trang
        }
      } catch (error) {
        console.log("Đang kiểm tra thanh toán...");
      }
    }, 3000);

    return () => clearInterval(checkPaymentInterval);
  }, [orderId, onPaymentSuccess]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 md:p-10 shadow-2xl shadow-blue-900/10 border border-gray-100 dark:border-gray-800 max-w-3xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Thanh Toán Đơn Hàng</h2>
        <p className="text-gray-500 font-medium">Mở App Ngân hàng bất kỳ để quét mã QR</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Cột trái: Mã QR */}
        <div className="flex flex-col items-center">
          <div className="bg-gray-50 dark:bg-white p-4 rounded-3xl border-2 border-dashed border-blue-200 shadow-inner relative">
            {timeLeft > 0 ? (
              <img src={qrUrl} alt="QR Code Thanh Toán" className="w-64 h-64 object-contain rounded-2xl" />
            ) : (
              <div className="w-64 h-64 flex flex-col items-center justify-center text-red-500">
                <i className="ri-time-line text-5xl mb-2"></i>
                <p className="font-bold">Mã QR đã hết hạn</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full font-bold text-sm">
            <i className="ri-loader-4-line animate-spin text-lg"></i>
            Đang chờ thanh toán... ({formatTime(timeLeft)})
          </div>
        </div>

        {/* Cột phải: Thông tin chữ */}
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
            <p className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400 mb-1">Số tiền cần thanh toán</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{formatPrice(payosData.amount)}</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
              <span className="text-gray-500 font-medium">Chủ tài khoản</span>
              <span className="font-bold text-gray-900 dark:text-white uppercase">{payosData.accountName}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
              <span className="text-gray-500 font-medium">Số tài khoản</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 dark:text-white text-lg tracking-wider">{payosData.accountNumber}</span>
                <button onClick={() => {navigator.clipboard.writeText(payosData.accountNumber); toast.success('Đã copy STK')}} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"><i className="ri-file-copy-line"></i></button>
              </div>
            </div>
            <div className="flex justify-between items-center pb-1">
              <span className="text-gray-500 font-medium">Nội dung CK</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 dark:text-white text-red-500">{payosData.description}</span>
                <button onClick={() => {navigator.clipboard.writeText(payosData.description); toast.success('Đã copy nội dung')}} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"><i className="ri-file-copy-line"></i></button>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-red-500 mt-3 font-medium">
            * Bắt buộc chuyển đúng nội dung chữ đỏ để hệ thống xác nhận tự động.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentQR;