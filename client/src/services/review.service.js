// src/services/review.service.js
import api from '../utils/api';

export const reviewService = {
    
  // Hàm lấy đánh giá nổi bật cho trang chủ
  getFeaturedReviews: async () => {
    // Gọi đến API bóc tách review mà ta vừa tạo ở Backend
    const response = await api.get('/books/reviews/all');
    return response.data;
  }
};