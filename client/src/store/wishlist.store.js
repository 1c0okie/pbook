import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

const useWishlistStore = create((set, get) => ({
  wishlist: [],
  isLoading: false,
  isToggling: false, // Thêm cờ chống click đúp

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/users/wishlist');
      set({ wishlist: data });
    } catch (error) {
      console.error('Lỗi tải tủ sách', error);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (book) => {
    // 1. NGĂN CHẶN CLICK ĐÚP LIÊN TỤC
    if (get().isToggling) return;
    set({ isToggling: true });

    const currentWishlist = get().wishlist;
    const isExist = currentWishlist.find(item => item._id === book._id);

    // 2. CẬP NHẬT GIAO DIỆN NGAY LẬP TỨC VÀ CHỈ HIỆN TOAST 1 LẦN
    if (isExist) {
      set({ wishlist: currentWishlist.filter(item => item._id !== book._id) });
      toast.success('Đã xóa khỏi Tủ sách');
    } else {
      set({ wishlist: [...currentWishlist, book] });
      toast.success('Đã thêm vào Tủ sách');
    }

    // 3. GỌI API CHẠY NGẦM
    try {
      await api.post('/users/wishlist/toggle', { bookId: book._id });
    } catch (error) {
      // NẾU API LỖI -> Rollback (trả lại data cũ) và báo lỗi
      toast.error('Lỗi đồng bộ với máy chủ');
      set({ wishlist: currentWishlist }); 
    } finally {
      // XONG XUÔI MỚI MỞ KHÓA CHO PHÉP CLICK TIẾP
      set({ isToggling: false });
    }
  }
}));

export default useWishlistStore;