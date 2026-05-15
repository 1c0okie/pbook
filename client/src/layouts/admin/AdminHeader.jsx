import React, { useState, useEffect } from 'react';
import useThemeStore from '../../store/theme.store';
import useAuthStore from '../../store/auth.store';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

const AdminHeader = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation(); // Lấy đường dẫn hiện tại để biết đang ở trang nào
  const [searchParams, setSearchParams] = useSearchParams();

  // Khởi tạo state nội bộ lấy từ URL (nếu có f5 lại trang vẫn giữ nguyên từ khóa)
  const [localSearch, setLocalSearch] = useState(searchParams.get('q') || '');

  // Xóa từ khóa khi chuyển sang trang khác
  useEffect(() => {
    setLocalSearch(searchParams.get('q') || '');
  }, [location.pathname, searchParams]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Hàm xử lý khi gõ tìm kiếm -> Đẩy lên URL
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);

    // Cập nhật tham số ?q=... trên URL mà không làm tải lại trang
    if (value.trim()) {
      searchParams.set('q', value);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams, { replace: true });
  };

  // Logic xác định Placeholder dựa vào đường dẫn hiện tại
  let searchPlaceholder = '';
  let showSearch = true;

  if (location.pathname.includes('/admin/users')) {
    searchPlaceholder = 'Tìm kiếm người dùng (tên, email)...';
  } else if (location.pathname.includes('/admin/orders')) {
    searchPlaceholder = 'Tìm kiếm đơn hàng (mã, tên, SĐT)...';
  } else if (location.pathname.includes('/admin/books')) {
    searchPlaceholder = 'Tìm kiếm sách...';
  } else if (location.pathname.includes('/admin/authors')) {
    searchPlaceholder = 'Tìm kiếm tác giả...';
  } else if (location.pathname.includes('/admin/categories')) {
    searchPlaceholder = 'Tìm kiếm danh mục...';
  } else if (location.pathname.includes('/admin/coupons')) {
    searchPlaceholder = 'Tìm kiếm mã giảm giá...';
  } else {
    showSearch = false; // Ẩn ô tìm kiếm nếu đang ở trang Dashboard tổng quan
  }

  return (
    <header className="h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-8 sticky top-0 z-50 transition-colors duration-300">
      
      {/* Lời chào Admin */}
      <div className="text-gray-800 dark:text-white font-semibold text-lg hidden md:block whitespace-nowrap">
        Chào mừng, <span className="text-blue-600 dark:text-blue-400">{user?.firstname} {user?.lastname}</span>
      </div>

      {/* Ô TÌM KIẾM ĐỘNG THEO TRANG */}
      {showSearch && (
        <div className="flex-1 max-w-md mx-6 transition-all animate-fade-in">
          <div className="relative w-full">
            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-10 py-3 rounded-full bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 text-gray-900 dark:text-white transition-all outline-none"
            />
            {localSearch && (
              <button 
                onClick={() => handleSearchChange({ target: { value: '' } })} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <i className="ri-close-line"></i>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 w-10 h-10 rounded-xl text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center shrink-0"
          title="Đổi giao diện"
        >
          <i className={theme === 'dark' ? 'ri-sun-line text-xl' : 'ri-moon-clear-line text-xl'}></i>
        </button>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>

        {/* Nút Đăng xuất */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors font-bold text-sm shrink-0"
        >
          <i className="ri-logout-circle-r-line text-lg"></i>
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;