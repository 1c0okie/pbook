import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../../services/order.service';
import { formatPrice } from '../../utils/format';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await orderService.getAll();
      setOrders(data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;
    
    try {
      await orderService.updateStatus(id, newStatus);
      toast.success(`Đã cập nhật trạng thái thành: ${newStatus}`);
      fetchOrders(); 
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã giao': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Đang giao hàng': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Đã hủy': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Chờ thanh toán': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý Đơn Hàng</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Kiểm soát tiến độ giao hàng và doanh thu</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 text-sm uppercase tracking-wider">
                <th className="p-5 font-semibold">Mã ĐH</th>
                <th className="p-5 font-semibold">Khách hàng</th>
                <th className="p-5 font-semibold">Ngày đặt</th>
                <th className="p-5 font-semibold">Tổng tiền</th>
                <th className="p-5 font-semibold">Trạng thái & Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr><td colSpan="5" className="text-center p-8 text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-8 text-gray-500">Chưa có đơn hàng nào.</td></tr>
              ) : (
                orders.map((order) => {
                  const isLocked = order.status === 'Đã giao' || order.status === 'Đã hủy';
                  
                  // Nhận diện đơn hàng chờ thanh toán
                  const isWaitingPayment = order.paymentMethod === 'QR' && !order.isPaid && order.status !== 'Đã hủy';
                  const displayStatus = isWaitingPayment ? 'Chờ thanh toán' : order.status;

                  return (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="p-5 font-mono text-sm font-bold text-gray-800 dark:text-white">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="p-5">
                        <p className="font-medium text-gray-800 dark:text-white">{order.shippingAddress.fullName}</p>
                        <p className="text-xs text-gray-500">{order.shippingAddress.phone}</p>
                      </td>
                      <td className="p-5 text-gray-600 dark:text-gray-400 text-sm">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-5 font-bold text-blue-600 dark:text-blue-400">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col items-start gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(displayStatus)}`}>
                            {displayStatus}
                          </span>
                          
                          {/* KIỂM TRA ĐIỀU KIỆN KHÓA */}
                          {isLocked ? (
                            <div className="text-xs text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1 mt-1">
                              <i className="ri-lock-2-line"></i> Không thể thay đổi
                            </div>
                          ) : isWaitingPayment ? (
                            // NẾU LÀ ĐƠN CHỜ THANH TOÁN -> CHỈ CHO PHÉP HỦY ĐƠN
                            <select 
                              value="Chờ thanh toán"
                              onChange={(e) => handleUpdateStatus(order._id, order.status, e.target.value)}
                              className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
                            >
                              <option value="Chờ thanh toán" disabled>Đang chờ tiền...</option>
                              <option value="Đã hủy" className="text-red-500 font-bold">Hủy đơn hàng</option>
                            </select>
                          ) : (
                            // ĐƠN BÌNH THƯỜNG (COD hoặc đã thanh toán)
                            <select 
                              value={order.status}
                              onChange={(e) => handleUpdateStatus(order._id, order.status, e.target.value)}
                              className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                            >
                              <option value="Chờ xác nhận">Chờ xác nhận</option>
                              <option value="Đang giao hàng">Giao cho Vận chuyển</option>
                              <option value="Đã hủy">Hủy đơn hàng</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderManager;