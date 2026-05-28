import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import useSettingStore from '../../store/setting.store';
import { settingService } from '../../services/setting.service';
import { bookService } from '../../services/book.service';
import { authorService } from '../../services/author.service';

// IMPORT COMPONENT THẬT TỪ TRANG CHỦ
import HeroBanner from '../../components/HeroBanner';
import TrendingForYou from '../../components/TrendingForYou';
import BrowseAndAuthors from '../../components/BrowseAndAuthors';
import PromoSection from '../../components/PromoSection';
import ServiceSection from '../../components/ServiceSection';
import BestSellerSection from '../../components/BestSellerSection';
import TestimonialSection from '../../components/TestimonialSection';
import BookRow from '../../components/BookRow';

const SECTION_TITLES = {
  hero: 'Banner Chính (Hero)',
  services: 'Dịch Vụ (Services)',
  trending: 'Sách Xu Hướng',
  browse: 'Khám Phá & Tác Giả',
  promo: 'Banner Khuyến Mãi',
  bestseller: 'Sách Bán Chạy',
  new: 'Sách Mới Nhất',
  testimonial: 'Đánh Giá Khách Hàng'
};

const DEFAULT_LAYOUT = Object.keys(SECTION_TITLES);

const HomePageLayoutManager = () => {
  const { settings, updateLocalSettings } = useSettingStore();
  const [layout, setLayout] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Dữ liệu giả lập
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]); 

  const dragItem = useRef();
  const dragOverItem = useRef();

  useEffect(() => {
    if (settings) {
      setLayout(settings.homePageLayout?.length > 0 ? settings.homePageLayout : DEFAULT_LAYOUT);
    }
  }, [settings]);

  useEffect(() => {
    const fetchPreviewData = async () => {
      try {
        setIsLoadingData(true);
        const [booksData, authorsData, trendingData] = await Promise.all([
          bookService.getAll(1, '', ''),
          authorService.getAll(),
          bookService.getTrending() 
        ]);
        setBooks(booksData.books);
        setAuthors(authorsData.authors || authorsData || []);
        setTrendingBooks(trendingData.slice(0, 6)); 
      } catch (error) {
        toast.error('Không thể tải dữ liệu xem trước');
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchPreviewData();
  }, []);

  const bestSellerBooks = books.filter(book => book.isBestSeller).slice(0, 10);
  const featuredBooks = books.filter(book => book.isFeatured).slice(0, 6);
  const newArrivalBooks = books.slice(0, 11);

  // Render Component thật
  const renderRealComponent = (sectionId) => {
    switch (sectionId) {
      case 'hero':
        return (
          <HeroBanner 
            tagline={settings?.bannerTagline}
            titlePart1={settings?.bannerTitle1}
            highlightText={settings?.bannerHighlight}
            titlePart2={settings?.bannerTitle2}
            description={settings?.bannerDesc}
            bannerImage={settings?.bannerUrl}
            ctaText={settings?.bannerCtaText}
            ctaLink={settings?.bannerCtaLink}
          />
        );
      case 'services': return <ServiceSection />;
      case 'trending': return <TrendingForYou trendingBooks={trendingBooks} />;
      case 'browse': return <BrowseAndAuthors browseBooks={featuredBooks} authorsList={authors} />;
      case 'promo': return <PromoSection />;
      case 'bestseller': return <BestSellerSection bestSellerBooks={bestSellerBooks} />;
      case 'new': return <BookRow title="Sách Mới Nhất" books={newArrivalBooks} />;
      case 'testimonial': return <TestimonialSection />;
      default: return null;
    }
  };

  // Logic Kéo thả (Drag & Drop)
  const handleDragStart = (e, position) => {
    dragItem.current = position;
    e.currentTarget.style.opacity = '0.5';
    e.currentTarget.style.transform = 'scale(0.98)';
  };

  const handleDragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    e.currentTarget.style.transform = 'scale(1)';
    
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const newLayout = [...layout];
      const draggedItemContent = newLayout[dragItem.current];
      
      newLayout.splice(dragItem.current, 1);
      newLayout.splice(dragOverItem.current, 0, draggedItemContent);
      setLayout(newLayout);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updatedSettings = await settingService.updateSettings({ homePageLayout: layout });
      updateLocalSettings(updatedSettings);
      toast.success('Lưu cấu trúc trang chủ thành công!');
    } catch (error) {
      toast.error('Lỗi khi lưu cấu trúc');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 max-w-6xl mx-auto pb-24">
      
      {/* TIÊU ĐỀ TRANG (Đã bỏ dính sticky và nút lưu đi kèm) */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Live Editor Trang Chủ</h2>
        <p className="text-gray-500 text-sm mt-1">Kéo thả các thẻ dưới đây để đổi vị trí. Giao diện xem trước đã được thu nhỏ 50% để dễ thao tác.</p>
      </div>

      {/* DANH SÁCH COMPONENT THU NHỎ */}
      <div className="space-y-4">
        {layout.map((id, index) => (
          <div
            key={id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className="flex bg-white dark:bg-gray-900 rounded-3xl shadow-sm border-2 border-gray-200 dark:border-gray-800 hover:border-blue-500 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing overflow-hidden h-[180px] group"
          >
            {/* CỘT TRÁI */}
            <div className="w-48 bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center p-4 border-r border-gray-200 dark:border-gray-800 transition-colors group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20">
              <i className="ri-draggable text-4xl text-gray-400 group-hover:text-blue-500 transition-colors mb-2"></i>
              <span className="font-bold text-center text-sm dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {SECTION_TITLES[id]}
              </span>
              <span className="mt-2 text-xs bg-white dark:bg-gray-900 px-3 py-1 rounded-full text-gray-500 font-bold shadow-sm border border-gray-100 dark:border-gray-700">
                Vị trí {index + 1}
              </span>
            </div>

            {/* CỘT PHẢI */}
            <div className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-gray-950 pointer-events-none select-none">
              <div
                className="absolute top-0 left-0"
                style={{
                  width: '200%', 
                  transform: 'scale(0.5)',
                  transformOrigin: 'top left'
                }}
              >
                {renderRealComponent(id)}
              </div>
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
            </div>
          </div>
        ))}
      </div>

      {/* NÚT LƯU NỔI (FLOATING ACTION BUTTON - FAB)
        Nằm cố định ở góc dưới cùng bên phải màn hình 
      */}
      <button 
        onClick={handleSave}
        disabled={isSaving}
        className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full transition-all flex items-center gap-3 hover:-translate-y-1 disabled:opacity-25 disabled:hover:translate-y-0"
      >
        {isSaving ? (
          <i className="ri-loader-4-line animate-spin text-xl"></i>
        ) : (
          <i className="ri-save-3-line text-xl"></i>
        )}
        <span className="text-lg">Lưu Layout</span>
      </button>

    </div>
  );
};

export default HomePageLayoutManager;