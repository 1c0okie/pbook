import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

const useCartStore = create((set, get) => ({
  cartItems: JSON.parse(localStorage.getItem('cartItems')) || [],
  isCartOpen: false, // Quản lý trạng thái đóng/mở Drawer

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

  // Thêm vào giỏ
  addToCart: (book, qty = 1) => {
    const currentItems = get().cartItems;
    const existItem = currentItems.find((x) => x.book === book._id);

    let newItems;
    if (existItem) {
      // Nếu đã có trong giỏ, tăng số lượng nhưng không vượt quá tồn kho
      const newQty = existItem.qty + qty;
      if (newQty > book.quantityInStock) {
        toast.error(`Chỉ còn ${book.quantityInStock} cuốn trong kho!`);
        return;
      }
      newItems = currentItems.map((x) =>
        x.book === existItem.book ? { ...x, qty: newQty } : x
      );
    } else {
      // Thêm mới
      newItems = [...currentItems, {
        book: book._id,
        title: book.title,
        imageUrl: book.imageUrl,
        price: book.sale_price > 0 ? book.sale_price : book.price,
        qty: qty,
        countInStock: book.quantityInStock
      }];
    }

    set({ cartItems: newItems, isCartOpen: true }); // Thêm xong tự mở Drawer
    localStorage.setItem('cartItems', JSON.stringify(newItems));
    toast.success('Đã thêm vào giỏ hàng!');
  },

  // Cập nhật số lượng
  updateQuantity: (id, qty) => {
    const currentItems = get().cartItems;
    const item = currentItems.find((x) => x.book === id);
    if (!item) return;

    if (qty > item.countInStock) {
      toast.error(`Chỉ còn ${item.countInStock} cuốn!`);
      return;
    }
    if (qty < 1) return;

    const newItems = currentItems.map((x) =>
      x.book === id ? { ...x, qty } : x
    );
    set({ cartItems: newItems });
    localStorage.setItem('cartItems', JSON.stringify(newItems));
  },

  // Xóa khỏi giỏ
  removeFromCart: (id) => {
    const newItems = get().cartItems.filter((x) => x.book !== id);
    set({ cartItems: newItems });
    localStorage.setItem('cartItems', JSON.stringify(newItems));
  },

  // Xóa toàn bộ giỏ (Dùng sau khi đặt hàng thành công)
  clearCart: () => {
    set({ cartItems: [] });
    localStorage.removeItem('cartItems');
  },

  // Tính tổng tiền
  getCartTotal: () => {
    return get().cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  },

  // Tự động đối chiếu giỏ hàng với Server (Self-healing)
  syncCartWithServer: async () => {
    const items = get().cartItems;
    if (items.length === 0) return;

    try {
      const response = await api.post('/books/sync-cart', { cartItems: items });
      const { syncedCart, hasChanges } = response.data;

      set({ cartItems: syncedCart });
      localStorage.setItem('cartItems', JSON.stringify(syncedCart));

      if (hasChanges) {
        toast('Giỏ hàng của bạn đã được cập nhật lại theo tồn kho/giá thực tế từ hệ thống.', {
          icon: '🔄',
        });
      }
    } catch (error) {
      console.error('Lỗi đồng bộ giỏ hàng', error);
    }
  }
}));

export default useCartStore;