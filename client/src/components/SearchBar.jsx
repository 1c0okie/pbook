import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookService } from '../services/book.service';
import { formatPrice } from '../utils/format';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // 1. Kỹ thuật Debounce (Chờ 500ms sau khi ngừng gõ mới gọi API)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim()) {
        setIsLoading(true);
        try {
          // GỌI API ĐÚNG THỨ TỰ CỦA BẠN: (pageNumber, keyword, category)
          const data = await bookService.getAll(1, searchTerm, '');
          setResults(data.books || []);
          setShowDropdown(true);
        } catch (error) {
          console.error('Lỗi tìm kiếm:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // 2. Tắt dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Xử lý khi nhấn Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      setShowDropdown(false);
      // Chuyển URL sang dạng ?keyword=...
      navigate(`/store?keyword=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="relative group w-full" ref={dropdownRef}>
      
      {/* Ô INPUT - CHUẨN CSS CỦA BẠN (Thêm pr-10 để chừa chỗ cho dấu X) */}
      <input 
        type="text" 
        placeholder="Tìm kiếm tên sách, tác giả..." 
        className="w-full pl-12 pr-10 py-3 rounded-full bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 text-gray-900 dark:text-white transition-all outline-none"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (searchTerm) setShowDropdown(true) }}
        autoComplete="off"
      />
      <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-blue-500 transition-colors"></i>

      {/* Nút xóa nhanh (Dấu X) */}
      {searchTerm && (
        <button 
          onClick={() => { setSearchTerm(''); setResults([]); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <i className="ri-close-circle-fill text-lg"></i>
        </button>
      )}

      {/* DROPDOWN KẾT QUẢ TÌM KIẾM */}
      {showDropdown && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl rounded-2xl overflow-hidden z-50 flex flex-col max-h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              <i className="ri-loader-4-line animate-spin inline-block text-blue-600 text-xl align-middle mr-2"></i> Đang tìm kiếm...
            </div>
          ) : results.length > 0 ? (
            <div className="overflow-y-auto custom-scrollbar">
              {results.slice(0, 5).map((book) => ( // Hiện max 5 kết quả
                <Link 
                  key={book._id} 
                  to={`/book/${book._id}`}
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-4 p-4 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <img src={book.imageUrl} alt={book.title} className="w-12 h-16 object-cover rounded shadow-sm border border-gray-200 dark:border-gray-700" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{book.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{book.author?.name || 'Tác giả ẩn danh'}</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">{formatPrice(book.sale_price > 0 ? book.sale_price : book.price)}</p>
                  </div>
                </Link>
              ))}
              
              {/* Nút Xem tất cả */}
              <button 
                onClick={() => {
                  setShowDropdown(false);
                  navigate(`/store?keyword=${encodeURIComponent(searchTerm)}`);
                }}
                className="w-full p-3 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                Xem tất cả kết quả <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Không tìm thấy sách nào chứa từ "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;