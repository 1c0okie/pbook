import React, { useState, useEffect } from 'react';
import { bookService } from '../../services/book.service';
import { authorService } from '../../services/author.service';
import toast from 'react-hot-toast';
import useSettingStore from '../../store/setting.store'; 
import BookCard from '../../components/BookCard';
import HeroBanner from '../../components/HeroBanner';
import TrendingForYou from '../../components/TrendingForYou';
import BrowseAndAuthors from '../../components/BrowseAndAuthors';
import PromoSection from '../../components/PromoSection';
import ServiceSection from '../../components/ServiceSection';
import BestSellerSection from '../../components/BestSellerSection';
import TestimonialSection from '../../components/TestimonialSection';
import BookRow from '../../components/BookRow';

// 1. ĐỊNH NGHĨA LAYOUT MẶC ĐỊNH PHÒNG KHI DB CHƯA CÓ DỮ LIỆU
const DEFAULT_LAYOUT = ['hero', 'services', 'trending', 'browse', 'promo', 'bestseller', 'new', 'testimonial'];

const HomePage = () => {
  const { settings } = useSettingStore();

  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [booksData, authorsData, trendingData] = await Promise.all([
          bookService.getAll(1, '', ''),
          authorService.getAll(),
          bookService.getTrending() 
        ]);

        setBooks(booksData.books);
        setAuthors(authorsData.authors || authorsData || []);
        setTrendingBooks(trendingData.slice(0, 6)); 
        
      } catch (error) {
        toast.error('Không thể tải dữ liệu trang chủ');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  
  const bestSellerBooks = books.filter(book => book.isBestSeller).slice(0, 10);
  const featuredBooks = books.filter(book => book.isFeatured).slice(0, 6);
  const newArrivalBooks = books.slice(0, 11);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 2. HÀM MAP ID VỚI COMPONENT TƯƠNG ỨNG
  const renderSection = (sectionId) => {
    switch (sectionId) {
      case 'hero':
        return (
          <HeroBanner 
            key="hero"
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
      case 'services': return <ServiceSection key="services" />;
      case 'trending': return <TrendingForYou key="trending" trendingBooks={trendingBooks} />;
      case 'browse': return <BrowseAndAuthors key="browse" browseBooks={featuredBooks} authorsList={authors} />;
      case 'promo': return <PromoSection key="promo" />;
      case 'bestseller': return <BestSellerSection key="bestseller" bestSellerBooks={bestSellerBooks} />;
      case 'new': return <BookRow key="new" title="Sách Mới Nhất" books={newArrivalBooks} />;
      case 'testimonial': return <TestimonialSection key="testimonial" />;
      default: return null;
    }
  };

  // 3. LẤY MẢNG LAYOUT TỪ SETTINGS (NẾU KHÔNG CÓ THÌ DÙNG MẶC ĐỊNH)
  const currentLayout = settings?.homePageLayout?.length > 0 ? settings.homePageLayout : DEFAULT_LAYOUT;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pb-20">
      {/* 4. RENDER ĐỘNG THEO THỨ TỰ CỦA MẢNG */}
      {currentLayout.map(sectionId => renderSection(sectionId))}
    </div>
  );
};

export default HomePage;