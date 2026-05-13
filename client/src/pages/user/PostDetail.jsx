import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postService } from '../../services/post.service';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const data = await postService.getById(id);
        setPost(data);
        document.title = data.title;
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (isLoading) return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-950">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!post) return <div className="text-center py-20">Bài viết không tồn tại.</div>;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-10 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Nút quay lại */}
        <Link to="/blog" className="inline-flex items-center text-blue-600 font-bold mb-8 hover:gap-2 transition-all">
          <i className="ri-arrow-left-line mr-2"></i> Quay lại Blog
        </Link>

        <article className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Ảnh bìa khổng lồ */}
          <div className="h-[400px] w-full relative">
            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute top-6 left-6 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase">
              {post.category}
            </div>
          </div>

          <div className="p-8 md:p-12">
            {/* Meta data */}
            <div className="flex items-center gap-4 text-gray-400 text-sm mb-6 font-medium">
               <span><i className="ri-calendar-line"></i> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
               <span>•</span>
               <span><i className="ri-user-3-line"></i> Quản trị viên</span>
            </div>

            {/* Tiêu đề */}
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight">
              {post.title}
            </h1>

            {/* Tóm tắt (Summary) */}
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-l-4 border-blue-600 mb-10 italic text-gray-600 dark:text-gray-300 text-lg">
              "{post.summary}"
            </div>

            {/* Nội dung chính */}
            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-loose whitespace-pre-wrap">
               {post.content}
            </div>

            {/* Chân bài viết */}
            <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div className="flex gap-4">
                 <button className="text-gray-400 hover:text-blue-600 text-xl"><i className="ri-facebook-circle-fill"></i></button>
                 <button className="text-gray-400 hover:text-blue-600 text-xl"><i className="ri-twitter-fill"></i></button>
                 <button className="text-gray-400 hover:text-blue-600 text-xl"><i className="ri-share-line"></i></button>
              </div>
              <p className="text-gray-400 text-sm">Cảm ơn bạn đã đọc tin!</p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default PostDetail;