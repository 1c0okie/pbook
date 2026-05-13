import React from 'react';
import { Link } from 'react-router-dom';
import useWishlistStore from '../../store/wishlist.store';
import BookCard from '../../components/BookCard';

const Wishlist = () => {
  const { wishlist, isLoading } = useWishlistStore();

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-16 transition-colors duration-300 relative overflow-hidden">
      
      {/* Các mảng màu trang trí nền (Blur Decor) */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-red-100 dark:bg-red-900/10 opacity-50 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-blue-100 dark:bg-blue-900/10 opacity-50 blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* --- HEADER TRANG --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/50 dark:border-gray-800/50 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white flex items-center gap-4">
              <span className="p-3 bg-red-50 dark:bg-red-900/30 rounded-2xl shadow-inner">
                <i className="ri-heart-3-fill text-red-500 animate-pulse"></i>
              </span>
              Tủ Sách Yêu Thích
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium pl-2">
              Chứa đựng {wishlist.length} cuốn sách chạm đến trái tim bạn.
            </p>
          </div>
          
          <Link 
            to="/store" 
            className="group px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 self-start md:self-center"
          >
            Tiếp tục mua sắm
            <i className="ri-arrow-right-line transition-transform group-hover:translate-x-1"></i>
          </Link>
        </div>

        {/* --- NỘI DUNG --- */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-32 space-y-4">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-500 font-bold animate-pulse">Đang mở tủ sách...</p>
          </div>
        ) : wishlist.length === 0 ? (
          /* Trạng thái trống hiện đại hơn */
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800 p-16 md:p-24 text-center shadow-xl">
            <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-red-200 dark:bg-red-900/20 rounded-full blur-2xl opacity-50"></div>
                <div className="relative h-32 w-32 bg-red-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto border-4 border-white dark:border-gray-700 shadow-lg">
                  <i className="ri-heart-add-line text-6xl text-red-400"></i>
                </div>
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Tủ sách đang đợi bạn đầy!</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-10 text-lg leading-relaxed">
              Hãy lấp đầy khoảng trống này bằng những tác phẩm kinh điển và những câu chuyện hấp dẫn từ cửa hàng của chúng tôi.
            </p>
            <Link 
              to="/store" 
              className="inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black px-10 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              Khám Phá Cửa Hàng
            </Link>
          </div>
        ) : (
          /* Danh sách Grid mượt mà */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
            {wishlist.map((book) => (
              <div key={book._id} className="hover:scale-[1.02] transition-transform duration-300">
                <BookCard book={book} />
              </div>
            ))}
          </div>
        )}

        {/* --- FOOTER TRANG --- */}
        {wishlist.length > 0 && (
          <div className="mt-20 p-10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md rounded-[2.5rem] border border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/30 rotate-3">
                <i className="ri-cloud-line text-3xl"></i>
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Đồng bộ đám mây</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-1">
                  Danh sách này đã được lưu an toàn. Bạn có thể xem lại trên mọi thiết bị sau khi đăng nhập.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
                <button 
                onClick={() => window.print()}
                className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center gap-3 shadow-sm"
                >
                <i className="ri-printer-fill text-xl text-blue-600"></i> Lưu về PDF / In
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;