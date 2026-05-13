import api from '../utils/api';

export const userService = {
  // Lấy toàn bộ danh sách users
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  // Xóa user
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Cập nhật quyền (Role)
  updateUserRole: async (id, isAdmin) => {
    const response = await api.put(`/users/${id}/role`, { isAdmin });
    return response.data;
  },
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },
  updatePassword: async (passwordData) => {
    const response = await api.put('/users/password', passwordData);
    return response.data;
  },
  addAddress: async (data) => {
    const response = await api.post('/users/addresses', data);
    return response.data;
  },
  updateAddress: async (id, data) => {
    const response = await api.put(`/users/addresses/${id}`, data);
    return response.data;
  },
  deleteAddress: async (id) => {
    const response = await api.delete(`/users/addresses/${id}`);
    return response.data;
  },
  setDefaultAddress: async (id) => {
    const response = await api.put(`/users/addresses/${id}/default`);
    return response.data;
  },
  forgotPassword: async (email) => {
    const res = await api.post('/users/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (token, password) => {
    const res = await api.put(`/users/reset-password/${token}`, { password });
    return res.data;
  }
};