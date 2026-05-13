import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import useThemeStore from './store/theme.store';
import AdminLayout from './layouts/admin/AdminLayout';
import CategoryManager from './pages/admin/CategoryManager';
import AuthorManager from './pages/admin/AuthorManager';
import BookManager from './pages/admin/BookManager';
import UserLayout from './layouts/user/UserLayout';
import HomePage from './pages/user/HomePage';
import StorePage from './pages/user/StorePage';
import BookDetails from './pages/user/BookDetails';
import Checkout from './pages/user/Checkout';
import Profile from './pages/user/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrderManager from './pages/admin/OrderManager';
import Wishlist from './pages/user/Wishlist';
import UserManager from './pages/admin/UserManager';
import CouponManager from './pages/admin/CouponManager';
import SettingManager from './pages/admin/SettingManager';
import AuthorPage from './pages/user/AuthorPage';
import useSettingStore from './store/setting.store';  
import AboutPage from './pages/user/AboutPage';
import ContactPage from './pages/user/ContactPage';
import BlogPage from './pages/user/BlogPage';
import FAQPage from './pages/user/FAQPage';
import ShippingPage from './pages/user/ShippingPage';
import BlogManager from './pages/admin/BlogManager';
import PostDetail from './pages/user/PostDetail';
import ContactManager from './pages/admin/ContactManager';
import FAQManager from './pages/admin/FAQManager';
import AuditLogManager from './pages/admin/AuditLogManager';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ScrollToTop from './components/ScrollToTop';
function App() {
  const initTheme = useThemeStore((state) => state.initTheme);
  const { settings, fetchSettings } = useSettingStore();
  
  useEffect(() => {
    fetchSettings(); // Lấy settings và tự đổi document.title
  }, []);
  useEffect(() => {
    initTheme(); // Chạy 1 lần khi load app để set class 'dark' nếu có
  }, [initTheme]);
  // THÊM ĐOẠN NÀY ĐỂ KÍCH HOẠT MÀU SẮC THEO MÙA
  useEffect(() => {
    if (settings?.currentTheme) {
      document.body.className = settings.currentTheme; // Gắn class (vd: theme-spring) vào body
    } else {
      document.body.className = 'theme-winter'; // Mặc định là màu gốc (Mùa đông)
    }
  }, [settings?.currentTheme]);

  return (
    <Router>
      <ScrollToTop />
      {/* Cấu hình Toaster toàn cục */}
      <Toaster
        position="bottom-right" // Chuyển xuống góc dưới bên phải để tránh che Form
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{
          top: 20,
          left: 20,
          bottom: 40, // Đẩy lên một chút để không đè lên footer/chat widget
          right: 20,
        }}
        toastOptions={{
          // Cấu hình chung cho mọi Toast
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            borderRadius: '16px', // Bo góc lớn đồng bộ với giao diện web
            padding: '12px 24px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          // Cấu hình riêng theo loại
          success: {
            iconTheme: {
              primary: '#10b981', // Màu xanh Emerald/Summer
              secondary: 'white',
            },
          },
          error: {
            duration: 3000,
            iconTheme: {
              primary: '#ef4444', // Màu đỏ sẫm
              secondary: 'white',
            },
          },
        }}
      />
      
      <Routes>
       {/* ROUTES KHÔNG CẦN LAYOUT (AUTH) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        {/* ROUTES DÀNH CHO USER (BỌC TRONG USER LAYOUT) */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/book/:id" element={<BookDetails />} />
          <Route path="/author/:id" element={<AuthorPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<PostDetail />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          
          {/* Các route user cần đăng nhập */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Route>
        </Route>

        {/* CÁC ROUTE ADMIN - ĐƯỢC BỌC TRONG ADMIN LAYOUT */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            {/* Index route của AdminLayout */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* Các trang sẽ làm ở bước tiếp theo */}
            <Route path="/admin/categories" element={<CategoryManager />} />
            <Route path="/admin/authors" element={<AuthorManager />} />
            <Route path="/admin/books" element={<BookManager />} />
            <Route path="/admin/orders" element={<OrderManager />} />
            <Route path="/admin/users" element={<UserManager />} />
            <Route path="/admin/coupons" element={<CouponManager />} />
            <Route path="/admin/settings" element={<SettingManager />} />
            <Route path="/admin/blogs" element={<BlogManager />} />
            <Route path="/admin/contacts" element={<ContactManager />} />
            <Route path="/admin/faq" element={<FAQManager />} />
            <Route path="/admin/audit-logs" element={<AuditLogManager />} />
            
          </Route>
        </Route>  
      </Routes>
    </Router>
  );
}

export default App;