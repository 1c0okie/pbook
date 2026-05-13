import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';
const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('user'),
  isLoading: false,

  // Hàm để lưu thông tin sau khi đăng nhập (Dùng cho cả Google và Login thường)
  setAuth: (userData) => {
    set({ user: userData, isAuthenticated: true });
    localStorage.setItem('user', JSON.stringify(userData)); // Lưu lại để F5 không mất
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(response.data));
      set({ user: response.data, isAuthenticated: true, isLoading: false });
      toast.success('Đăng nhập thành công!');
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Lỗi đăng nhập!');
      throw error; // Ném lỗi để UI xử lý thêm nếu cần
    }
  },

  register: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/register', userData);
      localStorage.setItem('user', JSON.stringify(response.data));
      set({ user: response.data, isAuthenticated: true, isLoading: false });
      toast.success('Đăng ký tài khoản thành công!');
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
  // Thêm hàm này vào bên trong store auth
 updateUserContext: (newData) => set((state) => {
    if (!state.user) return state;

    // Gộp dữ liệu cũ (có Token) với dữ liệu mới (có Avatar mới)
    const updatedUser = { ...state.user, ...newData };

    // Lưu lại vào LocalStorage để F5 không bị mất
    localStorage.setItem('user', JSON.stringify(updatedUser));

    return { user: updatedUser };
  }),
  updateUserAddresses: (newAddresses) => set((state) => {
    if (!state.user) return state; // Nếu chưa đăng nhập thì bỏ qua
    
    // Cập nhật mảng addresses mới vào user hiện tại
    const updatedUser = { ...state.user, addresses: newAddresses };
    
    // Lưu lại vào localStorage để không bị mất khi F5
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Cập nhật lại state
    return { user: updatedUser };
  }),
}));

export default useAuthStore;