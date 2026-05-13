import React from 'react';
import { Link } from 'react-router-dom';

const ServiceSection = () => {
  const services = [
    {
      id: 1,
      title: 'Chính Sách Vận Chuyển',
      description: 'Cập nhật chi tiết về thời gian giao hàng, mức phí ship và quy định đồng kiểm trước khi nhận.',
      icon: 'ri-truck-line',
      path: '/shipping', // Sửa lại đường dẫn nếu cấu hình Route của bạn khác
      iconBg: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      hoverColor: 'group-hover:bg-red-600 group-hover:text-white dark:group-hover:bg-red-600 dark:group-hover:text-white'
    },
    {
      id: 2,
      title: 'Góc Đọc Sách (Blog)',
      description: 'Khám phá các bài đánh giá sách chuyên sâu, tin tức văn học và mẹo xây dựng thói quen đọc sách.',
      icon: 'ri-quill-pen-line',
      path: '/blog',
      iconBg: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      hoverColor: 'group-hover:bg-green-600 group-hover:text-white dark:group-hover:bg-green-600 dark:group-hover:text-white'
    },
    {
      id: 3,
      title: 'Câu Hỏi Thường Gặp',
      description: 'Giải đáp nhanh chóng mọi thắc mắc của bạn về quá trình đặt mua, thanh toán và chính sách đổi trả.',
      icon: 'ri-question-answer-line',
      path: '/faq',
      iconBg: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      hoverColor: 'group-hover:bg-orange-600 group-hover:text-white dark:group-hover:bg-orange-600 dark:group-hover:text-white'
    }
  ];

  return (
    <section className="py-16 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Tiêu đề của Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
            Đồng Hành Cùng Bạn
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Chúng tôi luôn sẵn sàng hỗ trợ và mang đến cho bạn trải nghiệm mua sắm, đọc sách trọn vẹn nhất.
          </p>
        </div>

        {/* Lưới Grid chứa 3 Thẻ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <Link 
              key={service.id} 
              to={service.path}
              className="group block bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Hình tròn mờ trang trí ở góc */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gray-50 dark:bg-gray-800 rounded-full opacity-50 transition-transform duration-500 group-hover:scale-150"></div>

              <div className="relative z-10">
                {/* Icon với hiệu ứng chuyển màu */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-colors duration-300 ${service.iconBg} ${service.iconColor} ${service.hoverColor}`}>
                  <i className={service.icon}></i>
                </div>
                
                {/* Nội dung */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Chữ "Tìm hiểu thêm" */}
                <span className="inline-flex items-center font-bold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Khám phá ngay <i className="ri-arrow-right-line ml-2 transform group-hover:translate-x-2 transition-transform"></i>
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ServiceSection;