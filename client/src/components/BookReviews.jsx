import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { bookService } from '../services/book.service';
import toast from 'react-hot-toast';

const BookReviews = ({ book, user, isAuthenticated, onReviewSuccess }) => {
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  
  const [hoverRating, setHoverRating] = useState(0);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  const myExistingReview = book?.reviews?.find(r => r.user === user?._id);
  const currentRating = watch('rating') || 0;

  const onReviewSubmit = async (data) => {
    if (isSubmittingReview) return;

    let isSuccess = false;
    try {
      setIsSubmittingReview(true);
      if (isEditingReview) {
        await bookService.updateReview(book._id, data);
        toast.success('Cập nhật đánh giá thành công!');
        setIsEditingReview(false);
      } else {
        await bookService.createReview(book._id, data);
        toast.success('Cảm ơn bạn đã đánh giá!');
      }
      isSuccess = true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmittingReview(false);
    }

    if (isSuccess) {
      reset();
      setHoverRating(0); 
      onReviewSuccess(); 
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <i key={index} className={index < rating ? "ri-star-fill text-yellow-400" : "ri-star-line text-gray-200 dark:text-gray-700"}></i>
    ));
  };

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <i className="ri-chat-4-fill text-blue-600"></i> 
          Đánh giá
          <span className="text-gray-400 font-medium text-lg ml-1">({book.numReviews})</span>
        </h2>
      </div>

      {/* FORM SECTION */}
      <div className="bg-gray-50/50 dark:bg-gray-800/20 p-5 md:p-8 rounded-[1.5rem] border border-gray-100 dark:border-gray-800">
        <h3 className="text-base font-bold text-gray-700 dark:text-gray-200 mb-5 tracking-wide">
          {isEditingReview ? 'Sửa nhận xét của bạn' : 'Viết nhận xét của bạn'}
        </h3>
        
        {isAuthenticated ? (
          myExistingReview && !isEditingReview ? (
            <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center text-xl">
                  <i className="ri-check-double-line"></i>
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900 dark:text-white">Bạn đã nhận xét quyển sách này</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Cảm ơn bạn đã chia sẻ trải nghiệm.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setValue('rating', myExistingReview.rating);
                  setValue('comment', myExistingReview.comment);
                  setIsEditingReview(true);
                }}
                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                <i className="ri-edit-2-line"></i> Chỉnh sửa
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onReviewSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:flex-col gap-6 items-start">
                
                {/* PHẦN CHỌN SAO INTERACTIVE */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Chất lượng</label>
                  <div className="flex items-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`text-3xl cursor-pointer transition-transform duration-200  ${
                          (hoverRating || currentRating) >= star
                            ? 'ri-star-fill text-yellow-400' 
                            : 'ri-star-line text-gray-300 dark:text-gray-600'
                        }`}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setValue('rating', star, { shouldValidate: true })}
                      ></i>
                    ))}
                  </div>
                  <input type="hidden" {...register('rating', { required: 'Vui lòng đánh giá số sao' })} />
                  {errors.rating && <p className="text-red-500 text-xs mt-2">{errors.rating.message}</p>}
                </div>

                {/* TEXTAREA BÌNH LUẬN */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Bình luận chi tiết</label>
                  <textarea 
                    {...register('comment', { required: 'Vui lòng nhập bình luận' })}
                    rows="3"
                    className="w-full px-5 py-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-base text-gray-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-blue-500/50 transition-shadow custom-scrollbar"
                    placeholder="Chia sẻ cảm nghĩ của bạn về tác phẩm..."
                  ></textarea>
                  {errors.comment && <p className="text-red-500 text-xs mt-2">{errors.comment.message}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                {isEditingReview && (
                  <button type="button" onClick={() => { setIsEditingReview(false); reset(); }} className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-base font-bold rounded-xl transition-colors">
                    Hủy
                  </button>
                )}
                <button type="submit" disabled={isSubmittingReview} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-2">
                  {isSubmittingReview ? <i className="ri-loader-4-line animate-spin text-lg"></i> : <i className="ri-send-plane-fill text-lg"></i>}
                  {isEditingReview ? 'Cập nhật' : 'Gửi Nhận Xét'}
                </button>
              </div>
            </form>
          )
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-0">Vui lòng đăng nhập để gửi nhận xét.</p>
            <Link to="/login" className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-base font-bold rounded-xl transition-transform active:scale-95">
              Đăng nhập ngay
            </Link>
          </div>
        )}
      </div>

      {/* DANH SÁCH BÌNH LUẬN SECTION */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-3">
        {book.reviews.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <i className="ri-chat-off-line text-3xl text-gray-400"></i>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-base">Chưa có nhận xét nào. Hãy là người đầu tiên chia sẻ cảm nghĩ!</p>
          </div>
        ) : (
          book.reviews.map((review) => (
            <div key={review._id} className="group flex gap-5 py-6 border-b border-gray-100 dark:border-gray-800/50 last:border-0">
              {review.avatarUrl ? (
  <img 
    src={review.avatarUrl} 
    alt={review.name} 
    className="flex-shrink-0 w-12 h-12 rounded-full object-cover shadow-inner border border-gray-100 dark:border-gray-800"
  />
) : (
  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-gray-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-lg shadow-inner">
    {review.name.charAt(0).toUpperCase()}
  </div>
)}
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-base text-gray-900 dark:text-white">{review.name}</span>
                    {user && review.user === user._id && (
                      <span className="px-2.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-md uppercase tracking-wide">Bạn</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-400 font-medium">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                
                <div className="flex gap-1 text-sm">
                  {renderStars(review.rating)}
                </div>
                
                <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed pt-1.5">
                  {review.comment}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookReviews;