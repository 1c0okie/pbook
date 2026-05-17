import React from 'react';
import { Link } from 'react-router-dom';

const HeroBanner = ({ 
  // Khai báo các Props với giá trị mặc định. 
  // Sau này bạn fetch từ Admin API và truyền vào component này.
  tagline = "Khám phá tri thức mới",
  titlePart1 = "Không gian",
  highlightText = "sách hiện đại",
  titlePart2 = "dành cho bạn.",
  description = "Hàng ngàn đầu sách chất lượng cao về Lập trình, Kinh doanh, Kiến trúc hệ thống và nhiều lĩnh vực khác đang chờ đón.",
  bannerImage = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000&auto=format&fit=crop",
  ctaText = "Mua sắm ngay",
  ctaLink = "/store"
}) => {
  return (
    <section className="relative bg-white dark:bg-gray-900 overflow-hidden border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      
      {/* =========================================
          BACKGROUND SHAPES & LIGHTING EFFECTS
          Đổi màu theo mùa nhờ dùng base bg-blue-*
          ========================================= */}
      
      {/* 1. Nền phủ toàn bộ (Giữ nguyên) */}
      <div className="absolute inset-0 bg-blue-50/40 dark:bg-blue-900/10 pointer-events-none"></div>

      {/* 2. Khối mờ góc trên phải (Phóng to cực đại) */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-50 blur-[100px] pointer-events-none transition-colors duration-700"></div>

      {/* 3. Khối mờ góc dưới trái (Phóng to) */}
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[500px] h-[500px] rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-40 blur-[80px] pointer-events-none transition-colors duration-700"></div>

      {/* 4. Vệt nắng chính (Chiếu chéo từ trên xuống) */}
      <div className="absolute top-[-20%] left-[10%] w-[1200px] h-[250px] bg-blue-200 dark:bg-blue-800/20 opacity-30 rotate-[35deg] blur-[120px] pointer-events-none transition-colors duration-700"></div>

      {/* 5. Vệt nắng phụ (Song song, tạo chiều sâu) */}
      <div className="absolute top-[10%] right-[-10%] w-[800px] h-[150px] bg-blue-100 dark:bg-blue-900/20 opacity-40 rotate-[35deg] blur-[90px] pointer-events-none transition-colors duration-700"></div>
      
      {/* ========================================= */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center py-20 lg:py-32">
          
          {/* CỘT TRÁI: Nội dung (Text) */}
          <div className="space-y-8 relative">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 dark:bg-gray-800 dark:border-gray-700 shadow-sm transition-colors duration-300">
             
              <span className="text-blue-600 dark:text-blue-400 text-sm font-bold tracking-wide uppercase">
                {tagline}
              </span>
            </div>

            {/* Title: Sử dụng text-blue-600 để đồng bộ 100% với hệ thống 4 mùa */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-[1.15] tracking-tight">
              {titlePart1} <br className="hidden md:block" />
              <span className="text-blue-600 transition-colors duration-300 relative inline-block">
                {highlightText}
                {/* Đường gạch chân trang trí tự động đổi màu */}
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-600/30 dark:text-blue-400/30" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,15 Q50,0 100,15" fill="currentColor" />
                </svg>
              </span> <br className="hidden md:block" />
              {titlePart2}
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed font-medium">
              {description}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link 
                to={ctaLink} 
                className="group px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold transition-all duration-300 shadow-lg shadow-blue-600/30 hover:-translate-y-1 flex items-center gap-2"
              >
                {ctaText} 
                <i className="ri-arrow-right-up-line transition-transform duration-300 group-hover:rotate-45"></i>
              </Link>
            </div>
          </div>
          
          {/* CỘT PHẢI: Hình ảnh banner & Glassmorphism Card */}
          <div className="relative mt-8 lg:mt-0 flex justify-center lg:justify-end">
            
            {/* Khối chứa ảnh chính */}
            <div className="relative w-full max-w-lg group">
              {/* Hình khối trang trí đằng sau ảnh */}
              <div className="absolute inset-0 bg-blue-600 rounded-[3rem] rotate-3 scale-105 opacity-10 dark:opacity-20 transition-transform duration-500 group-hover:rotate-6"></div>
              
              {/* Ảnh Banner chính */}
              <img 
                src={bannerImage} 
                alt="Banner Trang Chủ" 
                className="relative z-10 w-full h-[400px] lg:h-[500px] object-cover rounded-[2.5rem] shadow-2xl transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-blue-600/20"
              />

              {/* Floating Widget 1: Thẻ kính mờ nổi (Glassmorphism) - Rất hiện đại */}
              <div className="absolute -bottom-6 -left-4 md:-left-10 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/50 dark:border-gray-800/50 p-4 md:p-5 rounded-2xl shadow-xl shadow-blue-900/5 flex items-center gap-4 transition-transform duration-500 hover:-translate-y-2 cursor-default">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-gray-800 flex items-center justify-center shadow-inner">
                  <i className="ri-book-read-fill text-2xl text-blue-600 dark:text-blue-400"></i>
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-lg leading-tight">10,000+</p>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tựa sách hấp dẫn</p>
                </div>
              </div>

              {/* Floating Widget 2: Góc trên bên phải */}
              <div className="absolute top-10 -right-4 md:-right-8 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-white/50 dark:border-gray-700/50 p-3 rounded-2xl shadow-xl shadow-blue-900/5 transition-transform duration-500 hover:scale-105 cursor-default hidden md:block">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <img className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800" src="https://i.pravatar.cc/100?img=1" alt="User 1" />
                    <img className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800" src="https://i.pravatar.cc/100?img=2" alt="User 2" />
                    <img className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800" src="https://i.pravatar.cc/100?img=3" alt="User 3" />
                  </div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white ml-1">
                    Độc giả <br />yêu thích
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroBanner;