import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authorService } from '../../services/author.service';
import BookCard from '../../components/BookCard';

const AuthorPage = () => {
  const { id } = useParams(); // Lấy ID tác giả từ URL
  const navigate = useNavigate();
  
  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        setIsLoading(true);
        const data = await authorService.getAuthorDetails(id);
        
        // SỬA Ở ĐÂY: data trả về chính là tác giả, nên setAuthor(data)
        setAuthor(data); 
        // Lấy mảng sách từ bên trong tác giả ra
        setBooks(data.books || []); 
        
        document.title = `${data.name} - Sách và Tiểu sử`;
      } catch (error) {
        toast.error('Không thể tải thông tin tác giả');
        navigate('/store'); 
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchAuthorData();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen pb-16 transition-colors duration-300">
      
      {/* BANNER THÔNG TIN TÁC GIẢ */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 pt-10 pb-16 mb-12 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            
            {/* Avatar Tác giả */}
            <div className="flex-shrink-0">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl relative group">
                <img 
                  src={author?.avatarUrl || 'https://placehold.co/400x400?text=AUTHOR'} 
                  alt={author?.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Chi tiết tiểu sử */}
            <div className="text-center md:text-left flex-1 animate-fade-in mt-4 md:mt-0">
              <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                Tác giả
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                {author?.name}
              </h1>
              
              <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-base md:text-lg max-w-3xl">
                {author?.bio ? (
                  <p>{author.bio}</p>
                ) : (
                  <p className="italic text-gray-400">Tiểu sử của tác giả này đang được chúng tôi cập nhật...</p>
                )}
              </div>
              
              <div className="mt-6 flex items-center justify-center md:justify-start gap-6 text-sm font-bold text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <i className="ri-book-3-fill text-xl text-blue-500"></i>
                  <span>Đã xuất bản: {books.length} tác phẩm</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* DANH SÁCH SÁCH CỦA TÁC GIẢ NÀY */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-blue-600 pl-4">
            Tác phẩm của {author?.name}
          </h2>
        </div>

        {books.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800">
            <i className="ri-quill-pen-line text-6xl text-gray-300 dark:text-gray-600 mb-4 inline-block"></i>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Chưa có tác phẩm nào</h3>
            <p className="text-gray-500 dark:text-gray-400">Hiện tại chúng tôi chưa cập nhật sách của tác giả này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map(book => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AuthorPage;