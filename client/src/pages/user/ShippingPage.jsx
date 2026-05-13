import React from 'react';
import useSettingStore from '../../store/setting.store';

const ShippingPage = () => {
  const { settings } = useSettingStore();
  
  // Lấy danh sách chính sách từ DB, nếu chưa có thì dùng mảng rỗng
  const policies = settings?.shippingPolicies || [];

  // Mảng màu sắc tự động xoay vòng cho các Icon để giao diện đẹp mắt
  const iconColors = [
    { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600' },
    { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600' },
    { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600' },
    { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600' },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-10 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-12 text-center text-white relative overflow-hidden">
             <i className="ri-truck-fill text-6xl opacity-20 absolute -right-4 -bottom-4"></i>
             <h1 className="text-3xl md:text-4xl font-bold relative z-10">Chính Sách Vận Chuyển</h1>
             <p className="mt-2 text-blue-100 relative z-10">Nhanh chóng - Cẩn thận - Tin cậy</p>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            
            {policies.length === 0 ? (
              <p className="text-center text-gray-500 italic">Chính sách vận chuyển đang được chúng tôi cập nhật...</p>
            ) : (
              policies.map((item, index) => {
                // Tự động xoay vòng lấy màu sắc
                const color = iconColors[index % iconColors.length];
                
                return (
                  <section key={index} className="flex flex-col md:flex-row gap-6">
                    {/* Icon */}
                    <div className={`w-12 h-12 ${color.bg} ${color.text} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <i className={`${item.icon || 'ri-checkbox-circle-line'} text-2xl`}></i>
                    </div>
                    
                    {/* Nội dung */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                      {/* Xử lý hiển thị dấu xuống dòng bằng whitespace-pre-wrap */}
                      <div className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                        {item.content}
                      </div>
                    </div>
                  </section>
                );
              })
            )}

            {/* Hộp hiển thị Phí Ship Chung */}
            <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-800/50 flex flex-col items-center">
               <i className="ri-box-3-line text-3xl text-blue-400 mb-2"></i>
               <p className="font-bold text-gray-900 dark:text-white text-center text-lg">
                 Mức phí vận chuyển tiêu chuẩn hiện tại
               </p>
               <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                 {settings?.defaultShippingFee?.toLocaleString() || 30000}đ
               </p>
               <p className="text-sm text-gray-500 mt-2">Áp dụng cho mọi khu vực toàn quốc</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPage;