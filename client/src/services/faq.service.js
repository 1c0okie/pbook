import api from '../utils/api';

export const faqService = {
  getAll: async () => {
    const response = await api.get('/faqs');
    return response.data;
  },
  getAllForAdmin: async () => {
    const response = await api.get('/faqs?all=true');
    return response.data;
  },
  create: (data) => api.post('/faqs', data),
  update: (id, data) => api.put(`/faqs/${id}`, data),
  delete: (id) => api.delete(`/faqs/${id}`),
  toggleStatus: (id) => api.put(`/faqs/${id}/status`),
};