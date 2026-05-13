import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { faqService } from '../../services/faq.service';

const FAQManager = () => {
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchFaqs = async () => {
    try {
      setIsLoading(true);
      // Đổi thành gọi hàm lấy tất cả cho Admin
      const data = await faqService.getAllForAdmin();
      setFaqs(data);
    } catch (error) { toast.error('Lỗi tải dữ liệu'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchFaqs(); }, []);

  const handleOpenCreate = () => {
    reset({ question: '', answer: '' });
    setIsEditing(false);
    setEditingId(null);
    setShowForm(true);
  };

  const handleOpenEdit = (faq) => {
    reset({ question: faq.question, answer: faq.answer });
    setIsEditing(true);
    setEditingId(faq._id);
    setShowForm(true);
  };

  const onSubmit = async (data) => {
    try {
      if (isEditing) await faqService.update(editingId, data);
      else await faqService.create(data);
      toast.success(isEditing ? 'Cập nhật thành công' : 'Thêm mới thành công');
      setShowForm(false);
      fetchFaqs();
    } catch (error) { toast.error('Lỗi xử lý'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xóa câu hỏi này?')) {
      try {
        await faqService.delete(id);
        toast.success('Đã xóa');
        fetchFaqs();
      } catch (error) { toast.error('Lỗi khi xóa'); }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await faqService.toggleStatus(id);
      fetchFaqs(); // Load lại danh sách để cập nhật giao diện mờ/rõ
    } catch (error) { toast.error('Lỗi khi đổi trạng thái'); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quản Lý FAQ</h2>
          <p className="text-gray-500 text-sm mt-1">Câu hỏi thường gặp của khách hàng</p>
        </div>
        <button onClick={handleOpenCreate} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          <i className="ri-add-line text-lg"></i> Thêm Câu Hỏi
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 text-sm uppercase tracking-wider">
              <th className="p-5 font-semibold">Câu hỏi & Trả lời</th>
              <th className="p-5 font-semibold text-center w-32">Trạng thái</th>
              <th className="p-5 font-semibold text-center w-32">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? <tr><td colSpan="3" className="text-center p-8">Đang tải...</td></tr> : 
             faqs.map(faq => (
              {/* Thêm logic làm mờ vào thẻ tr dưới đây */},
              <tr key={faq._id} className={`transition-all duration-300 ${!faq.isActive ? 'opacity-50 grayscale bg-gray-100/50 dark:bg-gray-800/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}>
                <td className="p-5">
                  <div className="font-bold text-gray-900 dark:text-white mb-1">{faq.question}</div>
                  <div className="text-gray-500 text-sm line-clamp-2">{faq.answer}</div>
                </td>
                <td className="p-5 text-center">
                  <button onClick={() => handleToggleStatus(faq._id)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${faq.isActive ? 'bg-green-500' : 'bg-gray-400'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${faq.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </td>
                <td className="p-5 text-center">
                  <button onClick={() => handleOpenEdit(faq)} className="text-blue-600 p-2"><i className="ri-edit-2-line text-lg"></i></button>
                  <button onClick={() => handleDelete(faq._id)} className="text-red-500 p-2"><i className="ri-delete-bin-line text-lg"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl p-8 custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold dark:text-white">{isEditing ? 'Sửa Câu Hỏi' : 'Thêm Câu Hỏi'}</h3>
              <button onClick={() => setShowForm(false)} className="text-2xl text-gray-400"><i className="ri-close-line"></i></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Câu hỏi</label>
                <input {...register('question', { required: true })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 outline-none dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Câu trả lời</label>
                <textarea {...register('answer', { required: true })} rows="4" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 outline-none dark:text-white resize-none"></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl">Lưu Lại</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQManager;