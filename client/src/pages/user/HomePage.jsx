import React, { useState, useEffect } from 'react';
import { bookService } from '../../services/book.service';
import { authorService } from '../../services/author.service';
import toast from 'react-hot-toast';
import useSettingStore from '../../store/setting.store'; // IMPORT STORE CÀI ĐẶT
import BookCard from '../../components/BookCard';
// Import các UI Components
import HeroBanner from '../../components/HeroBanner';
import TrendingForYou from '../../components/TrendingForYou';
import BrowseAndAuthors from '../../components/BrowseAndAuthors';
import PromoSection from '../../components/PromoSection';
import ServiceSection from '../../components/ServiceSection';
import BestSellerSection from '../../components/BestSellerSection';
import TestimonialSection from '../../components/TestimonialSection';
import BookRow from '../../components/BookRow';
const HomePage = () => {
  // 1. Lấy dữ liệu settings từ Global Store (dữ liệu này đã đồng bộ từ API Settings)
  const { settings } = useSettingStore();

  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await bookService.getAll(1, '', '');
        setBooks(data.books);
      } catch (error) {
        toast.error('Không thể tải dữ liệu sách');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAuthors = async () => {
      try {
        const data = await authorService.getAll();
        setAuthors(data.authors || data || []); 
      } catch (error) {
        toast.error('Không thể tải dữ liệu tác giả');
      }
    };

    fetchBooks();
    fetchAuthors();
  }, []);
  
  // Lọc dữ liệu theo tag
  const trendingBooks = books.filter(book => book.isTrending).slice(0, 10);
  const bestSellerBooks = books.filter(book => book.isBestSeller).slice(0, 10);
  const featuredBooks = books.filter(book => book.isFeatured).slice(0, 5);
  const newArrivalBooks = books.slice(0, 11);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pb-20">
      
      {/* 2. Truyền dữ liệu thật từ settings vào HeroBanner */}
      {/* Thêm optional chaining (?.) để tránh lỗi nếu settings chưa kịp tải */}
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
      
      <ServiceSection />
      <TrendingForYou trendingBooks={trendingBooks} />
      <BrowseAndAuthors browseBooks={featuredBooks} authorsList={authors} />
      <PromoSection />
      <BestSellerSection bestSellerBooks={bestSellerBooks} />
      <BookRow title="Sách Mới Nhất" books={newArrivalBooks} />
      <TestimonialSection />
    </div>
  );
};

export default HomePage;