import api from '../utils/api';

export const contactService = {
  send: (data) => api.post('/contacts', data),
  getAll: async () => {
    const response = await api.get('/contacts');
    return response.data;
  },
  delete: (id) => api.delete(`/contacts/${id}`),
  markRead: (id) => api.put(`/contacts/${id}`),
};