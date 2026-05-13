import api from '../utils/api';

export const couponService = {
  verify: async (code) => {
    const response = await api.post('/coupons/verify', { code });
    return response.data;
  },
  
  // Các hàm dành cho Admin
  getAll: async () => {
    const response = await api.get('/coupons');
    return response.data;
  },
  create: async (couponData) => {
    const response = await api.post('/coupons', couponData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  },
  toggleStatus: async (id) => {
    const response = await api.put(`/coupons/${id}/status`);
    return response.data;
  }
};