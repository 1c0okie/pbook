import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSettingStore from '../../store/setting.store';
import { contactService } from '../../services/contact.service';
const ContactPage = () => {
  const { settings } = useSettingStore();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Thay đổi hàm onSubmit cũ
const onSubmit = async (data) => {
  try {
    await contactService.send(data); // Gọi API thật
    toast.success('Gửi lời nhắn thành công! Chúng tôi sẽ phản hồi sớm nhất.');
    reset();
  } catch (error) {
    toast.error('Gửi tin thất bại, vui lòng thử lại sau.');
  }
};

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-10 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">Liên Hệ</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Chúng tôi luôn lắng nghe và sẵn sàng hỗ trợ bạn. Hãy để lại lời nhắn nếu bạn cần bất kỳ sự trợ giúp nào!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          
          {/* CỘT TRÁI: THÔNG TIN LIÊN HỆ */}
          {/* CỘT TRÁI: THÔNG TIN LIÊN HỆ */}
          <div className="bg-blue-600 p-10 text-white flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-6">Thông tin liên hệ</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <i className="ri-map-pin-line text-2xl text-blue-200"></i>
                  <div>
                    <h4 className="font-bold text-lg">Địa chỉ</h4>
                    {/* ĐỔI THÀNH BIẾN ĐỘNG */}
                    <p className="text-blue-100">{settings?.storeAddress || 'Đang cập nhật'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <i className="ri-phone-line text-2xl text-blue-200"></i>
                  <div>
                    <h4 className="font-bold text-lg">Điện thoại</h4>
                    <p className="text-blue-100">{settings?.storePhone || 'Đang cập nhật'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <i className="ri-mail-send-line text-2xl text-blue-200"></i>
                  <div>
                    <h4 className="font-bold text-lg">Email</h4>
                    <p className="text-blue-100">{settings?.storeEmail || 'Đang cập nhật'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <h4 className="font-bold mb-4">Kết nối với chúng tôi</h4>
              <div className="flex gap-4">
                {/* ẨN/HIỆN NÚT THEO LINK CÓ TỒN TẠI HAY KHÔNG */}
                {settings?.facebookUrl && (
                  <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors">
                    <i className="ri-facebook-fill"></i>
                  </a>
                )}
                {settings?.instagramUrl && (
                  <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors">
                    <i className="ri-instagram-line"></i>
                  </a>
                )}
                {settings?.tiktokUrl && (
                  <a href={settings.tiktokUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors">
                    <i className="ri-tiktok-fill"></i>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: FORM LIÊN HỆ */}
          <div className="p-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Gửi lời nhắn</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ tên</label>
                  <input 
                    {...register('name', { required: 'Vui lòng nhập họ tên' })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-gray-900 dark:text-white transition-colors"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input 
                    type="email"
                    {...register('email', { required: 'Vui lòng nhập email' })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-gray-900 dark:text-white transition-colors"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chủ đề</label>
                <input 
                  {...register('subject', { required: 'Vui lòng nhập chủ đề' })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-gray-900 dark:text-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nội dung</label>
                <textarea 
                  {...register('message', { required: 'Vui lòng nhập lời nhắn' })}
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-gray-900 dark:text-white resize-none transition-colors"
                ></textarea>
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
              </div>

              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-blue-600/30 w-full md:w-auto"
              >
                Gửi Tin Nhắn
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;