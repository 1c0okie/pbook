import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../store/auth.store';
import { orderService } from '../../services/order.service';
import { userService } from '../../services/user.service';
import { uploadService } from '../../services/upload.service';
import { formatPrice } from '../../utils/format';

// IMPORT COMPONENT MÃ QR
import PaymentQR from '../../components/PaymentQR';

const Profile = () => {
  const { user, updateUserContext, updateUserAddresses } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState('orders'); 
  const [selectedOrder, setSelectedOrder] = useState(null);

  // --- THÊM STATE CHO QR ---
  const [payingOrder, setPayingOrder] = useState(null);
  const [payosData, setPayosData] = useState(null);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState(user?.addresses || []);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const { register: registerInfo, handleSubmit: handleSubmitInfo } = useForm({
    defaultValues: { firstname: user?.firstname, lastname: user?.lastname }
  });
  const { register: registerPass, handleSubmit: handleSubmitPass, reset: resetPass, formState: { errors: errorsPass } } = useForm();
  const { register: registerAddr, handleSubmit: handleSubmitAddr, reset: resetAddr } = useForm();

  useEffect(() => {
    if (user?.addresses) {
      setSavedAddresses(user.addresses);
    }
  }, [user]);

  const fetchMyOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const handleCancelOrder = async (e, id) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      try {
        await orderService.cancelOrder(id);
        toast.success('Đã hủy đơn hàng');
        fetchMyOrders();
        if (selectedOrder && selectedOrder._id === id) {
          setSelectedOrder(prev => ({...prev, status: 'Đã hủy'}));
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi hủy đơn');
      }
    }
  };

  const handleConfirmReceived = async (id) => {
    if (window.confirm('Xác nhận bạn đã nhận được hàng và thanh toán đầy đủ?')) {
      try {
        await orderService.confirmOrder(id);
        toast.success('Xác nhận thành công. Chúc bạn đọc sách vui vẻ!');
        fetchMyOrders();
        if (selectedOrder && selectedOrder._id === id) {
          setSelectedOrder(prev => ({...prev, status: 'Đã giao'}));
        }
      } catch (error) {
        toast.error('Lỗi khi xác nhận');
      }
    }
  };

  // --- SỬA LẠI: HIỂN THỊ COMPONENT QR THAY VÌ CHUYỂN TRANG ---
  const handlePayNow = async (e, orderId) => {
    e.stopPropagation();
    try {
      toast.loading('Đang khởi tạo mã thanh toán...', { id: 'qr-load' });
      const paymentRes = await orderService.createPaymentLink(orderId);
      toast.dismiss('qr-load');
      
      const orderToPay = orders.find(o => o._id === orderId);
      setPayosData(paymentRes);
      setPayingOrder(orderToPay);
    } catch (error) {
      toast.dismiss('qr-load');
      toast.error(error.response?.data?.message || 'Không thể khởi tạo thanh toán lúc này');
    }
  };

  const handlePaymentSuccess = () => {
    setPayingOrder(null);
    setPayosData(null);
    fetchMyOrders();
    if (selectedOrder) {
      setSelectedOrder(null);
    }
  };

  const handleExportInvoice = () => {
    toast.success('Đang chuẩn bị hóa đơn...');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploadingAvatar(true);
      const data = await uploadService.uploadImage(file);
      const updatedUser = await userService.updateProfile({ avatarUrl: data.imageUrl });
      updateUserContext(updatedUser); 
      toast.success('Cập nhật ảnh đại diện thành công');
    } catch (error) {
      toast.error('Lỗi khi tải ảnh lên');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = null; 
    }
  };

  const onUpdateInfo = async (data) => {
    try {
      const updatedUser = await userService.updateProfile(data);
      updateUserContext(updatedUser);
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const onChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp!');
    }
    try {
      await userService.updatePassword({ oldPassword: data.oldPassword, newPassword: data.newPassword });
      toast.success('Đổi mật khẩu thành công!');
      resetPass();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mật khẩu cũ không đúng');
    }
  };

  const handleOpenAddAddress = () => {
    resetAddr({ fullName: user?.lastname + ' ' + user?.firstname, phone: '', city: '', address: '' });
    setEditingAddressId(null);
    setShowAddressForm(true);
  };

  const handleOpenEditAddress = (addr) => {
    resetAddr(addr);
    setEditingAddressId(addr._id);
    setShowAddressForm(true);
  };

  const onSubmitAddress = async (data) => {
    try {
      let newAddresses;
      if (editingAddressId) {
        newAddresses = await userService.updateAddress(editingAddressId, data);
        toast.success('Đã cập nhật địa chỉ');
      } else {
        newAddresses = await userService.addAddress(data);
        toast.success('Đã thêm địa chỉ mới');
      }
      setSavedAddresses(newAddresses);
      updateUserAddresses(newAddresses);
      setShowAddressForm(false);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi lưu địa chỉ');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
      try {
        const newAddresses = await userService.deleteAddress(id);
        setSavedAddresses(newAddresses);
        updateUserAddresses(newAddresses);
        toast.success('Đã xóa địa chỉ');
      } catch (error) {
        toast.error('Không thể xóa địa chỉ');
      }
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const newAddresses = await userService.setDefaultAddress(id);
      setSavedAddresses(newAddresses);
      updateUserAddresses(newAddresses);
      toast.success('Đã đặt làm mặc định');
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const getStatusBadge = (order) => {
    if (order.status === 'Đã giao') return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-[10px] font-black uppercase tracking-wider">Đã giao</span>;
    if (order.status === 'Đã hủy') return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-[10px] font-black uppercase tracking-wider">Đã hủy</span>;
    if (order.status === 'Đang giao hàng') return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-[10px] font-black uppercase tracking-wider">Đang giao</span>;
    if (order.paymentMethod === 'QR' && !order.isPaid) {
      return <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-[10px] font-black uppercase tracking-wider">Chờ thanh toán</span>;
    }
    return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-[10px] font-black uppercase tracking-wider">Chờ xác nhận</span>;
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setShowAddressForm(false);
    setSelectedOrder(null); 
    setPayingOrder(null);
    setPayosData(null);
  };

  // --- RENDER MÀN HÌNH THANH TOÁN QR NẾU KHÁCH BẤM "THANH TOÁN NGAY" ---
  if (payingOrder && payosData) {
    return (
      <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-10 transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-5xl">
          <button 
            onClick={() => { setPayingOrder(null); setPayosData(null); }} 
            className="mb-6 flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors"
          >
            <i className="ri-arrow-left-line"></i> Quay lại lịch sử đơn hàng
          </button>
          
          <PaymentQR 
            orderId={payingOrder._id} 
            payosData={payosData}
            onPaymentSuccess={handlePaymentSuccess} 
            onCancel={() => {
              setPayingOrder(null); // Tắt màn hình QR
              setPayosData(null);
              fetchMyOrders(); // Cập nhật lại giao diện đơn hàng ngay lập tức
              if (selectedOrder) setSelectedOrder(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    // ... (Giữ nguyên toàn bộ phần return HTML giao diện Profile cũ của bạn từ dòng <div className="bg-gray-50...> trở đi)
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-10 transition-colors duration-300 print:bg-white print:py-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* CỘT TRÁI: Menu Profile (Ẩn khi in) */}
          <div className="md:w-1/3 print:hidden">
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 text-center sticky top-28">
              
              <div className="relative inline-block mx-auto mb-5 group cursor-pointer">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="h-28 w-28 rounded-full object-cover border-4 border-blue-50 dark:border-gray-800 shadow-md" />
                ) : (
                  <div className="h-28 w-28 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-4xl font-black border-4 border-white dark:border-gray-800 shadow-md">
                    {user?.firstname?.charAt(0)}
                  </div>
                )}
                
                <label className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  {isUploadingAvatar ? (
                    <i className="ri-loader-4-line animate-spin text-2xl"></i>
                  ) : (
                    <>
                      <i className="ri-camera-fill text-xl"></i>
                      <span className="text-[10px] font-bold mt-1 uppercase">Đổi ảnh</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUploadingAvatar} />
                </label>
              </div>

              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">
                {user?.lastname} {user?.firstname}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-8">{user?.email}</p>
              
              <div className="flex flex-col gap-2 text-left">
                <button 
                  onClick={() => switchTab('orders')}
                  className={`px-5 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  <i className="ri-history-line text-xl"></i> Lịch sử mua hàng
                </button>
                <button 
                  onClick={() => switchTab('addresses')}
                  className={`px-5 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 ${activeTab === 'addresses' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  <i className="ri-map-pin-line text-xl"></i> Sổ địa chỉ
                </button>
                <button 
                  onClick={() => switchTab('settings')}
                  className={`px-5 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  <i className="ri-settings-3-line text-xl"></i> Cài đặt tài khoản
                </button>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Nội dung Tab */}
          <div className="md:w-2/3 print:w-full">
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 md:p-10 shadow-sm border border-gray-100 dark:border-gray-800 min-h-[600px] print:shadow-none print:border-none print:p-0">
              
              {activeTab === 'orders' && (
                <div className="animate-fade-in">
                  
                  {selectedOrder ? (
                    <div>
                      {/* Chi tiết đơn hàng */}
                      <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-gray-800 pb-4 print:hidden">
                        <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors">
                          <i className="ri-arrow-left-line"></i> Quay lại
                        </button>
                        <button onClick={handleExportInvoice} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-white font-bold rounded-xl transition-colors">
                          <i className="ri-printer-line"></i> Xuất hóa đơn
                        </button>
                      </div>

                      <div className="mb-8">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase mb-2">Chi Tiết Đơn Hàng</h2>
                        <div className="flex items-center justify-between">
                          <p className="text-gray-500 font-medium">Mã đơn: <span className="text-gray-900 dark:text-white font-bold">#{selectedOrder._id.slice(-8).toUpperCase()}</span></p>
                          {getStatusBadge(selectedOrder)}
                        </div>
                        <p className="text-sm text-gray-400 mt-1">Ngày đặt: {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                      </div>

                      <div className="bg-gray-50/50 dark:bg-gray-800/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 mb-8">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4"><i className="ri-map-pin-user-line text-blue-600 mr-2"></i> Thông tin giao hàng</h3>
                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                          <p><span className="font-medium text-gray-500 w-24 inline-block">Người nhận:</span> <span className="font-bold">{selectedOrder.shippingAddress?.fullName}</span></p>
                          <p><span className="font-medium text-gray-500 w-24 inline-block">Điện thoại:</span> {selectedOrder.shippingAddress?.phone}</p>
                          <p><span className="font-medium text-gray-500 w-24 inline-block">Địa chỉ:</span> {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}</p>
                          {/* Sửa dòng hiển thị phương thức thanh toán */}
                          <p>
                            <span className="font-medium text-gray-500 w-24 inline-block">Thanh toán:</span> 
                            <span className="font-bold">
                              {selectedOrder.isPaid && selectedOrder.paymentMethod === 'QR' 
                                ? 'Chuyển khoản QR (thanh toán thành công)' 
                                : (selectedOrder.paymentMethod === 'QR' ? 'Chuyển khoản QR (chưa thanh toán)' : 'Tiền mặt (COD)')}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4"><i className="ri-shopping-bag-3-line text-blue-600 mr-2"></i> Sản phẩm đã đặt</h3>
                        <div className="space-y-4">
                          {selectedOrder.orderItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                              <img src={item.imageUrl} alt={item.title} className="w-16 h-20 object-cover rounded-xl shadow-sm" />
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2">{item.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">SL: {item.qty} x {formatPrice(item.price)}</p>
                              </div>
                              <div className="font-bold text-blue-600 dark:text-blue-400">
                                {formatPrice(item.qty * item.price)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

<div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-8">
  {/* Tạm tính */}
  <div className="flex justify-between items-center mb-2 text-sm text-gray-600 dark:text-gray-400">
    <span>Tạm tính</span>
    <span className="font-bold">
      {formatPrice(selectedOrder.itemsPrice || selectedOrder.totalAmount - (selectedOrder.shippingPrice || 0))}
    </span>
  </div>
  
  {/* Phí vận chuyển */}
  <div className="flex justify-between items-center mb-2 text-sm text-gray-600 dark:text-gray-400">
    <span>Phí vận chuyển</span>
    <span className="font-bold">{formatPrice(selectedOrder.shippingPrice || 0)}</span>
  </div>

  {/* Phần Giảm giá: Chỉ hiển thị nếu có áp dụng mã giảm giá */}
  {((selectedOrder.itemsPrice || 0) + (selectedOrder.shippingPrice || 0) - selectedOrder.totalAmount > 0) && (
    <div className="flex justify-between items-center mb-2 text-sm text-green-600 dark:text-green-400 font-medium">
      <span>Giảm giá</span>
      <span>- {formatPrice((selectedOrder.itemsPrice || 0) + (selectedOrder.shippingPrice || 0) - selectedOrder.totalAmount)}</span>
    </div>
  )}

  <div className="mb-4"></div> {/* Tạo khoảng cách */}

  {/* Tổng giá trị đơn hàng: Chỉ gạch ngang và làm mờ nếu ĐÃ THANH TOÁN */}
  <div className={`flex justify-between items-center text-base mb-2 ${selectedOrder.isPaid ? 'text-gray-500' : 'text-gray-900 dark:text-white font-bold'}`}>
    <span>Tổng giá trị đơn hàng</span>
    <span className={selectedOrder.isPaid ? "line-through" : ""}>
      {formatPrice(selectedOrder.totalAmount)}
    </span>
  </div>

  {/* HIỂN THỊ SỐ TIỀN CẦN THANH TOÁN */}
  <div className="flex justify-between items-center text-xl mt-2 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
    <span className="font-black text-gray-900 dark:text-white">
      {selectedOrder.isPaid ? 'Số tiền cần thanh toán' : 'Tổng cộng'}
    </span>
    
    {selectedOrder.isPaid ? (
      <div className="text-right">
        <span className="font-black text-3xl text-green-600 dark:text-green-400">0 đ</span>
        <p className="text-[10px] text-green-600 font-black uppercase mt-1 tracking-widest">
          <i className="ri-check-line"></i> Hoàn tất
        </p>
      </div>
    ) : (
      <span className="font-black text-3xl text-blue-600 dark:text-blue-400">
        {formatPrice(selectedOrder.totalAmount)}
      </span>
    )}
  </div>
</div>

                      <div className="flex flex-col sm:flex-row justify-end gap-3 print:hidden">
                        
                        {/* 5. NÚT THANH TOÁN NGAY TRONG CHI TIẾT ĐƠN */}
                        {selectedOrder.paymentMethod === 'QR' && !selectedOrder.isPaid && selectedOrder.status !== 'Đã hủy' && (
                          <button 
                            onClick={(e) => handlePayNow(e, selectedOrder._id)}
                            className="px-6 py-3 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-600/20"
                          >
                            Thanh toán ngay
                          </button>
                        )}

                        {selectedOrder.status === 'Chờ xác nhận' && (
                          <button onClick={(e) => handleCancelOrder(e, selectedOrder._id)} className="px-6 py-3 font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 rounded-xl transition-colors">
                            Hủy đơn hàng này
                          </button>
                        )}
                        {selectedOrder.status === 'Đang giao hàng' && (
                          <button onClick={() => handleConfirmReceived(selectedOrder._id)} className="px-6 py-3 font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all shadow-lg shadow-green-600/20">
                            Đã nhận được hàng
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
                        Lịch sử đơn hàng
                      </h2>
                      {isLoadingOrders ? (
                        <div className="flex justify-center py-12"><i className="ri-loader-4-line animate-spin text-3xl text-blue-600"></i></div>
                      ) : orders.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-800/30 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700">
                          <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <i className="ri-shopping-bag-3-line text-4xl text-gray-300 dark:text-gray-600"></i>
                          </div>
                          <p className="text-gray-500 font-medium">Bạn chưa có đơn hàng nào.</p>
                          <Link to="/store" className="mt-4 inline-block px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20">Bắt đầu mua sắm</Link>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {orders.map((order) => (
                            <div key={order._id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[1.5rem] p-6 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group">
                              
                              <div className="flex flex-wrap justify-between items-center gap-4 mb-5 border-b border-gray-50 dark:border-gray-800 pb-5">
                                <div>
                                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Mã đơn hàng</p>
                                  <p className="font-mono text-base font-black text-gray-900 dark:text-white">#{order._id.slice(-8).toUpperCase()}</p>
                                  <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                                </div>
                                <div className="text-right">
                                <div className="mb-2">{getStatusBadge(order)}</div>
                                {order.isPaid ? (
                                  <div>
                                    <p className="text-xl font-black text-green-600 dark:text-green-400">0 đ</p>
                                    <p className="text-[10px] text-gray-400 line-through">{formatPrice(order.totalAmount)}</p>
                                  </div>
                                ) : (
                                  <p className="text-xl font-black text-blue-600 dark:text-blue-400">{formatPrice(order.totalAmount)}</p>
                                )}
                              </div>
                              </div>

                              <div className="flex items-center gap-4 mb-6">
                                <div className="flex -space-x-3 overflow-hidden">
                                  {order.orderItems.slice(0, 3).map((item, index) => (
                                    <img key={index} src={item.imageUrl} alt="book" className="w-12 h-12 object-cover rounded-full border-2 border-white dark:border-gray-900 shadow-sm" />
                                  ))}
                                </div>
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                  {order.orderItems.length} sản phẩm <br/>
                                  <span className="text-xs text-gray-400 truncate max-w-[150px] sm:max-w-xs inline-block">
                                    {order.orderItems.map(i => i.title).join(', ')}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap justify-end gap-3 pt-2">
                                
                                {/* 6. NÚT THANH TOÁN Ở NGOÀI DANH SÁCH */}
                                {order.paymentMethod === 'QR' && !order.isPaid && order.status !== 'Đã hủy' && (
                                  <button 
                                    onClick={(e) => handlePayNow(e, order._id)}
                                    className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-600/20"
                                  >
                                    Thanh toán ngay
                                  </button>
                                )}

                                <button 
                                  onClick={() => setSelectedOrder(order)}
                                  className="px-5 py-2.5 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-xl transition-colors"
                                >
                                  Xem chi tiết
                                </button>
                                {order.status === 'Chờ xác nhận' && (
                                  <button onClick={(e) => handleCancelOrder(e, order._id)} className="px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                                    Hủy đơn
                                  </button>
                                )}
                                {order.status === 'Đang giao hàng' && (
                                  <button onClick={() => handleConfirmReceived(order._id)} className="px-5 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all shadow-md shadow-green-600/20">
                                    Đã nhận hàng
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* TAB SỔ ĐỊA CHỈ & CÀI ĐẶT GIỮ NGUYÊN */}
              {activeTab === 'addresses' && (
                <div className="animate-fade-in print:hidden">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                      Sổ địa chỉ
                    </h2>
                    {!showAddressForm && (
                      <button onClick={handleOpenAddAddress} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2">
                        <i className="ri-add-line"></i> Thêm địa chỉ
                      </button>
                    )}
                  </div>

                  {showAddressForm ? (
                    <div className="bg-gray-50/50 dark:bg-gray-800/20 p-6 md:p-8 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 animate-fade-in">
                      <h3 className="font-bold text-lg mb-6 text-gray-900 dark:text-white uppercase tracking-wide">
                        {editingAddressId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
                      </h3>
                      <form onSubmit={handleSubmitAddr(onSubmitAddress)} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Họ tên</label>
                            <input {...registerAddr('fullName', { required: true })} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500/50" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Số điện thoại</label>
                            <input {...registerAddr('phone', { required: true })} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500/50" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Tỉnh/Thành phố</label>
                            <input {...registerAddr('city', { required: true })} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500/50" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Địa chỉ chi tiết</label>
                            <textarea {...registerAddr('address', { required: true })} rows="2" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none resize-none focus:ring-2 focus:ring-blue-500/50 custom-scrollbar" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8 border-t border-gray-100 dark:border-gray-800 pt-5">
                          <button type="button" onClick={() => setShowAddressForm(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 transition-colors">Hủy</button>
                          <button type="submit" className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 active:scale-95">Lưu Địa Chỉ</button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {savedAddresses.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50/50 dark:bg-gray-800/30 rounded-[1.5rem] border border-dashed border-gray-200 dark:border-gray-700">
                          <i className="ri-map-pin-add-line text-4xl text-gray-300 dark:text-gray-600 mb-2 block"></i>
                          <p className="text-gray-500 font-medium">Bạn chưa lưu địa chỉ nào.</p>
                        </div>
                      ) : (
                        savedAddresses.map(addr => (
                          <div key={addr._id} className={`p-6 rounded-[1.5rem] border-2 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${addr.isDefault ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10 shadow-sm shadow-blue-500/10' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700'}`}>
                            <div className="space-y-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-black text-gray-900 dark:text-white text-lg">{addr.fullName}</span>
                                {addr.isDefault && <span className="text-[9px] uppercase font-black bg-blue-600 text-white px-2 py-0.5 rounded-md tracking-wider">Mặc định</span>}
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium"><i className="ri-phone-fill text-gray-400 mr-1.5"></i> {addr.phone}</p>
                              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium"><i className="ri-map-pin-fill text-gray-400 mr-1.5"></i> {addr.address}, {addr.city}</p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto mt-3 md:mt-0">
                              {!addr.isDefault && (
                                <button onClick={() => handleSetDefaultAddress(addr._id)} className="flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                  Đặt mặc định
                                </button>
                              )}
                              <button onClick={() => handleOpenEditAddress(addr)} className="text-blue-600 p-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-xl transition-colors"><i className="ri-edit-2-line text-lg"></i></button>
                              <button onClick={() => handleDeleteAddress(addr._id)} className="text-red-500 p-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-xl transition-colors"><i className="ri-delete-bin-line text-lg"></i></button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="animate-fade-in space-y-12 print:hidden">
                  <section>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                      Thông tin cá nhân
                    </h2>
                    <form onSubmit={handleSubmitInfo(onUpdateInfo)} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 dark:bg-gray-800/20 p-6 rounded-[1.5rem] border border-gray-100 dark:border-gray-800">
                      <div>
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Họ</label>
                        <input {...registerInfo('lastname', { required: 'Vui lòng nhập họ' })} className="w-full px-5 py-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900 dark:text-white transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Tên</label>
                        <input {...registerInfo('firstname', { required: 'Vui lòng nhập tên' })} className="w-full px-5 py-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900 dark:text-white transition-all" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Email <span className="text-gray-400 font-normal">(Không thể thay đổi)</span></label>
                        <input disabled value={user?.email} className="w-full px-5 py-3.5 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-transparent text-gray-500 font-medium cursor-not-allowed" />
                      </div>
                      <div className="md:col-span-2 flex justify-end pt-2">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95 flex items-center gap-2">
                          <i className="ri-save-line"></i> Lưu Thông Tin
                        </button>
                      </div>
                    </form>
                  </section>

                  <section>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                      Đổi mật khẩu
                    </h2>
                    <form onSubmit={handleSubmitPass(onChangePassword)} className="space-y-5 max-w-lg bg-gray-50/50 dark:bg-gray-800/20 p-6 rounded-[1.5rem] border border-gray-100 dark:border-gray-800">
                      <div>
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Mật khẩu hiện tại</label>
                        <input type="password" {...registerPass('oldPassword', { required: 'Vui lòng nhập mật khẩu cũ' })} className="w-full px-5 py-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900 dark:text-white transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Mật khẩu mới</label>
                        <input type="password" {...registerPass('newPassword', { required: 'Vui lòng nhập mật khẩu mới', minLength: { value: 6, message: 'Mật khẩu phải từ 6 ký tự' } })} className="w-full px-5 py-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900 dark:text-white transition-all" />
                        {errorsPass.newPassword && <p className="text-red-500 text-xs mt-1.5 font-medium">{errorsPass.newPassword.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Xác nhận mật khẩu mới</label>
                        <input type="password" {...registerPass('confirmPassword', { required: 'Vui lòng xác nhận mật khẩu' })} className="w-full px-5 py-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900 dark:text-white transition-all" />
                      </div>
                      <div className="flex justify-end pt-2">
                        <button type="submit" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 font-bold py-3 px-8 rounded-xl transition-all active:scale-95 flex items-center gap-2">
                          <i className="ri-lock-password-line"></i> Đổi Mật Khẩu
                        </button>
                      </div>
                    </form>
                  </section>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;