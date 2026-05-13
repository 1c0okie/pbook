import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  // Lấy đường dẫn hiện tại
  const { pathname } = useLocation();

  useEffect(() => {
    // Mỗi khi pathname thay đổi, ép trình duyệt cuộn lên tọa độ (0, 0) ngay lập tức
    window.scrollTo(0, 0);
  }, [pathname]);

  // Component này chỉ chạy ngầm, không render ra giao diện gì cả
  return null; 
};

export default ScrollToTop;