import api from '../utils/api';

export const postService = {
  getAll: async () => {
    const response = await api.get('/posts');
    return response.data;
  },
  // THÊM HÀM NÀY CHO ADMIN:
  getAllForAdmin: async () => {
    const response = await api.get('/posts?all=true');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/posts', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/posts/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
  toggleStatus: async (id) => {
    const response = await api.put(`/posts/${id}/status`);
    return response.data;
  },
  togglePin: async (id) => {
    const response = await api.put(`/posts/${id}/pin`);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  }
};