import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = () => {
  return (
    // Thay đổi ở dòng này: Khóa chiều cao toàn trang (h-screen overflow-hidden)
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        {/* Vùng Main này sẽ tự động sinh ra thanh cuộn riêng khi nội dung dài */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;