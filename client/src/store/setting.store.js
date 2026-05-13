import { create } from 'zustand';
import { settingService } from '../services/setting.service';

const useSettingStore = create((set) => ({
  settings: null,
  isLoading: true,

  fetchSettings: async () => {
    try {
      const data = await settingService.getSettings();
      set({ settings: data, isLoading: false });
      
      // 1. ĐỔI TÊN TAB TRÌNH DUYỆT NGAY LẬP TỨC
      if (data?.siteTitle) {
        document.title = data.siteTitle;
      }

      // 2. KÍCH HOẠT THEME 4 MÙA TỰ ĐỘNG (Gắn thẳng vào thẻ body)
      if (data?.currentTheme) {
        // Xóa tất cả class theme cũ nếu có và thêm theme mới
        document.body.className = data.currentTheme; 
        
        // Hoặc nếu bạn có dùng Dark Mode song song ở thẻ html, 
        // hãy cẩn thận đừng ghi đè mất class 'dark' nhé. 
        // Nếu thẻ body chỉ dành cho theme, thì gán trực tiếp như trên là chuẩn nhất.
      }

      // 3. ĐỔI FAVICON (ICON TAB) THEO LOGO (Tùy chọn cực hay)
      if (data?.logoUrl) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = data.logoUrl;
      }
      
    } catch (error) {
      console.error('Lỗi tải cấu hình:', error);
      set({ isLoading: false });
    }
  },

  updateLocalSettings: (newSettings) => {
    set({ settings: newSettings });
    
    // Cập nhật lại ngay lập tức khi Admin bấm "Lưu Cài Đặt"
    if (newSettings?.siteTitle) {
      document.title = newSettings.siteTitle;
    }
    
    if (newSettings?.currentTheme) {
      document.body.className = newSettings.currentTheme;
    }

    if (newSettings?.logoUrl) {
      let link = document.querySelector("link[rel~='icon']");
      if (link) link.href = newSettings.logoUrl;
    }
  }
}));

export default useSettingStore;