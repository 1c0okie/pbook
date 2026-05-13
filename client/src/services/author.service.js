import api from '../utils/api';

export const authorService = {
  
  getAuthorDetails: async (id) => {
    const response = await api.get(`/authors/${id}`);
    return response.data; // Dữ liệu trả về sẽ có dạng { author: {...}, books: [...] }
  },
  getAll: async () => {
    const response = await api.get('/authors');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/authors', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/authors/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/authors/${id}`);
    return response.data;
  }
};