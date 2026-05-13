import React from 'react';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import UserHeader from './UserHeader';
import UserFooter from './UserFooter';
import CartDrawer from '../../components/CartDrawer'; // IMPORT VÀO ĐÂY
import useWishlistStore from '../../store/wishlist.store';
import useAuthStore from '../../store/auth.store';
const UserLayout = () => {
  const { fetchWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  useEffect(() => {
    if (isAuthenticated) fetchWishlist();
  }, [isAuthenticated]);
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <UserHeader />
      <CartDrawer />
      <main className="flex-grow">
        <Outlet />
      </main>
      <UserFooter />
    </div>
  );
};

export default UserLayout;