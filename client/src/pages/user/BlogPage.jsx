import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../../services/post.service';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await postService.getAll();
        // API đã tự động lọc các bài isActive: true và sắp xếp isPinned lên đầu
        setPosts(data);
      } catch (error) {
        console.error('Lỗi tải bài viết:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-10 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">Blog & Tin Tức</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Cập nhật những thông tin mới nhất về sách, mẹo đọc sách và các thông báo từ hệ thống.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
            <i className="ri-article-line text-6xl text-gray-300 dark:text-gray-600 mb-4 inline-block"></i>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Chưa có bài viết nào</h3>
            <p className="text-gray-500">Chúng tôi sẽ sớm cập nhật các tin tức mới nhất.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <div key={post._id} className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden group hover:shadow-lg transition-all flex flex-col">
                
                {/* Hình ảnh */}
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={post.imageUrl || 'https://placehold.co/800x400?text=TIN+TỨC'} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Nhãn Ghim */}
                  {post.isPinned && (
                    <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <i className="ri-pushpin-fill"></i> Nổi bật
                    </div>
                  )}

                  {/* Nhãn Category */}
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {post.category}
                  </div>
                </div>
                
                {/* Nội dung */}
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-sm text-gray-400 mb-2 font-medium">
                    <i className="ri-calendar-line"></i> {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    <Link to={`/blog/${post._id}`}>{post.title}</Link>
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3 flex-1">
                    {post.summary}
                  </p>
                  
                  <Link to={`/blog/${post._id}`} className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1 mt-auto">
                    Đọc tiếp <i className="ri-arrow-right-s-line"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default BlogPage;