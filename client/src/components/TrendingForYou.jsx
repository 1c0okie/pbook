import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { Link } from 'react-router-dom';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';

// Định nghĩa sẵn một bộ sưu tập các dải màu Pastel tuyệt đẹp cho nền thẻ
const COLOR_PALETTES = [
  { bg: "bg-gradient-to-br from-[#8ecbfb] to-[#b3dcfc]", shadow: "shadow-blue-200" },   // Xanh biển
  { bg: "bg-gradient-to-br from-[#a78bfa] to-[#c4b5fd]", shadow: "shadow-purple-200" }, // Tím
  { bg: "bg-gradient-to-br from-[#fda4af] to-[#fecdd3]", shadow: "shadow-rose-200" },   // Hồng
  { bg: "bg-gradient-to-br from-[#fcd34d] to-[#fde68a]", shadow: "shadow-yellow-200" }, // Vàng
  { bg: "bg-gradient-to-br from-[#6ee7b7] to-[#a7f3d0]", shadow: "shadow-emerald-200" }, // Xanh ngọc
];

// Nhận Props từ trang Home truyền vào
const TrendingForYou = ({ trendingBooks = [] }) => {
  
  // Hàm render số sao
  const renderStars = (rating) => {
    const validRating = rating || null; 
    return [...Array(5)].map((_, index) => (
      <i key={index} 
         className={`ri-star-fill text-base ${index < validRating ? 'text-white' : 'text-white/40'}`}>
      </i>
    ));
  };

  return (
    <section className="py-10 bg-white dark:bg-gray-950 transition-colors">
      <div className="w-full px-6 md:px-12 lg:px-16 mx-auto">
        
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Xu Hướng
          </h2>
          <Link to="/store" className="group text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 transition-colors hidden sm:flex items-center gap-1">
                    Xem tất cả <i className="ri-arrow-right-s-line transition-transform group-hover:translate-x-1"></i>
            </Link>
        </div>

        {/* Xử lý hiển thị trực tiếp dựa trên dữ liệu trendingBooks */}
        {trendingBooks && trendingBooks.length > 0 ? (
          <Swiper
            modules={[FreeMode]}
            slidesPerView={'auto'}
            spaceBetween={32}
            freeMode={true} 
            grabCursor={true}
            className="w-full !pb-10"
          >
            {trendingBooks.map((book, index) => {
              // Tự động xoay vòng gán màu ngẫu nhiên
              const palette = COLOR_PALETTES[index % COLOR_PALETTES.length];
              const authorName = typeof book.author === 'object' ? book.author?.name : book.author;

              return (
                <SwiperSlide key={book._id || index} className="!w-[360px] md:!w-[420px]">
                  <Link to={`/book/${book._id}`} className="block">
                    <div className={`relative flex items-center p-8 h-[240px] rounded-3xl shadow-xl ${palette.shadowColor} ${palette.bg} overflow-hidden group transition-transform `}>
                      
                      <div className="w-32 h-48 flex-shrink-0 z-10 rounded-md shadow-lg overflow-hidden group-hover:scale-105 transition-transform duration-300">
                        <img src={book.imageUrl || book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                      </div>

                      <div className="ml-6 flex flex-col justify-center text-white z-10 overflow-hidden">
                        <h3 className="text-xl font-bold leading-tight mb-2 line-clamp-2 drop-shadow-sm">
                          {book.title}
                        </h3>
                        <p className="text-base font-medium text-white/90 mb-4 line-clamp-1">
                          By {authorName || "Unknown"}
                        </p>
                        
                        <div className="flex gap-1.5 mb-5 drop-shadow-sm">
                          {renderStars(book.rating)}
                        </div>

                       {/* ĐOẠN ĐÃ SỬA: HIỂN THỊ NGƯỜI MUA THẬT */}
                        <div className="flex items-center">
                          {book.buyers && book.buyers.length > 0 ? (
                            <>
                              {/* Lấy tối đa 3 ảnh avatar của khách hàng */}
                              {book.buyers.slice(0, 3).map((buyer, bIndex) => (
                                <img 
                                  key={buyer._id || bIndex}
                                  src={buyer.avatarUrl || "https://i.pravatar.cc/150?u=default"} 
                                  className={`w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm ${bIndex > 0 ? '-ml-2.5' : ''}`} 
                                  alt="user" 
                                  title={`${buyer.lastname || ''} ${buyer.firstname || ''}`.trim()}
                                />
                              ))}
                              
                              {/* Tính toán hiển thị số lượng người mua còn lại dựa trên trường sold */}
                              {((book.sold || book.buyers.length) - Math.min(book.buyers.length, 3)) > 0 && (
                                <div className="h-8 px-2 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm -ml-2.5 backdrop-blur-sm">
                                  +{ (book.sold || book.buyers.length) - Math.min(book.buyers.length, 3) }
                                </div>
                              )}
                            </>
                          ) : (
                            /* Hiện thông báo nhẹ nhàng nếu chưa có ai mua */
                            <span className="text-xs text-white/80 font-medium italic">Chưa có lượt mua</span>
                          )}
                        </div>
                      </div>

                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        ) : (
          // Nếu mảng sách rỗng hoặc chưa truyền dữ liệu xuống
          <div className="py-10 text-center text-gray-500 dark:text-gray-400">
            Chưa có cuốn sách nổi bật nào trong tuần này.
          </div>
        )}

      </div>
    </section>
  );
};

export default TrendingForYou;