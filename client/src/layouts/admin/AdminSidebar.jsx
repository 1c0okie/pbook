import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import useChatStore from '../../store/chat.store'; // IMPORT STORE CHAT

const AdminSidebar = () => {
  // LẤY BIẾN ĐẾM SỐ TỪ STORE
  const { adminUnreadCount } = useChatStore();

  // PHÂN MODULE THÀNH TỪNG NHÓM
  const menuGroups = [
    {
      title: 'Tổng quan',
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: 'ri-dashboard-line' },
      ]
    },
    {
      title: 'Quản lý cửa hàng',
      items: [
        { name: 'Đơn Hàng', path: '/admin/orders', icon: 'ri-shopping-cart-2-line' },
        { name: 'Kho Sách', path: '/admin/books', icon: 'ri-book-2-line' },
        { name: 'Danh Mục', path: '/admin/categories', icon: 'ri-list-check' },
        { name: 'Tác Giả', path: '/admin/authors', icon: 'ri-user-star-line' },
        { name: 'Mã Giảm Giá', path: '/admin/coupons', icon: 'ri-price-tag-2-line' },
      ]
    },
    {
      title: 'Khách hàng & Nội dung',
      items: [
        { name: 'Khách hàng', path: '/admin/users', icon: 'ri-group-line' },
        { name: 'Blog', path: '/admin/blogs', icon: 'ri-newspaper-line' },
        { name: 'Liên hệ', path: '/admin/contacts', icon: 'ri-message-2-line' },
        { name: 'FAQ', path: '/admin/faq', icon: 'ri-question-line' },
      ]
    },
    {
      title: 'Hệ thống',
      items: [
        { name: 'Trang Chủ', path: '/admin/home', icon: 'ri-home-2-line' },
        { name: 'Cài Đặt', path: '/admin/settings', icon: 'ri-settings-3-line' },
        { name: 'Nhật ký', path: '/admin/audit-logs', icon: 'ri-file-list-3-line' },
        { name: 'Tư vấn', path: '/admin/chat', icon: 'ri-chat-1-line' },
      ]
    }
  ];

  // STATE: QUẢN LÝ ĐÓNG MỞ CÁC NHÓM MENU (Mặc định mở tất cả)
  const [openGroups, setOpenGroups] = useState(() => {
    const initialState = {};
    menuGroups.forEach(group => {
      initialState[group.title] = true;
    });
    return initialState;
  });

  // HÀM TOGGLE ĐÓNG/MỞ
  const toggleGroup = (title) => {
    setOpenGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-colors duration-300 hidden md:flex flex-col">
      
      {/* Vùng Logo */}
      <div className="p-6 shrink-0">
        <h1 className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
          <i className="ri-book-open-fill mr-2"></i>BookAdmin
        </h1>
      </div>

      {/* Vùng Menu có thể cuộn */}
      <nav className="flex-1 px-4 pb-8 overflow-y-auto custom-scrollbar space-y-4">
        {menuGroups.map((group, index) => (
          <div key={index} className="flex flex-col">
            
            {/* TIÊU ĐỀ NHÓM CÓ THỂ CLICK ĐỂ ĐÓNG MỞ */}
            <button 
              onClick={() => toggleGroup(group.title)}
              className="flex items-center justify-between w-full px-4 mb-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-blue-600 dark:hover:text-blue-400 transition-colors group-btn"
            >
              <span>{group.title}</span>
              <i className={`ri-arrow-down-s-line text-sm transition-transform duration-300 ${openGroups[group.title] ? 'rotate-180' : ''}`}></i>
            </button>

            {/* DANH SÁCH MENU CON CÓ HIỆU ỨNG TRƯỢT ĐÓNG MỞ */}
            <div className={`space-y-1 overflow-hidden transition-all duration-300 ${openGroups[group.title] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <i className={`${item.icon} text-xl`}></i>
                    <span className="text-sm">{item.name}</span>
                  </div>

                  {/* HIỂN THỊ SỐ LƯỢNG TIN NHẮN (THAY VÌ CHỈ HIỆN CHẤM ĐỎ) */}
                  {item.path === '/admin/chat' && adminUnreadCount > 0 && (
                    <span className="flex items-center justify-center bg-red-500 text-white text-[10px] font-black h-5 min-w-[20px] px-1.5 rounded-full shadow-sm animate-pulse">
                      {adminUnreadCount > 99 ? '99+' : adminUnreadCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
            
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;