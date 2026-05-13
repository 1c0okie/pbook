import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format'; // Giả sử bạn có hàm format giá

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

const RelatedBooks = ({ 
  title = "Sách Cùng Chủ Đề", 
  books = []
}) => {
  // Ref cho nút điều hướng Swiper
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  if (!books || books.length === 0) return null;

  return (
    <section className="py-12 bg-transparent transition-colors duration-500 relative z-20">
      <div className="w-full">
        
        {/* HEADER: Tiêu đề và Nút điều hướng */}
        <div className="flex justify-between items-center mb-8 border-gray-100 dark:border-gray-800 pb-4">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {title}
          </h2>
          
          <div className="flex gap-2">
            <button
              ref={prevRef}
              className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <i className="ri-arrow-left-s-line text-lg"></i>
            </button>
            <button
              ref={nextRef}
              className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <i className="ri-arrow-right-s-line text-lg"></i>
            </button>
          </div>
        </div>

        {/* SWIPER ROW */}
        <Swiper
          modules={[Navigation, FreeMode]}
          onInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
            swiper.navigation.init();
            swiper.navigation.update();
          }}
          slidesPerView={'auto'}
          spaceBetween={16} // Khoảng cách nhỏ để sách xếp sát nhau
          freeMode={true}
          grabCursor={true}
          className="w-full !overflow-visible !pb-4"
        >
          {books.map((book) => {
            const authorName = typeof book.author === 'object' ? book.author?.name : book.author;
            const displayPrice = book.sale_price > 0 ? book.sale_price : book.price;

            return (
              <SwiperSlide key={book._id} className="!w-[140px] md:!w-[160px] lg:!w-[180px]">
                <Link to={`/book/${book._id}`} className="block group relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-md border border-gray-100 dark:border-gray-800/60 bg-gray-100 dark:bg-gray-900 transition-all duration-300">
                  
                  {/* 1. MẶC ĐỊNH: Chỉ hiện ảnh bìa */}
                  <img 
                    src={book.imageUrl || 'https://via.placeholder.com/300x450'} 
                    alt={book.title} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:blur-[2px]" 
                  />
                  
                  {/* 2. KHI HOVER: Hiện lớp phủ thông tin */}
                  <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-[2px] p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out translate-y-4 group-hover:translate-y-0">
                    
                    <h3 className="text-sm md:text-base font-bold text-white line-clamp-2 leading-snug mb-1.5" title={book.title}>
                      {book.title}
                    </h3>
                    
                    <p className="text-xs text-gray-300 mb-3 line-clamp-1">
                      {authorName || "Tác giả ẩn danh"}
                    </p>
                    
                    <div className="pt-2 border-t border-white/20">
                      <span className="text-base md:text-lg font-black text-blue-600">
                        {formatPrice(displayPrice)}
                      </span>
                      {book.sale_price > 0 && (
                        <span className="text-xs text-gray-400 line-through ml-2">
                          {formatPrice(book.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nhãn Sale nhỏ góc trên (vẫn hiện mặc định) */}
                  {book.sale_price > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">
                      SALE
                    </div>
                  )}
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>

      </div>
    </section>
  );
};

export default RelatedBooks;