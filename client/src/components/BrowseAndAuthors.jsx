import React from 'react';
import { Link } from 'react-router-dom';

// Nhận dữ liệu thật từ component cha (Home) thông qua Props
const BrowseAndAuthors = ({ browseBooks = [], authorsList = [] }) => {

  // Hàm render số sao
  const renderStars = (rating) => {
    const validRating = rating || 5; // Mặc định 5 sao nếu API không có
    return [...Array(5)].map((_, index) => (
      <i key={index} 
         className={`ri-star-fill text-sm ${index < validRating ? 'text-blue-400' : 'text-gray-200 dark:text-gray-700'}`}>
      </i>
    ));
  };

  return (
    <section className="py-10 bg-white dark:bg-gray-950 transition-colors">
      <div className="w-full px-6 md:px-12 lg:px-16 mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-16">
          
          {/* CỘT TRÁI: BROWSE (Danh sách sách) */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">
              Nổi Bật
            </h2>
            
            
            {/* THÊM THANH CUỘN: Giới hạn chiều cao max-h-[600px] và cho phép cuộn dọc */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 max-h-[600px] overflow-y-auto pr-4">
              {browseBooks.length > 0 ? (
                browseBooks.map(book => {
                  // Xử lý an toàn tên tác giả nếu dữ liệu là Object
                  const authorName = typeof book.author === 'object' ? book.author?.name : book.author;

                  return (
                    <Link to={`/book/${book._id}`} key={book._id} className="flex items-center gap-6 cursor-pointer group">
                      
                      {/* ẢNH SÁCH TO HƠN (Từ w-20 tăng lên w-28) */}
                      <div className="w-28 h-40 flex-shrink-0 shadow-md rounded-md overflow-hidden transition-shadow group-hover:shadow-lg">
                        <img src={book.imageUrl || book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                      </div>
                      
                      {/* CHỮ TO HƠN */}
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-base text-gray-500 mt-1.5 mb-2.5 line-clamp-1">{authorName || "Unknown"}</p>
                        <div className="flex gap-1">
                          {renderStars(book.rating)}
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="text-gray-500 dark:text-gray-400">Đang tải danh sách sách...</div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: AUTHORS (Tác giả) */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight pl-6">
              Tác giả nổi bật
            </h2>
            
            {/* THÊM THANH CUỘN ĐỒNG BỘ CHIỀU CAO VỚI BROWSE */}
            <div className="flex flex-col gap-6 max-h-[600px] overflow-y-auto pl-6 pt-1 pb-1">
              {authorsList.length > 0 ? (
                authorsList.map((author, index) => (
                  <Link to={`/author/${author._id}`} key={author._id || index} className="flex items-center gap-4 cursor-pointer group">
                    {/* AVATAR TO HƠN (w-14 h-14) */}
                    <img 
                      src={author.avatarUrl || author.avatar || "https://i.pravatar.cc/150"} 
                      alt={author.name} 
                      className="w-14 h-14 rounded-full object-cover shadow-sm group-hover:ring-2 group-hover:ring-blue-400 transition-all" 
                    />
                    <span className="text-lg font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {author.name}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="text-gray-500 dark:text-gray-400">Đang tải tác giả...</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default BrowseAndAuthors;