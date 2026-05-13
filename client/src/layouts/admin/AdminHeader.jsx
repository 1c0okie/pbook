import React from 'react';
import useThemeStore from '../../store/theme.store';
import useAuthStore from '../../store/auth.store';
import { useNavigate } from 'react-router-dom';

const AdminHeader = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-8 sticky top-0 z-50 transition-colors duration-300">
      {/* Lời chào Admin - Thêm hiệu ứng màu chủ đề cho tên */}
      <div className="text-gray-800 dark:text-white font-semibold text-lg">
        Chào mừng, <span className="text-blue-600 dark:text-blue-400">{user?.firstname} {user?.lastname}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle - Loại bỏ bg hover, thay bằng text color chủ đề */}
        <button
          onClick={toggleTheme}
          className="p-2 w-10 h-10 rounded-xl text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center"
          title="Đổi giao diện"
        >
          <i className={theme === 'dark' ? 'ri-sun-line text-xl' : 'ri-moon-clear-line text-xl'}></i>
        </button>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

        {/* Nút Đăng xuất - Giữ màu đỏ đặc trưng nhưng bỏ background hover */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors font-bold text-sm"
        >
          <i className="ri-logout-circle-r-line text-lg"></i>
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;