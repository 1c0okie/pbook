import React from 'react';
import { Link } from 'react-router-dom';
import useSettingStore from '../../store/setting.store'; // 1. IMPORT STORE

const UserFooter = () => {
  // 2. LẤY DỮ LIỆU SETTINGS TỪ STORE
  const { settings } = useSettingStore();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-16 pb-8 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            
            {/* 3. HIỂN THỊ LOGO HOẶC TÊN WEBSITE TỪ SETTINGS */}
            <Link to="/" className="flex items-center gap-2 mb-4">
              {settings?.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt={settings?.siteTitle || 'Logo'} 
                  className="h-10 object-contain" 
                />
              ) : (
                <>
                  <i className="ri-book-open-fill text-3xl text-blue-600"></i>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {settings?.siteTitle || 'MERNBook'}
                  </span>
                </>
              )}
            </Link>
            
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm leading-relaxed">
              Dự án website bán sách E-Commerce được xây dựng bằng MERN Stack hiện đại. Cung cấp trải nghiệm mua sắm tuyệt vời nhất.
            </p>
          </div>
          
          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">Trang chủ</Link></li>
              <li><Link to="/store" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">Cửa hàng</Link></li>
              <li><Link to="/about" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">Về chúng tôi</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-4">Hỗ trợ</h4>
            <ul className="space-y-3">
              <li><Link to="/faq" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">Câu hỏi thường gặp</Link></li>
              <li><Link to="/shipping" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">Chính sách giao hàng</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* 4. CẬP NHẬT TÊN BẢN QUYỀN */}
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} {settings?.siteTitle || 'MERNBook'}. Đã đăng ký bản quyền.
          </p>
          
          {/* 5. HIỂN THỊ LINK MẠNG XÃ HỘI NẾU ADMIN CÓ NHẬP */}
          <div className="flex gap-4">
            {settings?.facebookUrl && (
              <a 
                href={settings.facebookUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-blue-600 hover:text-white transition-colors"
                title="Facebook"
              >
                <i className="ri-facebook-fill"></i>
              </a>
            )}
            
            {settings?.instagramUrl && (
              <a 
                href={settings.instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-pink-600 hover:text-white transition-colors"
                title="Instagram"
              >
                <i className="ri-instagram-line"></i>
              </a>
            )}

            {settings?.tiktokUrl && (
              <a 
                href={settings.tiktokUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-black dark:hover:bg-white dark:hover:text-black hover:text-white transition-colors"
                title="TikTok"
              >
                <i className="ri-tiktok-fill"></i>
              </a>
            )}
          </div>

        </div>
      </div>
    </footer>
  );
};

export default UserFooter;