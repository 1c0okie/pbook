import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-10 transition-colors duration-300">
      {/* Banner */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-blue-600 rounded-3xl p-10 md:p-20 text-center text-white relative overflow-hidden shadow-lg">
          <div className="relative z-10 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Về Chúng Tôi</h1>
            <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto">
              Hành trình mang tri thức đến mọi miền Tổ quốc, khơi dậy niềm đam mê đọc sách cho hàng triệu người Việt.
            </p>
          </div>
          {/* Họa tiết trang trí */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Câu chuyện của chúng tôi</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>Bắt đầu từ một cửa hàng sách nhỏ nhoi góc phố vào năm 2020, chúng tôi nhận ra rằng việc tiếp cận những cuốn sách hay đôi khi lại là một rào cản lớn đối với nhiều người.</p>
              <p>Với niềm tin "Mỗi cuốn sách là một thế giới", nền tảng trực tuyến này ra đời nhằm mục đích xóa bỏ mọi giới hạn địa lý. Dù bạn ở thành thị nhộn nhịp hay bản làng xa xôi, những cuốn sách chất lượng nhất vẫn sẽ gõ cửa nhà bạn.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
              <i className="ri-book-open-line text-4xl text-blue-600 mb-2"></i>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">10K+</h3>
              <p className="text-sm text-gray-500">Đầu sách</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
              <i className="ri-user-smile-line text-4xl text-blue-600 mb-2"></i>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">50K+</h3>
              <p className="text-sm text-gray-500">Độc giả</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
              <i className="ri-truck-line text-4xl text-blue-600 mb-2"></i>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">100K+</h3>
              <p className="text-sm text-gray-500">Đơn hàng</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
              <i className="ri-star-smile-line text-4xl text-blue-600 mb-2"></i>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">4.9/5</h3>
              <p className="text-sm text-gray-500">Đánh giá</p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-10 border border-blue-100 dark:border-blue-800/50">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Bạn đã sẵn sàng khám phá?</h2>
          <Link to="/store" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-blue-600/30">
            Đến Cửa Hàng Ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;