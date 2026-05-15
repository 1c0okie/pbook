import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ScrollReveal from 'scrollreveal';

export const useScrollReveal = () => {
  const location = useLocation();

  // 1. Khởi tạo cấu hình gốc (Chỉ chạy 1 lần khi mở web)
  useEffect(() => {
    const sr = ScrollReveal({
      origin: 'bottom',
      distance: '60px',
      duration: 1000,
      delay: 100,
      easing: 'ease-out',
      reset: false // Khuyên dùng false ở Global để mượt hơn
    });

    // Đăng ký các class dùng chung cho toàn dự án
    sr.reveal('.reveal-bottom', { origin: 'bottom' });
    sr.reveal('.reveal-top', { origin: 'top' });
    sr.reveal('.reveal-left', { origin: 'left', distance: '100px' });
    sr.reveal('.reveal-right', { origin: 'right', distance: '100px' });
    sr.reveal('.reveal-interval', { interval: 150 }); 

    return () => sr.destroy();
  }, []);

  // 2. Đồng bộ lại DOM mỗi khi chuyển trang (Bí quyết nằm ở đây)
  useEffect(() => {
    ScrollReveal().sync();
  }, [location.pathname]); // Chạy lại hàm sync mỗi khi URL thay đổi
};