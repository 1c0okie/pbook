import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSearchParams, useNavigate } from 'react-router-dom'; // THÊM useNavigate
import { orderService } from '../../services/order.service';
import { formatPrice } from '../../utils/format';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('shipping');

  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('q') || '';
  const navigate = useNavigate(); // Dùng để điều hướng xóa bộ lọc

  const displayedOrders = orders.filter(order => {
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.phone?.includes(searchTerm) ||
      (order.payosOrderCode && order.payosOrderCode.toString().includes(searchTerm));
    
    const matchesTab = activeTab === 'shipping' ? true : order.paymentMethod === 'QR';
    
    return matchesSearch && matchesTab;
  });

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

  const handleManualPaymentConfirm = async (id) => {
    if (window.confirm('Xác nhận khách hàng đã chuyển khoản thành công?')) {
      try {
        await orderService.updateStatus(id, 'Chờ xác nhận');
        toast.success('Xác nhận thu tiền thành công!');
        fetchOrders();
      } catch (error) {
        toast.error('Lỗi khi xác nhận thanh toán');
      }
    }
  };

  const clearSearch = () => {
    navigate('/admin/orders'); // Xóa query string trên URL để reset bảng
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
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý Đơn Hàng</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Kiểm soát tiến độ giao hàng và đối soát thanh toán</p>
          
          {/* HIỂN THỊ BADGE BÁO HIỆU ĐANG LỌC TỪ KHUNG CHAT SANG */}
          {searchTerm && (
            <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-100 dark:border-blue-800">
              <i className="ri-search-line"></i> Đang hiển thị đơn hàng: #{searchTerm.slice(-6).toUpperCase()}
              <button 
                onClick={clearSearch}
                className="ml-2 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full w-5 h-5 flex items-center justify-center transition-colors shadow-sm"
                title="Xóa bộ lọc"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('shipping')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'shipping' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            <i className="ri-truck-line"></i> Vận chuyển
          </button>
          <button 
            onClick={() => setActiveTab('payment')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            <i className="ri-qr-code-line"></i> Thanh toán QR
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 text-sm uppercase tracking-wider">
                <th className="p-5 font-semibold">Mã ĐH {activeTab === 'payment' && '/ PayOS Code'}</th>
                <th className="p-5 font-semibold">Khách hàng</th>
                <th className="p-5 font-semibold">Ngày đặt</th>
                <th className="p-5 font-semibold">Tổng tiền</th>
                {activeTab === 'shipping' ? (
                  <th className="p-5 font-semibold">Trạng thái & Cập nhật</th>
                ) : (
                  <th className="p-5 font-semibold text-right">Đối soát QR</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr><td colSpan="5" className="text-center p-8 text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : displayedOrders.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-8 text-gray-500 font-medium">Không tìm thấy đơn hàng nào khớp với tìm kiếm.</td></tr>
              ) : (
                displayedOrders.map((order) => {
                  const isLocked = order.status === 'Đã giao' || order.status === 'Đã hủy';
                  const isDelivering = order.status === 'Đang giao hàng';
                  
                  const isWaitingPayment = order.paymentMethod === 'QR' && !order.isPaid && order.status !== 'Đã hủy';
                  const displayStatus = isWaitingPayment ? 'Chờ thanh toán' : order.status;

                  return (
                    <tr key={order._id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${searchTerm === order._id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                      <td className="p-5">
                        <p className="font-mono text-sm font-bold text-gray-800 dark:text-white">
                          #{order._id.slice(-6).toUpperCase()}
                        </p>
                        {activeTab === 'payment' && (
                          <p className="text-xs font-bold text-blue-600 mt-1 uppercase">{order.payosOrderCode || 'N/A'}</p>
                        )}
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
                        <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">{order.paymentMethod === 'QR' ? 'Chuyển khoản' : 'Tiền mặt'}</p>
                      </td>
                      
                      {activeTab === 'shipping' ? (
                        <td className="p-5">
                          <div className="flex flex-col items-start gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(displayStatus)}`}>
                              {displayStatus}
                            </span>
                            
                            {isLocked ? (
                              <div className="text-xs text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1 mt-1">
                                <i className="ri-lock-2-line"></i> Không thể thay đổi
                              </div>
                            ) : isWaitingPayment ? (
                              <select 
                                value="Chờ thanh toán"
                                onChange={(e) => handleUpdateStatus(order._id, order.status, e.target.value)}
                                className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
                              >
                                <option value="Chờ thanh toán" disabled>Đang chờ tiền...</option>
                                <option value="Đã hủy" className="text-red-500 font-bold">Hủy đơn hàng</option>
                              </select>
                            ) : (
                              <select 
                                value={order.status}
                                onChange={(e) => handleUpdateStatus(order._id, order.status, e.target.value)}
                                className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                              >
                                <option value="Chờ xác nhận">Chờ xác nhận</option>
                                <option value="Đang giao hàng">Giao cho Vận chuyển</option>
                                {!isDelivering && <option value="Đã hủy" className="text-red-500 font-bold">Hủy đơn hàng</option>}
                              </select>
                            )}
                          </div>
                        </td>
                      ) : (
                        <td className="p-5 text-right">
                          {order.isPaid ? (
                            <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold">
                              <i className="ri-check-line"></i> Đã thu tiền
                            </span>
                          ) : order.status === 'Đã hủy' ? (
                            <span className="text-xs font-bold text-gray-400"><i className="ri-close-circle-fill"></i> Đã hủy</span>
                          ) : (
                            <button 
                              onClick={() => handleManualPaymentConfirm(order._id)}
                              className="text-xs bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 dark:hover:text-blue-300 px-3 py-1.5 rounded-lg font-bold transition-colors"
                            >
                              Xác nhận
                            </button>
                          )}
                        </td>
                      )}
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