import React, { useState, useEffect } from 'react';
import { faqService } from '../../services/faq.service'; // Import API
import { Link } from 'react-router-dom'; // <--- Thêm dòng này
// Giữ nguyên Component FAQItem cũ
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-none">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full py-6 flex justify-between items-center text-left focus:outline-none group">
        <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-blue-600' : 'text-gray-900 dark:text-white group-hover:text-blue-500'}`}>
          {question}
        </span>
        <i className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-2xl ${isOpen ? 'text-blue-600' : 'text-gray-400'}`}></i>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

const FAQPage = () => {
  // SỬA ĐOẠN NÀY ĐỂ LẤY DỮ LIỆU TỪ DB
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const data = await faqService.getAll();
        setFaqs(data);
      } catch (error) {
        console.error('Lỗi tải FAQ', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-10 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Câu Hỏi Thường Gặp</h1>
          <p className="text-gray-500 dark:text-gray-400">Giải đáp nhanh những thắc mắc của bạn về dịch vụ và sản phẩm.</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 min-h-[200px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : faqs.length === 0 ? (
            <p className="text-center text-gray-500">Chưa có câu hỏi nào được cập nhật.</p>
          ) : (
            faqs.map((faq) => (
              <FAQItem key={faq._id} question={faq.question} answer={faq.answer} />
            ))
          )}
        </div>

        <div className="mt-12 text-center p-8 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-800">
          <p className="text-gray-700 dark:text-gray-300 mb-4">Vẫn còn thắc mắc khác?</p>
          <Link 
            to="/contact" 
            className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
          >
            Liên hệ hỗ trợ ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;