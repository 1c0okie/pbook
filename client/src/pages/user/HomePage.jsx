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

const HomePage = () => {
  const { settings } = useSettingStore();

  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  
  // 1. TẠO THÊM STATE ĐỂ CHỨA DỮ LIỆU TRENDING RIÊNG
  const [trendingBooks, setTrendingBooks] = useState([]); 
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // 2. GỌI API SONG SONG ĐỂ TỐI ƯU TỐC ĐỘ TẢI TRANG
        const [booksData, authorsData, trendingData] = await Promise.all([
          bookService.getAll(1, '', ''),
          authorService.getAll(),
          bookService.getTrending() // Gọi API lấy sách trending kèm avatar người mua
        ]);

        setBooks(booksData.books);
        setAuthors(authorsData.authors || authorsData || []);
        
        // Cắt lấy 6 cuốn trending đưa vào state
        setTrendingBooks(trendingData.slice(0, 6)); 
        
      } catch (error) {
        toast.error('Không thể tải dữ liệu trang chủ');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // 3. XÓA DÒNG LỌC TRENDING CŨ ĐI
  // const trendingBooks = books.filter(book => book.isTrending).slice(0, 10);
  
  // Các phần lọc khác giữ nguyên
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

  return (
    <div className="bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pb-20">
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
      
      {/* 4. Truyền state trendingBooks (đã có sẵn trường buyers) xuống component */}
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