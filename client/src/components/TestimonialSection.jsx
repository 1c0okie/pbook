import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

// Import CSS của Swiper
import 'swiper/css';
import 'swiper/css/pagination';

// Import service lấy API
import { reviewService } from '../services/review.service';

const TestimonialSection = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        
        // === GỌI API THẬT ===
        // Gọi hàm getFeaturedReviews từ service để lấy list đánh giá đã được bóc tách từ Backend
        const data = await reviewService.getFeaturedReviews(); 
        
        // Backend trả về dạng { reviews: [...] } nên ta lấy data.reviews
        const reviewList = data.reviews || data || [];

        setReviews(reviewList);
        
      } catch (error) {
        console.error("Lỗi lấy đánh giá từ API:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Hàm render số sao (Star)
  const renderStars = (rating) => {
    const validRating = rating || 5;
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < validRating) {
        stars.push(<i key={i} className="ri-star-fill text-yellow-500 text-lg"></i>);
      } else {
        stars.push(<i key={i} className="ri-star-line text-gray-300 dark:text-gray-600 text-lg"></i>);
      }
    }
    return stars;
  };

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Tiêu đề Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
            Khách Hàng Nói Gì Về Chúng Tôi?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Hàng ngàn độc giả đã trải nghiệm và hài lòng với dịch vụ. Hãy xem họ đánh giá như thế nào nhé!
          </p>
        </div>

        {/* Khu vực Slider */}
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : reviews.length === 0 ? (
          // Trạng thái trống khi API chưa có review nào
          <div className="text-center text-gray-500 dark:text-gray-400 py-10">
            Hiện chưa có đánh giá nào trên hệ thống.
          </div>
        ) : (
          <div className="pb-12">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={24}
              slidesPerView={1}
              // Chỉ bật loop khi số lượng bài review >= 3 để tránh lỗi nhân bản của Swiper
              loop={reviews.length >= 3} 
              autoplay={{
                delay: 3500,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                // Đảm bảo không bị lỗi layout nếu số lượng review ít hơn 3
                1024: { slidesPerView: Math.min(3, reviews.length) }, 
              }}
              className="px-4 py-8"
            >
              {reviews.map((review, index) => {
                // Xử lý an toàn dữ liệu từ backend (Fallback)
                const userName = review.userName || review.name || "Khách hàng ẩn danh";
                const avatar = review.avatar || review.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;
                const bookTitle = review.bookTitle || "Sản phẩm của shop";
                const comment = review.comment || "Rất hài lòng với sản phẩm!";

                return (
                  <SwiperSlide key={review._id || index} className="h-auto">
                    <div className="h-full bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col relative">
                      
                      {/* Dấu nháy kép trang trí (Quote icon) */}
                      <i className="ri-double-quotes-l absolute top-6 right-8 text-5xl text-blue-50 dark:text-gray-800/50 pointer-events-none"></i>

                      {/* Phần chữ đánh giá (line-clamp-5 giới hạn tối đa 5 dòng) */}
                      <p className="text-gray-600 dark:text-gray-400 italic mb-6 relative z-10 flex-grow leading-relaxed line-clamp-5" title={comment}>
                        "{comment}"
                      </p>

                      <div className="mt-auto">
                        {/* Ngôi sao */}
                        <div className="flex gap-1 mb-4">
                          {renderStars(review.rating)}
                        </div>

                        <div className="flex items-center gap-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                          <img 
                            src={avatar} 
                            alt={userName} 
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 dark:border-gray-700"
                          />
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{userName}</h4>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium line-clamp-1">
                              Đã mua: <span className="text-gray-500 dark:text-gray-400">"{bookTitle}"</span>
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        )}

      </div>
    </section>
  );
};

export default TestimonialSection;