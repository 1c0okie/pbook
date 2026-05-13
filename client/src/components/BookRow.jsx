import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules'; // Đã bỏ FreeMode để cuộn từng khung mượt như Testimonial
import { Link } from 'react-router-dom';
import BookCard from './BookCard.jsx'; 

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const BookRow = ({ title = "Tiêu đề danh mục", books = [], viewAllLink = "/store" }) => {
  // Khởi tạo ref để điều khiển Swiper bằng nút bấm bên ngoài
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <section className="py-12 bg-white dark:bg-gray-950 transition-colors duration-500">
      <div className="w-full px-6 md:px-12 lg:px-16 mx-auto">
        
        {/* HEADER: Tiêu đề và Nút điều hướng */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
             <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {title}
            </h2>
          </div>

          {/* Nút Trái/Phải tùy chỉnh (Giữ nguyên theo yêu cầu) */}
          <div className="flex gap-3">
            <button
              ref={prevRef}
              className="w-10 h-10 rounded-full border-2 border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <i className="ri-arrow-left-s-line text-xl"></i>
            </button>
            <button
              ref={nextRef}
              className="w-10 h-10 rounded-full border-2 border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <i className="ri-arrow-right-s-line text-xl"></i>
            </button>       
           </div>
        </div>

        {/* SWIPER ROW: Sử dụng cơ chế Breakpoints giống TestimonialSection */}
        <Swiper
          modules={[Navigation]}
          onInit={(swiper) => {
            // Gán các nút bấm vào Swiper khi khởi tạo
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
            swiper.navigation.init();
            swiper.navigation.update();
          }}
          // Cấu hình responsive (chia cột)
          slidesPerView={2} // Mặc định Mobile hiện 2 cuốn
          spaceBetween={16}
          breakpoints={{
            640: { slidesPerView: 3, spaceBetween: 20 },   // Tablet nhỏ
            768: { slidesPerView: 4, spaceBetween: 24 },   // Tablet ngang
            1024: { slidesPerView: 5, spaceBetween: 24 },  // Laptop
            1280: { slidesPerView: 6, spaceBetween: 24 },  // Màn hình lớn
          }}
          grabCursor={true}
          // Đổi từ !overflow-visible sang thêm Padding (py-8 px-2) để bóng đổ không bị xén mà vẫn không tràn trang
          className="w-full py-8 px-2"
        >
          {books.length > 0 ? (
            books.map((book) => (
              // Đã xóa các class ép cứng width (!w-[...])
              <SwiperSlide key={book._id}>
                <BookCard book={book} />
              </SwiperSlide>
            ))
          ) : (
            // Skeleton khi trống dữ liệu
            [1, 2, 3, 4, 5, 6].map((n) => (
              <SwiperSlide key={n}>
                <div className="w-full aspect-[3/4] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl"></div>
              </SwiperSlide>
            ))
          )}
        </Swiper>
      </div>
    </section>
  );
};

export default BookRow;