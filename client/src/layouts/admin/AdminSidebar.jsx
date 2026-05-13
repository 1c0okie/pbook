import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
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
        { name: 'Nhật ký', path: '/admin/audit-logs', icon: 'ri-file-list-3-line' },
        { name: 'Cài Đặt', path: '/admin/settings', icon: 'ri-settings-3-line' },
      ]
    }
  ];

  return (
    // Đặt chiều cao bằng đúng màn hình (h-screen)
    <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-colors duration-300 hidden md:flex flex-col">
      
      {/* Vùng Logo luôn ghim cứng (shrink-0) */}
      <div className="p-6 shrink-0">
        <h1 className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
          <i className="ri-book-open-fill mr-2"></i>BookAdmin
        </h1>
      </div>

      {/* Vùng Menu có thể cuộn độc lập (overflow-y-auto) */}
      <nav className="flex-1 px-4 pb-8 overflow-y-auto custom-scrollbar space-y-6">
        {menuGroups.map((group, index) => (
          <div key={index}>
            <h3 className="px-4 mb-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <i className={`${item.icon} text-xl`}></i>
                  <span className="text-sm">{item.name}</span>
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