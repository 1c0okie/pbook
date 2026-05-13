import React, { useState, useEffect } from 'react';
import BookCard from '../../components/BookCard';
import { bookService } from '../../services/book.service';
import { categoryService } from '../../services/category.service';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import CategoryBanner from '../../components/CategoryBanner';

const StorePage = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchParams] = useSearchParams();
  
  // Lấy từ khóa từ URL (do Header truyền sang)
  const searchKeyword = searchParams.get('keyword') || '';
  
  // States cho filter và pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Khởi tạo keyword local bằng từ khóa trên URL
  const [keyword, setKeyword] = useState(searchKeyword);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);

  // Đồng bộ ô search local nếu người dùng tìm kiếm từ Header khi đang ở trang Store
  useEffect(() => {
    setKeyword(searchKeyword);
    setPage(1); // Reset về trang 1 khi có từ khóa mới
  }, [searchKeyword]);

  // Load danh mục 1 lần khi vào trang
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (error) {
        toast.error('Lỗi khi tải danh mục');
      }
    };
    fetchCategories();
  }, []);

  // Load sách mỗi khi page, keyword hoặc category thay đổi
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        // Gọi API đúng thứ tự: page, keyword, category
        const data = await bookService.getAll(page, keyword, selectedCategory);
        setBooks(data.books);
        setPage(data.page);
        setTotalPages(data.pages);
      } catch (error) {
        toast.error('Lỗi khi tải danh sách sách');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Tạo hiệu ứng debounce đơn giản cho việc search
    const delayDebounceFn = setTimeout(() => {
      fetchBooks();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [page, keyword, selectedCategory]);

  // TÌM DANH MỤC ĐANG ĐƯỢC CHỌN ĐỂ HIỂN THỊ BANNER
  const activeCategory = categories.find(cat => cat._id === selectedCategory);

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-10 transition-colors duration-300">
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TIÊU ĐỀ TRANG / BANNER DANH MỤC */}
       <CategoryBanner 
          activeCategory={activeCategory} 
          onClearFilter={() => { setSelectedCategory(''); setPage(1); }} 
        />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* CỘT TRÁI: Bộ lọc (Sidebar) */}
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-28">
              
              {/* Search Box */}
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <i className="ri-search-line text-blue-600"></i> Tìm kiếm
                </h3>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={keyword}
                    onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                    placeholder="Nhập tên sách..." 
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-950 text-gray-900 dark:text-white transition-all outline-none"
                  />
                  {keyword && (
                    <button 
                      onClick={() => { setKeyword(''); setPage(1); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <i className="ri-close-circle-fill"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Lọc theo Danh mục */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <i className="ri-list-check text-blue-600"></i> Danh mục
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => { setSelectedCategory(''); setPage(1); }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition-colors ${selectedCategory === '' ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-600/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    Tất cả sách
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat._id}
                      onClick={() => { setSelectedCategory(cat._id); setPage(1); }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl transition-colors ${selectedCategory === cat._id ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-600/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Lưới sản phẩm */}
          <div className="lg:w-3/4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : books.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800">
                <i className="ri-book-3-line text-6xl text-gray-300 dark:text-gray-600 mb-4 inline-block"></i>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Không tìm thấy sách</h3>
                <p className="text-gray-500 dark:text-gray-400">Vui lòng thử từ khóa khác hoặc xóa bộ lọc.</p>
                <button 
                  onClick={() => { setKeyword(''); setSelectedCategory(''); setPage(1); }}
                  className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {books.map(book => (
                    <BookCard key={book._id} book={book} />
                  ))}
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12">
                    <button 
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      <i className="ri-arrow-left-s-line"></i> Trước
                    </button>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Trang {page} / {totalPages}</span>
                    <button 
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      Sau <i className="ri-arrow-right-s-line"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorePage;