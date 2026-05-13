import React from 'react';
import banner from '../assets/img/banner-all.jpg';

const CategoryBanner = ({ activeCategory, onClearFilter, settings }) => {
  // Hàm helper để render khung ảnh trôi nổi dùng chung
  const renderFloatingImage = (imgSrc, altText, isDefault = false) => (
    <div className="relative order-2 lg:order-1 lg:col-span-5 flex justify-center w-full">
      <div className="relative w-full max-w-md group animate-float">
        {/* Khối trang trí phía sau - chuyển động ngược nhịp một chút */}
        <div className="absolute inset-0 bg-blue-600 rounded-[2.5rem] -rotate-3 scale-105 opacity-10 dark:opacity-20 transition-transform duration-500 group-hover:-rotate-6"></div>
        
        {/* Ảnh Banner chính */}
        <img 
          src={imgSrc} 
          alt={altText} 
          className="relative z-10 w-full h-[320px] lg:h-[420px] object-cover rounded-[2rem] shadow-2xl transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-blue-600/20"
        />

        {/* Các Widget con trôi nổi với độ trễ khác nhau để tạo chiều sâu */}
        {!isDefault && (
          <>
            <div className="absolute -bottom-4 -right-4 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/50 dark:border-gray-800/50 p-3 md:p-4 rounded-xl shadow-xl flex items-center gap-3 transition-transform duration-500 hover:-translate-y-1 cursor-default animate-float-delayed">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-gray-800 flex items-center justify-center shadow-inner">
                <i className="ri-fire-fill text-xl text-orange-500"></i>
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">Thịnh hành</p>
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Chủ đề hấp dẫn</p>
              </div>
            </div>

            <div className="absolute top-8 -left-4 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-white/50 dark:border-gray-700/50 p-3 rounded-xl shadow-xl transition-transform duration-500 hover:scale-105 cursor-default hidden md:block animate-float">
              <div className="text-blue-600 dark:text-blue-400">
                <i className="ri-medal-line text-2xl"></i>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // 1. GIAO DIỆN MẶC ĐỊNH
  if (!activeCategory) {
    return (
      <div className="mb-12 relative bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300 p-6 lg:p-10">
        <div className="absolute inset-0 bg-blue-50/40 dark:bg-blue-900/10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-50 blur-[100px] pointer-events-none transition-colors duration-700"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[500px] h-[500px] rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-40 blur-[80px] pointer-events-none transition-colors duration-700"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {renderFloatingImage(banner, "Tất cả sách", true)}

          <div className="space-y-6 relative order-1 lg:order-2 lg:col-span-7 animate-fade-in lg:pl-4">
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-[1.2] tracking-tight">
              Khám Phá <span className="text-blue-600">Kho Sách</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed font-medium">
              Tìm kiếm những đầu sách phù hợp nhất với bạn từ bộ sưu tập đa dạng của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. GIAO DIỆN KHI CHỌN DANH MỤC
  return (
    <div className="mb-12 relative bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300 p-6 lg:p-10">
      <div className="absolute inset-0 bg-blue-50/40 dark:bg-blue-900/10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-50 blur-[100px] pointer-events-none transition-colors duration-700"></div>
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[500px] h-[500px] rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-40 blur-[80px] pointer-events-none transition-colors duration-700"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {renderFloatingImage(activeCategory.bannerUrl || 'https://placehold.co/800x800?text=CATEGORY', activeCategory.name)}

        <div className="space-y-6 relative order-1 lg:order-2 lg:col-span-7 animate-fade-in lg:pl-4">
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-[1.2] tracking-tight">
            {activeCategory.name}
          </h1>

          {activeCategory.description && (
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed font-medium">
              {activeCategory.description}
            </p>
          )}

          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={onClearFilter}
              className="group px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-base font-bold transition-all duration-300 shadow-lg shadow-blue-600/30 hover:-translate-y-1 flex items-center gap-2"
            >
              <i className="ri-arrow-left-line transition-transform duration-300 group-hover:-translate-x-1"></i>
              Xem tất cả sách
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryBanner;