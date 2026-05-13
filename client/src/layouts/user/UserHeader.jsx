import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useThemeStore from '../../store/theme.store';
import useAuthStore from '../../store/auth.store';
import useCartStore from '../../store/cart.store';
import useWishlistStore from '../../store/wishlist.store';
import SearchBar from '../../components/SearchBar';
import useSettingStore from '../../store/setting.store';

const UserHeader = () => {
  const { settings } = useSettingStore();
  const { theme, toggleTheme } = useThemeStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cartItems, toggleCart } = useCartStore();
  const navigate = useNavigate();
  const { wishlist } = useWishlistStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={settings?.logoUrl || 'https://placehold.co/150x50?text=LOGO'} 
              alt={settings?.siteTitle || 'Logo'} 
              className="h-8 object-contain pl-2" 
            />
          </Link>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-xl mx-8">
            <SearchBar />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Theme Toggle - Thay đổi hover background sang hover text color */}
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <i className={theme === 'dark' ? 'ri-sun-line text-xl' : 'ri-moon-clear-line text-xl'}></i>
            </button>

            {/* Wishlist Icon - Thay đổi hover background sang hover text color */}
            <Link to="/wishlist" className="relative p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <i className="ri-heart-3-line text-xl"></i>
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Toggle - Thay đổi hover background sang hover text color */}
            <button 
              onClick={toggleCart} 
              className="relative p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <i className="ri-shopping-cart-2-line text-xl"></i>
              {cartItems.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 animate-pulse">
                  {cartItems.reduce((a, c) => a + c.qty, 0)}
                </span>
              )}
            </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

            {/* User Auth */}
            {isAuthenticated ? (
              <div className="relative group cursor-pointer">
                <div className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full border border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-400 transition-colors">
                  <div className="h-8 w-8 rounded-full overflow-hidden">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                        {user?.firstname?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block group-hover:text-blue-600 transition-colors">{user?.firstname}</span>
                </div>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                  <div className="p-2 space-y-1">
                    {user?.isAdmin && (
                      <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">
                        <i className="ri-dashboard-line mr-2"></i>Quản trị Admin
                      </Link>
                    )}
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">
                      <i className="ri-user-settings-line mr-2"></i>Hồ sơ cá nhân
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                      <i className="ri-logout-circle-r-line mr-2"></i>Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;