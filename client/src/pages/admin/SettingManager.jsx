import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { settingService } from '../../services/setting.service';
import { uploadService } from '../../services/upload.service'; // Import service upload
import useSettingStore from '../../store/setting.store';
import { useForm, useFieldArray } from 'react-hook-form'; // Sửa dòng import này

const SettingManager = () => {
    
  const { settings, updateLocalSettings } = useSettingStore();
  const [isSaving, setIsSaving] = useState(false);
  
  // Thêm 2 state để hiển thị hiệu ứng xoay xoay lúc đang tải ảnh lên Cloudinary
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // Nhớ lấy thêm hàm setValue từ useForm
  const { register, handleSubmit, reset, watch, setValue, control } = useForm();

  
  // KHAI BÁO useFieldArray cho shippingPolicies
  const { fields: policyFields, append: appendPolicy, remove: removePolicy } = useFieldArray({
    control,
    name: 'shippingPolicies'
  });

    useEffect(() => {
        if (settings) {
        reset({
            siteTitle: settings.siteTitle,
            logoUrl: settings.logoUrl,
            bannerUrl: settings.bannerUrl,
            currentTheme: settings.currentTheme || 'theme-winter',
            storeAddress: settings.storeAddress,
            storePhone: settings.storePhone,
            storeEmail: settings.storeEmail,
            facebookUrl: settings.facebookUrl,
            instagramUrl: settings.instagramUrl,
            tiktokUrl: settings.tiktokUrl,
            defaultShippingFee: settings.defaultShippingFee,
            shippingPolicies: settings.shippingPolicies || [], // Dùng mảng mới
            // THÊM CÁC TRƯỜNG CỦA BANNER VÀO ĐÂY ĐỂ ĐỒNG BỘ DỮ LIỆU CŨ:
            bannerTagline: settings.bannerTagline,
            bannerTitle1: settings.bannerTitle1,
            bannerHighlight: settings.bannerHighlight,
            bannerTitle2: settings.bannerTitle2,
            bannerDesc: settings.bannerDesc,
            bannerCtaText: settings.bannerCtaText,
            bannerCtaLink: settings.bannerCtaLink
        });
        }
    }, [settings, reset]);

  const logoPreview = watch('logoUrl');
  const bannerPreview = watch('bannerUrl');

  // Hàm xử lý khi chọn file ảnh từ máy tính
  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Phân biệt đang upload logo hay banner để hiển thị loading tương ứng
    const setUploading = fieldName === 'logoUrl' ? setIsUploadingLogo : setIsUploadingBanner;

    try {
      setUploading(true);
      const data = await uploadService.uploadImage(file);
      
      // Tải xong -> Lấy link Cloudinary tự động điền vào ô input
      setValue(fieldName, data.imageUrl);
      toast.success('Tải ảnh lên thành công!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi khi tải ảnh lên');
    } finally {
      setUploading(false);
      // Xóa giá trị trong thẻ input file để có thể up lại đúng file đó nếu muốn
      e.target.value = null; 
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      const updatedSettings = await settingService.updateSettings(data);
      updateLocalSettings(updatedSettings);
      toast.success('Lưu cấu hình thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi lưu');
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) return <div>Đang tải...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Cài Đặt Hệ Thống</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Quản lý giao diện, tên miền và banner quảng cáo</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* THÔNG TIN CHUNG (LOGO & TÊN) */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
            <i className="ri-global-line mr-2 text-blue-600"></i> Thông Tin Chung
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tên Website (Thẻ tiêu đề trình duyệt)</label>
              <input 
                {...register('siteTitle', { required: true })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                placeholder="VD: Nhà Sách Tương Lai"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Đường dẫn Logo (URL) hoặc Tải lên</label>
              <div className="flex gap-2">
                <input 
                  {...register('logoUrl')}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                  placeholder="https://... hoặc chọn file"
                />
                {/* Nút giả lập input file */}
                <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 whitespace-nowrap">
                  {isUploadingLogo ? (
                    <><i className="ri-loader-4-line animate-spin"></i> Đang tải...</>
                  ) : (
                    <><i className="ri-upload-cloud-2-line"></i> Chọn Ảnh</>
                  )}
                  {/* Input ẩn */}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e, 'logoUrl')} 
                    disabled={isUploadingLogo}
                  />
                </label>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-center">
                <img src={logoPreview || 'https://placehold.co/150x50?text=LOGO'} alt="Preview Logo" className="h-12 object-contain" />
              </div>
            </div>
          </div>
        </div>

        {/* ================================== */}
        {/* THÔNG TIN LIÊN HỆ & MẠNG XÃ HỘI */}
        {/* ================================== */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
            <i className="ri-contacts-book-2-line mr-2 text-blue-600"></i> Địa Chỉ & Mạng Xã Hội
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột trái: Địa chỉ */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Địa chỉ cửa hàng</label>
                <input {...register('storeAddress')} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 outline-none dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Số điện thoại Hotline</label>
                <input {...register('storePhone')} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 outline-none dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Email hỗ trợ</label>
                <input {...register('storeEmail')} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 outline-none dark:text-white" />
              </div>
            </div>

            {/* Cột phải: Mạng xã hội */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1"><i className="ri-facebook-circle-fill text-blue-600"></i> Link Facebook</label>
                <input {...register('facebookUrl')} placeholder="https://facebook.com/..." className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 outline-none dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1"><i className="ri-instagram-line text-pink-600"></i> Link Instagram</label>
                <input {...register('instagramUrl')} placeholder="https://instagram.com/..." className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 outline-none dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1"><i className="ri-tiktok-fill text-black dark:text-white"></i> Link TikTok</label>
                <input {...register('tiktokUrl')} placeholder="https://tiktok.com/@..." className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 outline-none dark:text-white" />
              </div>
            </div>
          </div>
        </div>
        {/* ================================== */}

        {/* QUẢN LÝ VẬN CHUYỂN */}
        {/* ================================== */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              <i className="ri-truck-line mr-2 text-blue-600"></i> Cấu Hình Vận Chuyển
            </h3>
            <button 
              type="button" 
              onClick={() => appendPolicy({ icon: 'ri-checkbox-circle-line', title: '', content: '' })}
              className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-200 transition-colors"
            >
              + Thêm Mục Mới
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="max-w-xs mb-8">
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Phí vận chuyển mặc định (VNĐ)</label>
              <input 
                type="number"
                {...register('defaultShippingFee')} 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 outline-none dark:text-white" 
              />
            </div>

            {/* DANH SÁCH CÁC MỤC CHÍNH SÁCH */}
            <div className="space-y-4">
              {policyFields.map((item, index) => (
                <div key={item.id} className="relative p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                  {/* Nút xóa mục */}
                  <button type="button" onClick={() => removePolicy(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
                    <i className="ri-delete-bin-line text-lg"></i>
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pr-8">
                    <div className="md:col-span-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Mã Icon (VD: ri-time-line)</label>
                      <input 
                        {...register(`shippingPolicies.${index}.icon`)} 
                        className="w-full px-4 py-2 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-900 outline-none dark:text-white text-sm" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Tiêu đề mục</label>
                      <input 
                        {...register(`shippingPolicies.${index}.title`)} 
                        className="w-full px-4 py-2 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-900 outline-none dark:text-white font-bold" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nội dung</label>
                    <textarea 
                      {...register(`shippingPolicies.${index}.content`)} 
                      rows="3"
                      className="w-full px-4 py-2 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-900 outline-none dark:text-white resize-none"
                    ></textarea>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </div>

        {/* BANNER CHÍNH */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
            <i className="ri-image-line mr-2 text-blue-600"></i> Banner Trang Chủ
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Đường dẫn Banner (URL) hoặc Tải lên</label>
            <div className="flex gap-2">
              <input 
                {...register('bannerUrl')}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                placeholder="https://... hoặc chọn file"
              />
              <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 whitespace-nowrap">
                  {isUploadingBanner ? (
                    <><i className="ri-loader-4-line animate-spin"></i> Đang tải...</>
                  ) : (
                    <><i className="ri-upload-cloud-2-line"></i> Chọn Ảnh</>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e, 'bannerUrl')} 
                    disabled={isUploadingBanner}
                  />
              </label>
            </div>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <img src={bannerPreview || 'https://placehold.co/1200x400?text=BANNER'} alt="Preview Banner" className="w-full h-48 object-cover rounded-lg shadow-sm" />
            </div>

            {/* BỔ SUNG CÁC TRƯỜNG THÔNG TIN TEXT CHO BANNER VÀO ĐÂY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 dark:bg-gray-800/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 mt-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tagline (Dòng chữ nhỏ trên cùng)</label>
                <input {...register('bannerTagline')} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none text-gray-900 dark:text-white" placeholder="VD: Khám phá tri thức mới" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiêu đề - Phần đầu</label>
                <input {...register('bannerTitle1')} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none text-gray-900 dark:text-white" placeholder="VD: Không gian" />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Chữ Nổi Bật (Sẽ đổi màu theo mùa)</label>
                <input {...register('bannerHighlight')} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-900/50 outline-none text-gray-900 dark:text-white" placeholder="VD: sách hiện đại" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiêu đề - Phần cuối</label>
                <input {...register('bannerTitle2')} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none text-gray-900 dark:text-white" placeholder="VD: dành cho bạn." />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả chi tiết</label>
                <textarea {...register('bannerDesc')} rows="2" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none text-gray-900 dark:text-white resize-none" placeholder="Nhập đoạn mô tả ngắn..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chữ trên nút (Call to Action)</label>
                <input {...register('bannerCtaText')} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none text-gray-900 dark:text-white" placeholder="VD: Mua sắm ngay" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link nút bấm</label>
                <input {...register('bannerCtaLink')} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none text-gray-900 dark:text-white" placeholder="VD: /store" />
              </div>
            </div>
            {/* KẾT THÚC KHU VỰC BỔ SUNG */}

          </div>
        </div>

        {/* ================================== */}
        {/* CHỌN GIAO DIỆN 4 MÙA (THEMES) */}
        {/* ================================== */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
            <i className="ri-palette-line mr-2 text-blue-600"></i> Chủ Đề Giao Diện (4 Mùa)
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'theme-spring', name: 'Mùa Xuân', desc: 'Hồng Đào', bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-200' },
              { id: 'theme-summer', name: 'Mùa Hè', desc: 'Xanh Nhiệt Đới', bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-200' },
              { id: 'theme-autumn', name: 'Mùa Thu', desc: 'Cam Lá Phong', bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-200' },
              { id: 'theme-winter', name: 'Mùa Đông', desc: 'Xanh Đại Dương', bg: '!bg-blue-600', text: '!text-blue-600', border: 'b!order-blue-200' },
            ].map((theme) => (
              <label 
                key={theme.id}
                className={`relative cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center gap-3 transition-all ${
                  watch('currentTheme') === theme.id 
                    ? `border-gray-900 dark:border-white shadow-md` 
                    : `border-gray-100 dark:border-gray-800 hover:border-gray-300`
                }`}
              >
                {/* Checkbox ẩn */}
                <input 
                  type="radio" 
                  value={theme.id} 
                  {...register('currentTheme')} 
                  className="hidden" 
                />
                
                {/* Vòng tròn màu đại diện */}
                <div className={`h-12 w-12 rounded-full shadow-inner ${theme.bg}`}></div>
                
                {/* Tên Theme */}
                <div className="text-center">
                  <p className="font-bold text-gray-900 dark:text-white">{theme.name}</p>
                  <p className={`text-xs font-bold mt-1 ${theme.text}`}>{theme.desc}</p>
                </div>

                {/* Dấu tích xanh khi chọn */}
                {watch('currentTheme') === theme.id && (
                  <div className="absolute top-2 right-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 h-6 w-6 rounded-full flex items-center justify-center text-sm shadow-sm">
                    <i className="ri-check-line"></i>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>


        <button 
          type="submit"
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-600/30"
        >
          {isSaving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-save-3-line"></i>} 
          Lưu Cài Đặt
        </button>
      </form>
    </div>
  );
};

export default SettingManager;