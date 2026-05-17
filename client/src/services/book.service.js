import api from '../utils/api';

export const bookService = {
  // Lấy sách có hỗ trợ phân trang và tìm kiếm
  getAll: async (pageNumber = 1, keyword = '', category = '') => {
    const response = await api.get(`/books?pageNumber=${pageNumber}&keyword=${keyword}&category=${category}`);
    return response.data; // Trả về object: { books, page, pages, total }
  },
  getById: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/books', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/books/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/books/${id}`);
    return response.data;
  },
  createReview: async (id, reviewData) => {
      const response = await api.post(`/books/${id}/reviews`, reviewData);
      return response.data;
    },
  updateReview: async (id, reviewData) => {
      const response = await api.put(`/books/${id}/reviews`, reviewData);
      return response.data;
    },
  getTrending: async () => {
    // Gọi API /api/v1/books/trending (bạn điều chỉnh lại URL cho khớp với Backend của bạn)
    const response = await api.get('/books/trending'); 
    return response.data;
  }
};