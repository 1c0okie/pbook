import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authorService } from '../../services/author.service';
import api from '../../utils/api'; // Import axios instance để gọi API upload

const AuthorManager = () => {
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // State cho lúc đang upload ảnh
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  
  // Theo dõi giá trị avatarUrl để hiển thị preview trong form
  const avatarUrlPreview = watch('avatarUrl');

  const fetchAuthors = async () => {
    try {
      setIsLoading(true);
      const data = await authorService.getAll();
      setAuthors(data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách tác giả');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleOpenAddModal = () => {
    setEditingAuthor(null);
    reset({ name: '', bio: '', avatarUrl: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (author) => {
    setEditingAuthor(author);
    setValue('name', author.name);
    setValue('bio', author.bio);
    setValue('avatarUrl', author.avatarUrl || '');
    setIsModalOpen(true);
  };

  // Hàm xử lý Upload file ảnh riêng biệt
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file); // 'image' phải khớp với upload.single('image') ở Backend

    try {
      setIsUploading(true);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Gán link ảnh trả về từ Cloudinary vào form
      setValue('avatarUrl', data.imageUrl);
      toast.success('Upload ảnh thành công!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi upload ảnh');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingAuthor) {
        await authorService.update(editingAuthor._id, data);
        toast.success('Cập nhật tác giả thành công!');
      } else {
        await authorService.create(data);
        toast.success('Thêm tác giả thành công!');
      }
      setIsModalOpen(false);
      fetchAuthors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tác giả này?')) {
      try {
        await authorService.delete(id);
        toast.success('Xóa tác giả thành công!');
        fetchAuthors();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi xóa!');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý Tác Giả</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Hồ sơ và thông tin các tác giả</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          <i className="ri-add-line text-xl"></i> Thêm tác giả
        </button>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 text-sm uppercase tracking-wider">
                <th className="p-5 font-semibold">Tác giả</th>
                <th className="p-5 font-semibold">Tiểu sử</th>
                <th className="p-5 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr><td colSpan="3" className="text-center p-8 text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : authors.length === 0 ? (
                <tr><td colSpan="3" className="text-center p-8 text-gray-500">Chưa có tác giả nào.</td></tr>
              ) : (
                authors.map((author) => (
                  <tr key={author._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                    <td className="p-5 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex-shrink-0">
                        {author.avatarUrl ? (
                          <img src={author.avatarUrl} alt={author.name} className="h-full w-full object-cover" />
                        ) : (
                          <i className="ri-user-fill text-2xl text-gray-400 flex items-center justify-center h-full w-full"></i>
                        )}
                      </div>
                      <span className="font-medium text-gray-800 dark:text-white">{author.name}</span>
                    </td>
                    <td className="p-5 text-gray-600 dark:text-gray-400 max-w-sm truncate">
                      {author.bio || 'Chưa cập nhật'}
                    </td>
                    <td className="p-5 text-right space-x-3">
                      <button 
                        onClick={() => handleOpenEditModal(author)}
                        className="text-blue-500 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 p-2 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <i className="ri-pencil-line"></i>
                      </button>
                      <button 
                        onClick={() => handleDelete(author._id)}
                        className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 p-2 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingAuthor ? 'Cập nhật Tác giả' : 'Thêm Tác giả mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 text-2xl">
                <i className="ri-close-line"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên tác giả <span className="text-red-500">*</span></label>
                <input 
                  {...register('name', { required: 'Vui lòng nhập tên tác giả' })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder="VD: Nguyễn Nhật Ánh..."
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ảnh đại diện (Avatar)</label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 border border-gray-200 dark:border-gray-600">
                    {avatarUrlPreview ? (
                      <img src={avatarUrlPreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <i className="ri-image-add-line text-2xl text-gray-400 flex items-center justify-center h-full w-full"></i>
                    )}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={uploadFileHandler}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 transition-colors"
                    />
                    {isUploading && <p className="text-sm text-blue-500 mt-1">Đang tải ảnh lên...</p>}
                  </div>
                </div>
                {/* Input ẩn để lưu URL ảnh */}
                <input type="hidden" {...register('avatarUrl')} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiểu sử</label>
                <textarea 
                  {...register('bio')}
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  placeholder="Vài nét về tác giả..."
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  disabled={isUploading} // Khóa nút khi đang upload ảnh
                  className="px-5 py-2.5 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                >
                  {editingAuthor ? 'Lưu thay đổi' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorManager;