import api from '../utils/api';

export const orderService = {
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  getMyOrders: async () => {
    const response = await api.get('/orders/myorders');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  // 2 Hàm dành cho Admin
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  confirmOrder: (id) => api.put(`/orders/${id}/confirm`),
  // Thêm vào order.service.js
  createPaymentLink: async (id) => {
    const response = await api.post(`/orders/${id}/create-payment-link`);
    return response.data;
  }
};