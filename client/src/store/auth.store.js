import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('user'),
  isLoading: false,

  setAuth: (userData) => {
    set({ user: userData, isAuthenticated: true });
    localStorage.setItem('user', JSON.stringify(userData));
    return userData; // TRẢ VỀ DATA ĐỂ BÊN GIAO DIỆN XỬ LÝ CHUYỂN HƯỚNG
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      const userData = response.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, isAuthenticated: true, isLoading: false });
      
      toast.success('Đăng nhập thành công!');
      return userData; // TRẢ VỀ DATA ĐỂ BÊN GIAO DIỆN XỬ LÝ CHUYỂN HƯỚNG
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Lỗi đăng nhập!');
      throw error; 
    }
  },

  register: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/register', userData);
      localStorage.setItem('user', JSON.stringify(response.data));
      set({ user: response.data, isAuthenticated: true, isLoading: false });
      toast.success('Đăng ký tài khoản thành công!');
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Lỗi đăng ký!');
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
    toast.success('Đã đăng xuất!');
  },

  updateUserContext: (newData) => set((state) => {
    if (!state.user) return state;
    const updatedUser = { ...state.user, ...newData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return { user: updatedUser };
  }),

  updateUserAddresses: (newAddresses) => set((state) => {
    if (!state.user) return state; 
    const updatedUser = { ...state.user, addresses: newAddresses };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return { user: updatedUser };
  }),
}));

export default useAuthStore;