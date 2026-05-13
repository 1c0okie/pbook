import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cart.store';
import { formatPrice } from '../utils/format';
import useAuthStore from '../store/auth.store';

const CartDrawer = () => {
  const { cartItems, isCartOpen, closeCart, removeFromCart, updateQuantity, getCartTotal, syncCartWithServer } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isCartOpen) {
      syncCartWithServer();
    }
  }, [isCartOpen, syncCartWithServer]);

  const handleCheckout = () => {
    closeCart();
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <>
      {/* Overlay: Nền mờ hiện đại hơn với hiệu ứng blur mạnh */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-[60] transition-opacity duration-500"
          onClick={closeCart}
        ></div>
      )}

      {/* Drawer Container */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white dark:bg-gray-950 shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[70] transform transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header: Thiết kế thoáng và sang trọng */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 dark:border-gray-800/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              Giỏ hàng
              <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {cartItems.reduce((a, c) => a + c.qty, 0)}
              </span>
            </h2>
          </div>
          <button 
            onClick={closeCart} 
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-all group"
          >
            <i className="ri-close-line text-2xl group-hover:rotate-90 transition-transform"></i>
          </button>
        </div>

        {/* Nội dung giỏ hàng */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar space-y-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                <div className="relative h-40 w-40 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center">
                  <i className="ri-shopping-basket-2-line text-6xl text-gray-200 dark:text-gray-700"></i>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Giỏ hàng đang trống</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-[200px]">Hãy thêm những quyển sách tuyệt vời vào giỏ hàng của bạn nhé!</p>
              <button 
                onClick={closeCart} 
                className="mt-4 px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all hover:scale-105 active:scale-95"
              >
                Khám phá ngay
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {cartItems.map((item) => (
                <div key={item.book} className="group relative flex gap-5 p-4 rounded-[2rem] bg-gray-50 dark:bg-gray-900/50 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all hover:shadow-xl hover:shadow-blue-600/5">
                  {/* Nút xóa nhanh */}
                  <button 
                    onClick={() => removeFromCart(item.book)}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 shadow-md rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
                  >
                    <i className="ri-close-circle-fill text-xl"></i>
                  </button>

                  {/* Ảnh sách với hiệu ứng đổ bóng vật lý */}
                  <div className="h-32 w-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-500">
                    <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  
                  {/* Thông tin sản phẩm */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-base line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                      <div className="text-blue-600 dark:text-blue-400 font-black mt-2 text-lg">
                        {formatPrice(item.price)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto">
                      {/* Bộ đếm số lượng hiện đại */}
                      <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700">
                        <button 
                          onClick={() => updateQuantity(item.book, item.qty - 1)} 
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                        >
                          <i className="ri-subtract-line text-sm"></i>
                        </button>
                        <span className="w-10 text-center text-sm font-black dark:text-white">{item.qty}</span>
                        <button 
                          onClick={() => updateQuantity(item.book, item.qty + 1)} 
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                        >
                          <i className="ri-add-line text-sm"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Tổng tiền và thanh toán */}
        {/* Footer: Tổng tiền và thanh toán */}
{cartItems.length > 0 && (
  <div className="p-8 space-y-6 bg-white dark:bg-gray-950 border-t border-gray-50 dark:border-gray-800">
    <div className="space-y-3">
      <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
        <span className="font-medium">Tạm tính</span>
        <span className="font-bold">{formatPrice(getCartTotal())}</span>
      </div>
      <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
        <span className="font-medium">Phí vận chuyển</span>
        <span className="text-sm italic">Tính ở bước sau</span>
      </div>
      <div className="h-px bg-gray-100 dark:bg-gray-800 my-4"></div>
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold text-gray-900 dark:text-white">Tổng cộng</span>
        <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
          {formatPrice(getCartTotal())}
        </span>
      </div>
    </div>

    {/* Nút Thanh toán đã được làm nhỏ lại (py-3.5) và bỏ icon */}
    <div className="flex justify-center pt-2">
      <button 
        onClick={handleCheckout}
        className="w-full sm:w-3/4 relative group overflow-hidden bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold text-base transition-all shadow-lg shadow-blue-600/20 active:scale-95"
      >
        <span className="relative z-10">
          Thanh toán
        </span>
        {/* Hiệu ứng Shimmer nhẹ nhàng */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </button>
    </div>
  </div>
)}
      </div>
    </>
  );
};

export default CartDrawer;