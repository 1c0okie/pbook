import React from 'react';
import { Link } from 'react-router-dom';

// Import ảnh từ thư mục assets của bạn
import book1 from '../assets/img/discount-book-1.png';
import book2 from '../assets/img/discount-book-2.png';

const PromoSection = () => {
  return (
    <section className="py-16 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Container: Giữ độ cao và rộng đã chỉnh ở bước trước */}
        <div className="bg-blue-50 dark:bg-gray-900 rounded-[3rem] p-10 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 shadow-sm border border-blue-100 dark:border-gray-800 relative overflow-hidden">
          
          {/* Mảng màu trang trí mờ ở góc */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-200 dark:bg-blue-900/40 opacity-50 blur-3xl pointer-events-none"></div>

          {/* CỘT CHỨA ẢNH: Tăng thêm 20% kích thước so với bản trước */}
          <div className="md:w-1/2 flex justify-center items-center relative z-10 mt-8 md:mt-0 order-2 md:order-1">
            <div className="relative flex justify-center w-full max-w-md group cursor-pointer">
              
             {/* Ảnh 1: Tăng từ 210px lên 260px (Desktop) */}
              <img 
                src={book1} 
                alt="Discount Book 1" 
                className="w-[200px] md:w-[260px] object-contain drop-shadow-2xl transform translate-x-8 -rotate-12 z-10 transition-all duration-500 group-hover:translate-x-2 group-hover:-rotate-6 group-hover:scale-105"
              />
              
              {/* Ảnh 2: Tăng từ 210px lên 260px (Desktop) */}
              <img 
                src={book2} 
                alt="Discount Book 2" 
                className="w-[200px] md:w-[260px] object-contain drop-shadow-2xl transform -translate-x-8 rotate-12 z-20 transition-all duration-500 group-hover:translate-x-4 group-hover:rotate-6 group-hover:scale-105"
              />
            </div>
          </div>

          {/* CỘT NỘI DUNG: Hạ cỡ chữ đi 1 chút */}
          <div className="md:w-1/2 text-center md:text-left space-y-6 relative z-10 order-1 md:order-2">
            {/* Giảm từ text-6xl xuống text-4xl/5xl */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white leading-tight">
              Giảm Giá Lên Đến <br />
              <span className="text-blue-600 dark:text-blue-400">50%</span>
            </h2>
            
            {/* Giảm từ text-xl xuống text-lg */}
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-lg mx-auto md:mx-0">
              Tận dụng ngay những ngày vàng ưu đãi. Mua sách từ các tác giả yêu thích của bạn, mua càng nhiều - giảm càng sâu.
            </p>

            <div className="pt-2">
              <Link 
                to="/store" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-10 rounded-2xl transition-all shadow-xl shadow-blue-600/30 hover:-translate-y-1"
              >
                Mua sắm ngay
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PromoSection;