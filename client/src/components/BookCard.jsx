import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/format';
import useWishlistStore from '../store/wishlist.store';
import useCartStore from '../store/cart.store';
import useAuthStore from '../store/auth.store';
import toast from 'react-hot-toast';

const BookCard = ({ book }) => {
  const navigate = useNavigate();
  
  // Gọi các Store
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // Kiểm tra wishlist
  const isLiked = wishlist.some(item => item._id === book._id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return toast.error('Vui lòng đăng nhập để lưu sách!');
    toggleWishlist(book);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(book, 1);
  };

  const handleViewDetails = (e) => {
    e.preventDefault();
    navigate(`/book/${book._id}`);
  };

  return (
    <div className="relative text-center bg-white dark:bg-gray-800 p-5 overflow-hidden border-2 border-gray-100 dark:border-gray-700 rounded-[1.5rem] flex flex-col h-full box-border transition-all duration-500 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-blue-600/10 hover:-translate-y-1 group">

      {/* --- BADGES (Top Left) --- */}
      <div className="absolute top-5 left-5 flex flex-col gap-2 z-20">
        {book.quantityInStock <= 0 && (
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wide bg-red-500 text-white rounded-lg shadow-sm">Hết hàng</span>
        )}
        {book.isTrending && book.quantityInStock > 0 && (
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wide bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg shadow-sm">Hot</span>
        )}
        {book.sale_price > 0 && (
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wide bg-blue-600 text-white rounded-lg shadow-sm">Sale</span>
        )}
      </div>

      {/* --- MENU ACTIONS (Slide-in từ Top Right) --- */}
      <div className="absolute top-5 -right-16 flex flex-col gap-2 transition-all duration-500 group-hover:right-5 z-30">
        
        {/* Nút Xem Chi tiết */}
        <button 
          onClick={handleViewDetails} 
          className="h-10 w-10 bg-white/95 dark:bg-gray-700/95 backdrop-blur-sm shadow-md border border-gray-100 dark:border-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-blue-600 hover:border-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all" 
          title="Xem chi tiết"
        >
          <i className="ri-eye-line text-lg"></i>
        </button>
        
        {/* Nút Wishlist */}
        <button 
          onClick={handleWishlistClick} 
          className="h-10 w-10 bg-white/95 dark:bg-gray-700/95 backdrop-blur-sm shadow-md border border-gray-100 dark:border-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all" 
          title="Yêu thích"
        >
          <i className={isLiked ? "ri-heart-3-fill text-red-500 scale-110 transition-transform" : "ri-heart-3-line text-lg"}></i>
        </button>

        {/* Nút Giỏ Hàng */}
        <button 
          onClick={handleAddToCart} 
          disabled={book.quantityInStock <= 0} 
          className="h-10 w-10 bg-white/95 dark:bg-gray-700/95 backdrop-blur-sm shadow-md border border-gray-100 dark:border-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-blue-600 hover:border-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
          title="Thêm vào giỏ"
        >
          <i className="ri-shopping-cart-2-line text-lg"></i>
        </button>
      </div>

      {/* --- HÌNH ẢNH SÁCH --- */}
      {/* Nền trong suốt trùng với card, ảnh object-contain vừa sát vào khung, bỏ rotate */}
      <Link 
        to={`/book/${book._id}`} 
        className="block shrink-0 relative w-full h-[220px] mb-5 flex items-center justify-center"
      >
        <img 
          src={book.imageUrl || 'https://placehold.co/150x220/png'} 
          alt={book.title} 
          className="w-full h-full object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105 z-10" 
        />
      </Link>

      {/* --- THÔNG TIN CHI TIẾT --- */}
      <div className="flex flex-col flex-1 px-1">
        
        {/* 1. Tên sách (Đưa lên đầu) */}
        <Link 
          to={`/book/${book._id}`} 
          className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 min-h-[3rem] leading-snug mb-1 hover:text-blue-600 transition-colors"
        >
          {book.title}
        </Link>

        {/* 2. Tác giả */}
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">
          {book.author?.name || 'Tác giả ẩn danh'}
        </div>

        {/* 3. Lượt bán và Số sao (Trên cùng 1 dòng) */}
        <div className="flex items-center justify-center gap-3 mb-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
          {/* Số sao */}
          <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded-full">
            <i className="ri-star-fill text-yellow-500 text-[10px]"></i>
            <span className="text-yellow-700 dark:text-yellow-300">
              {book.rating ? book.rating.toFixed(1) : '0.0'}
            </span>
          </div>
          
          {/* Ngăn cách bằng dấu chấm nhỏ nếu muốn */}
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>

          {/* Lượt bán (Giả định trường dữ liệu là book.sold hoặc book.soldCount) */}
          <div className="flex items-center gap-1">
            <span className="text-gray-500 dark:text-gray-400">Đã bán:</span>
            <span className="text-gray-900 dark:text-white font-bold">
              {book.soldCount || book.sold || 0}
            </span>
          </div>
        </div>

        {/* 4. Giá tiền (Ép xuống đáy bằng mt-auto) */}
        <div className="flex justify-center items-end gap-2 mt-auto">
          <span className="text-xl font-black text-blue-600 dark:text-blue-400">
            {formatPrice(book.sale_price > 0 ? book.sale_price : book.price)}
          </span>
          {book.sale_price > 0 && (
            <span className="text-sm font-medium text-gray-400 line-through mb-[2px]">
              {formatPrice(book.price)}
            </span>
          )}
        </div>

</div>
    </div>
  );
};

export default BookCard;