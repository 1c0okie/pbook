import React from 'react';
import { Link } from 'react-router-dom';
import BookCard from './BookCard';

const BestSellerSection = ({ bestSellerBooks }) => {
  if (!bestSellerBooks || bestSellerBooks.length === 0) return null;

  // SẮP XẾP LẠI THEO LƯỢT BÁN GIẢM DẦN (Dựa vào trường 'sold')
  // Dùng [...bestSellerBooks] để copy mảng, tránh làm thay đổi state gốc của React
  const sortedBooks = [...bestSellerBooks].sort((a, b) => (b.sold || 0) - (a.sold || 0));

  // Lấy cuốn đầu tiên (Đã được sắp xếp bán nhiều nhất) làm Top 1
  const top1Book = sortedBooks[0];
  
  // Lấy tối đa 8 cuốn tiếp theo
  const remainingBooks = sortedBooks.slice(1, 9);

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-10 transition-colors duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end mb-10">
        <div>
         <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Bán Chạy Nhất <i className="ri-fire-fill text-blue-600 drop-shadow-md"></i>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Được độc giả đánh giá cao và đặt mua nhiều nhất</p>
        </div>
        <Link to="/store" className="group text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 transition-colors hidden sm:flex items-center gap-1">
          Xem tất cả <i className="ri-arrow-right-s-line transition-transform group-hover:translate-x-1"></i>
        </Link>
      </div>
      
      {/* GRID BỐ CỤC (1 TO - NHIỀU NHỎ) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* ======================================= */}
        {/* CỘT TRÁI: TOP 1 SÁCH TO (Chiếm 4/12 cột) */}
        {/* ======================================= */}
        <div className="lg:col-span-4 lg:h-full">
          <div className="group h-full bg-blue-50 dark:bg-gray-900 rounded-[2.5rem] p-8 lg:p-10 border border-blue-100 dark:border-gray-800 shadow-sm relative flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/10 hover:-translate-y-1">
            
            {/* Mảng màu mờ trang trí đằng sau */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-blue-200 dark:bg-blue-900/40 opacity-50 blur-3xl pointer-events-none transition-colors duration-500"></div>

            {/* Huy hiệu Top 1 */}
            <div className="absolute top-6 left-6 z-20">
              <span className="flex items-center justify-center bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 font-black text-xl w-14 h-14 rounded-full shadow-lg shadow-yellow-500/30 rotate-12 group-hover:rotate-0 transition-transform duration-300">
                #1
              </span>
            </div>

            {/* Hình ảnh sách (Phóng to) */}
            <div className="relative z-10 flex-1 flex items-center justify-center mt-10 mb-8">
              <Link to={`/book/${top1Book._id}`} className="block">
                <img 
                  // Hỗ trợ nhiều tên trường ảnh tùy theo backend của bạn
                  src={top1Book.imageUrl || top1Book.image || top1Book.coverImage || "https://placehold.co/300x450?text=Book"} 
                  alt={top1Book.title} 
                  className="w-48 md:w-56 lg:w-64 object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3"
                />
              </Link>
            </div>

            {/* Thông tin sách */}
            <div className="relative z-10 text-center space-y-3 bg-white/60 dark:bg-gray-950/60 backdrop-blur-md p-6 rounded-3xl border border-white/50 dark:border-gray-800/50">
              <div className="inline-block px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-xs font-bold text-blue-600 dark:text-blue-400 mb-2">
                Bán chạy nhất tuần
                {/* Tùy chọn: Hiển thị thêm số lượng bán ra */}
                {top1Book.sold > 0 && <span className="ml-1 text-gray-500 dark:text-gray-400">({top1Book.sold} đã bán)</span>}
              </div>
              <Link to={`/book/${top1Book._id}`}>
                <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 transition-colors">
                  {top1Book.title}
                </h3>
              </Link>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                {top1Book.author?.name || top1Book.author || "Đang cập nhật"}
              </p>
              
              {/* Nút Action */}
              <div className="pt-2">
                <Link 
                  to={`/book/${top1Book._id}`} 
                  className="inline-block w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:-translate-y-1"
                >
                  Mua Ngay <i className="ri-shopping-cart-2-line ml-1"></i>
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* ======================================= */}
        {/* CỘT PHẢI: CÁC SÁCH CÒN LẠI (Chiếm 8/12 cột) */}
        {/* ======================================= */}
        <div className="lg:col-span-8 flex flex-col justify-center">
          {/* Lưới chia 2 hàng: mobile 2 cột, tablet 3 cột, PC 4 cột */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {remainingBooks.map(book => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default BestSellerSection;