import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useCartStore from '../../store/cart.store';
import useAuthStore from '../../store/auth.store';
import useSettingStore from '../../store/setting.store';
import { orderService } from '../../services/order.service';
import { formatPrice } from '../../utils/format';
import { couponService } from '../../services/coupon.service';
import { userService } from '../../services/user.service';

// 1. IMPORT COMPONENT MÃ QR
import PaymentQR from '../../components/PaymentQR';

const Checkout = () => {
  const { settings } = useSettingStore();
  const { cartItems, getCartTotal, clearCart } = useCartStore();
  const { user, updateUserAddresses } = useAuthStore();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // --- CÁC STATE CHO THANH TOÁN QR ---
  const [showQR, setShowQR] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [payosData, setPayosData] = useState(null);

  const [savedAddresses, setSavedAddresses] = useState(user?.addresses || []);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const baseShippingFee = settings?.defaultShippingFee || 30000;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user ? `${user.lastname} ${user.firstname}` : '',
      paymentMethod: 'COD'
    }
  });

  const selectedPaymentMethod = watch('paymentMethod');

  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      setSavedAddresses(user.addresses);
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
        setValue('fullName', defaultAddr.fullName);
        setValue('phone', defaultAddr.phone);
        setValue('city', defaultAddr.city);
        setValue('address', defaultAddr.address);
      }
    } else {
      setSavedAddresses([]);
      setSelectedAddressId('new');
    }
  }, [user, setValue]);

  useEffect(() => {
    if (savedAddresses.length > 0) {
      const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
      handleSelectAddress(defaultAddr._id);
    } else {
      handleSelectAddress('new');
    }
  }, [savedAddresses]);

  const handleSelectAddress = (id) => {
    setSelectedAddressId(id);
    if (id === 'new') {
      setValue('fullName', user ? `${user.lastname} ${user.firstname}` : '');
      setValue('phone', '');
      setValue('city', '');
      setValue('address', '');
    } else {
      const addr = savedAddresses.find(a => a._id === id);
      if (addr) {
        setValue('fullName', addr.fullName);
        setValue('phone', addr.phone);
        setValue('city', addr.city);
        setValue('address', addr.address);
      }
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return toast.error('Vui lòng nhập mã giảm giá');
    
    try {
      setIsVerifying(true);
      const data = await couponService.verify(couponInput);
      setAppliedCoupon({ code: data.code, discount: data.discount });
      toast.success(data.message);
      setCouponInput('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi áp dụng mã');
      setAppliedCoupon(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Đã gỡ mã giảm giá');
  };

  // --- SỬA LỖI Ở ĐÂY: Thêm cờ !isProcessing để ngăn văng trang khi đang load ---
  useEffect(() => {
    if (cartItems.length === 0 && !showQR && !isProcessing) {
      toast.error('Giỏ hàng của bạn đang trống!');
      navigate('/store');
    }
  }, [cartItems, navigate, showQR, isProcessing]);

  const itemsPrice = getCartTotal();
  const shippingPrice = itemsPrice > 500000 ? 0 : baseShippingFee; 
  const discountAmount = appliedCoupon ? (itemsPrice * appliedCoupon.discount) / 100 : 0;
  const totalAmount = itemsPrice - discountAmount + shippingPrice;

  const onSubmit = async (data) => {
    try {
      setIsProcessing(true); // Bắt đầu load (khóa useEffect văng trang)

      if (selectedAddressId === 'new' && saveToProfile && user) {
        try {
          const newAddresses = await userService.addAddress({
            fullName: data.fullName,
            phone: data.phone,
            city: data.city,
            address: data.address,
            isDefault: savedAddresses.length === 0
          });
          setSavedAddresses(newAddresses);
          updateUserAddresses(newAddresses);
        } catch (err) {
          console.error("Lỗi lưu địa chỉ:", err);
        }
      }

      const orderData = {
        orderItems: cartItems,
        shippingAddress: {
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          city: data.city,
        },
        paymentMethod: data.paymentMethod,
        itemsPrice,
        shippingPrice,
        totalAmount,
      };

      const savedOrder = await orderService.create(orderData);
      
      // BỎ GỌI clearCart() Ở ĐÂY

      if (data.paymentMethod === 'QR') {
        toast.loading('Đang khởi tạo mã thanh toán...', { id: 'qr-load' });
        const paymentRes = await orderService.createPaymentLink(savedOrder._id);
        toast.dismiss('qr-load');
        
        setPayosData(paymentRes);
        setCreatedOrder(savedOrder);
        setShowQR(true); // Mở Component QR
        clearCart(); // CHỈ XÓA GIỎ HÀNG SAU KHI ĐÃ SET SHOWQR = TRUE
      } else {
        clearCart(); // XÓA GIỎ HÀNG BÌNH THƯỜNG VỚI ĐƠN COD
        toast.success('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
        navigate('/profile');
      }

    } catch (error) {
      toast.dismiss('qr-load');
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setIsProcessing(false); // Kết thúc load
    }
  };

  // RENDER MÀN HÌNH THANH TOÁN QR NẾU SHOWQR LÀ TRUE
  if (showQR && createdOrder && payosData) {
    return (
      <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-10 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <PaymentQR 
            orderId={createdOrder._id} 
            payosData={payosData}
            onPaymentSuccess={() => {
              navigate('/profile'); // Chuyển về profile khi web hook bắt đc tiền
            }} 
          />
        </div>
      </div>
    );
  }

  // Ẩn giỏ hàng nếu rỗng
  if (cartItems.length === 0 && !showQR) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-10 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Thanh Toán Đơn Hàng</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Vui lòng kiểm tra thông tin giao hàng và giỏ hàng của bạn.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* THÔNG TIN NHẬN HÀNG */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <i className="ri-map-pin-line text-blue-600"></i> Thông tin nhận hàng
              </h2>
              
              {user && (
                <div className="mb-6 bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                  <label className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-3">
                    Chọn từ Sổ địa chỉ của bạn
                  </label>
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700/50 outline-none text-gray-900 dark:text-white transition-all hover:border-blue-400 shadow-sm"
                    >
                      <span className="font-medium text-left truncate pr-4">
                        {selectedAddressId === 'new'
                          ? '+ Nhập địa chỉ nhận hàng mới'
                          : (() => {
                              const addr = savedAddresses.find(a => a._id === selectedAddressId);
                              return addr ? `${addr.fullName} - ${addr.phone} (${addr.city})` : 'Chọn địa chỉ';
                            })()
                        }
                      </span>
                      <i className={`ri-arrow-down-s-line text-xl text-blue-600 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
                    </button>

                    {isDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>

                        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                          <div className="max-h-72 overflow-y-auto custom-scrollbar p-1">
                            
                            <button
                              type="button"
                              onClick={() => { handleSelectAddress('new'); setIsDropdownOpen(false); }}
                              className={`w-full text-left px-5 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-1 ${selectedAddressId === 'new' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                            >
                              <i className="ri-add-circle-fill text-xl"></i> Nhập địa chỉ nhận hàng mới
                            </button>

                            {savedAddresses.map(addr => (
                              <button
                                key={addr._id}
                                type="button"
                                onClick={() => { handleSelectAddress(addr._id); setIsDropdownOpen(false); }}
                                className={`w-full text-left px-5 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent ${selectedAddressId === addr._id ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800' : ''}`}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <i className="ri-map-pin-user-line text-gray-400"></i> {addr.fullName}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="text-[10px] uppercase font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">Mặc định</span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 pl-6">{addr.phone}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 pl-6 truncate">{addr.address}, {addr.city}</p>
                              </button>
                            ))}

                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ và Tên <span className="text-red-500">*</span></label>
                  <input 
                    {...register('fullName', { required: 'Vui lòng nhập họ tên' })}
                    disabled={selectedAddressId !== 'new'}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-950 text-gray-900 dark:text-white transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800/50"
                    placeholder="Nhập họ tên người nhận"
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                  <input 
                    type="tel"
                    {...register('phone', { required: 'Vui lòng nhập số điện thoại' })}
                    disabled={selectedAddressId !== 'new'}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-950 text-gray-900 dark:text-white transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800/50"
                    placeholder="VD: 0912345678"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                  <input 
                    {...register('city', { required: 'Vui lòng nhập Tỉnh/Thành phố' })}
                    disabled={selectedAddressId !== 'new'}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-950 text-gray-900 dark:text-white transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800/50"
                    placeholder="VD: Hà Nội"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Địa chỉ chi tiết <span className="text-red-500">*</span></label>
                  <textarea 
                    {...register('address', { required: 'Vui lòng nhập địa chỉ cụ thể' })}
                    disabled={selectedAddressId !== 'new'}
                    rows="2"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-950 text-gray-900 dark:text-white transition-all outline-none resize-none disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800/50"
                    placeholder="Số nhà, ngõ, đường, phường/xã..."
                  ></textarea>
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                </div>

                {user && selectedAddressId === 'new' && (
                  <div className="md:col-span-2 mt-2">
                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-xl border border-gray-200 dark:border-gray-700">
                      <input 
                        type="checkbox" 
                        checked={saveToProfile}
                        onChange={(e) => setSaveToProfile(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">
                        Lưu địa chỉ này vào Sổ địa chỉ để mua hàng nhanh hơn vào lần sau
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* PHƯƠNG THỨC THANH TOÁN */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <i className="ri-bank-card-line text-blue-600"></i> Phương thức thanh toán
              </h2>
              
              <div className="space-y-4">
                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${selectedPaymentMethod === 'COD' ? 'border-blue-400 bg-blue-50/50 dark:border-blue-500/50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                  <input 
                    type="radio" 
                    value="COD" 
                    {...register('paymentMethod')}
                    className="w-5 h-5 text-blue-600 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white flex items-center justify-between">
                      Thanh toán khi nhận hàng (COD)
                      <i className="ri-truck-line text-xl text-gray-400"></i>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Trả tiền mặt khi shipper giao sách đến nhà bạn.</p>
                  </div>
                </label>
                
                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${selectedPaymentMethod === 'QR' ? 'border-blue-400 bg-blue-50/50 dark:border-blue-500/50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                  <input 
                    type="radio" 
                    value="QR" 
                    {...register('paymentMethod')}
                    className="w-5 h-5 text-blue-600 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white flex items-center justify-between">
                      Thanh toán qua mã QR
                      <i className="ri-qr-scan-2-line text-xl text-blue-500"></i>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Quét mã QR để chuyển khoản nhanh.</p>
                  </div>
                </label>
              </div>
            </div>

          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-28">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                {cartItems.map(item => (
                  <div key={item.book} className="flex gap-4">
                    <img src={item.imageUrl} alt={item.title} className="w-16 h-20 object-cover rounded-lg border border-gray-100 dark:border-gray-800" />
                    <div className="flex-1 text-sm">
                      <p className="font-semibold text-gray-900 dark:text-white line-clamp-2">{item.title}</p>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">SL: {item.qty}</p>
                      <p className="text-blue-600 dark:text-blue-400 font-bold mt-1">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 py-6 my-2">
                {appliedCoupon ? (
                  <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-green-700 dark:text-green-400">
                        Đã áp dụng mã: {appliedCoupon.code}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">- Giảm {appliedCoupon.discount}%</p>
                    </div>
                    <button type="button" onClick={removeCoupon} className="text-red-500 hover:text-red-700 font-bold text-sm px-2">Gỡ</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Nhập mã giảm giá..." 
                      className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:border-blue-500 text-gray-900 dark:text-white uppercase transition-colors"
                    />
                    <button 
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isVerifying || !couponInput}
                      className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                      {isVerifying ? <i className="ri-loader-4-line animate-spin"></i> : 'Áp Dụng'}
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tạm tính</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatPrice(itemsPrice)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 dark:text-green-400 font-bold">
                    <span>Giảm giá ({appliedCoupon.discount}%)</span>
                    <span>- {formatPrice(discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400 items-center">
                  <span>
                    Phí giao hàng 
                    {shippingPrice === 0 && <span className="text-green-600 dark:text-green-400 text-[10px] uppercase bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full ml-2 font-bold tracking-wider">Freeship</span>}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatPrice(shippingPrice)}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 mt-6 pt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">Tổng cộng</span>
                <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{formatPrice(totalAmount)}</span>
              </div>

              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? <><i className="ri-loader-4-line animate-spin text-lg"></i> Đang xử lý...</> : 'Xác nhận Đặt Hàng'}
              </button>
              
              <Link to="/store" className="block text-center mt-6 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                <i className="ri-arrow-left-line align-middle mr-1"></i> Quay lại cửa hàng
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;