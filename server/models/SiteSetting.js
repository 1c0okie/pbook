import mongoose from 'mongoose';

const siteSettingSchema = new mongoose.Schema({
  siteTitle: { type: String, default: 'My Bookstore' },
  logoUrl: { type: String, default: 'https://placehold.co/150x50/png?text=LOGO' },
  bannerUrl: { type: String, default: 'https://placehold.co/1200x400/png?text=BANNER' },
  currentTheme: { type: String, default: 'theme-spring' }, // Chuẩn bị sẵn cho Phần 3 (4 mùa)

  storeAddress: { type: String, default: '123 Đường Sách, TP.HCM' },
  storePhone: { type: String, default: '1900 1234' },
  storeEmail: { type: String, default: 'support@mybookstore.com' },
  facebookUrl: { type: String, default: '' },
  instagramUrl: { type: String, default: '' },
  tiktokUrl: { type: String, default: '' },
  // ==========================================
  // THÊM 7 TRƯỜNG MỚI NÀY DÀNH CHO HERO BANNER
  // ==========================================
  bannerTagline: { type: String, default: 'Khám phá tri thức mới' },
  bannerTitle1: { type: String, default: 'Không gian' },
  bannerHighlight: { type: String, default: 'sách hiện đại' },
  bannerTitle2: { type: String, default: 'dành cho bạn.' },
  bannerDesc: { type: String, default: 'Hàng ngàn đầu sách chất lượng cao về Lập trình, Kinh doanh, Kiến trúc hệ thống và nhiều lĩnh vực khác đang chờ đón.' },
  bannerCtaText: { type: String, default: 'Mua sắm ngay' },
  bannerCtaLink: { type: String, default: '/store' },
  // ==========================================
  // ... các trường cũ
    defaultShippingFee: { type: Number, default: 30000 }, // Phí ship mặc định
    // Đổi từ shippingPolicy: String thành:
  shippingPolicies: {
    type: [
      {
        icon: String,
        title: String,
        content: String
      }
    ],
    default: [
      { icon: 'ri-time-line', title: 'Thời gian giao hàng dự kiến', content: 'Khu vực Nội thành (TP.HCM/Hà Nội): 1 - 2 ngày làm việc.\nKhu vực Tỉnh/Thành khác: 3 - 5 ngày làm việc.' },
      { icon: 'ri-money-dollar-circle-line', title: 'Phí vận chuyển', content: 'Phí vận chuyển được tính dựa trên khoảng cách. Miễn phí vận chuyển cho đơn hàng từ 500.000đ.' },
      { icon: 'ri-shield-check-line', title: 'Quy định đồng kiểm', content: 'Cho phép đồng kiểm trạng thái sách trước khi thanh toán.' }
    ]
  },
  // Thêm vào bên trong Setting Schema
    homePageLayout: {
      type: [String],
      default: [
        'hero', 'services', 'trending', 'browse', 'promo', 'bestseller', 'new', 'testimonial'
      ]
    }
}, { timestamps: true });

export default mongoose.model('SiteSetting', siteSettingSchema);