import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { categoryService } from '../../services/category.service';
import { uploadService } from '../../services/upload.service';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // States cho Form Modal
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
  const bannerPreview = watch('bannerUrl');

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      toast.error('Lỗi tải danh mục');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Mở Form TẠO MỚI
  const handleOpenCreate = () => {
    reset({ name: '', description: '', bannerUrl: '' }); 
    setIsEditing(false);
    setEditingId(null);
    setShowForm(true);
  };

  // Mở Form CHỈNH SỬA
  const handleOpenEdit = (cat) => {
    reset({ 
      name: cat.name, 
      description: cat.description || '', 
      bannerUrl: cat.bannerUrl || '' 
    });
    setIsEditing(true);
    setEditingId(cat._id);
    setShowForm(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploadingBanner(true);
      const data = await uploadService.uploadImage(file);
      setValue('bannerUrl', data.imageUrl);
      toast.success('Tải ảnh lên thành công!');
    } catch (error) {
      toast.error('Có lỗi khi tải ảnh lên');
    } finally {
      setIsUploadingBanner(false);
      e.target.value = null; 
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      if (isEditing) {
        await categoryService.update(editingId, data);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await categoryService.create(data);
        toast.success('Tạo danh mục thành công');
      }
      setShowForm(false); 
      fetchCategories(); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi xử lý');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await categoryService.delete(id);
        toast.success('Đã xóa danh mục');
        fetchCategories();
      } catch (error) {
        toast.error('Lỗi khi xóa');
      }
    }
  };

  // HÀM XỬ LÝ BẬT/TẮT TRẠNG THÁI
  const handleToggleStatus = async (id) => {
    try {
      const data = await categoryService.toggleStatus(id);
      toast.success(data.message);
      fetchCategories(); // Load lại data để nút gạt đổi màu
    } catch (error) {
      toast.error('Lỗi khi thay đổi trạng thái');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Nút Tạo mới */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quản Lý Danh Mục</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Phân loại sách và trạng thái hiển thị</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
        >
          <i className="ri-add-line text-lg"></i> Thêm Danh Mục
        </button>
      </div>

      {/* BẢNG DANH MỤC */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 text-sm uppercase tracking-wider">
                <th className="p-5 font-semibold">Ảnh</th>
                <th className="p-5 font-semibold">Tên danh mục</th>
                <th className="p-5 font-semibold text-center">Trạng thái</th>
                <th className="p-5 font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr><td colSpan="4" className="text-center p-8 text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan="4" className="text-center p-8 text-gray-500">Chưa có danh mục nào.</td></tr>
              ) : (
                categories.map((cat) => {
                  // Mặc định những category cũ chưa có field isActive thì coi như là true
                  const isActive = cat.isActive !== false; 
                  
                  return (
                    <tr key={cat._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="p-5">
                        <img 
                          src={cat.bannerUrl || 'https://placehold.co/100x100?text=NO+IMG'} 
                          alt={cat.name} 
                          className={`w-16 h-12 object-cover rounded shadow-sm border border-gray-200 dark:border-gray-700 ${!isActive && 'opacity-50 grayscale'}`} 
                        />
                      </td>
                      <td className={`p-5 font-bold ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 line-through'}`}>
                        {cat.name}
                      </td>
                      
                      {/* CỘT TRẠNG THÁI NÚT GẠT */}
                      <td className="p-5 text-center">
                        <button 
                          onClick={() => handleToggleStatus(cat._id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </td>

                      <td className="p-5 text-center flex justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEdit(cat)}
                          className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <i className="ri-edit-2-line text-lg"></i>
                        </button>
                        <button 
                          onClick={() => handleDelete(cat._id)}
                          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <i className="ri-delete-bin-line text-lg"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM TẠO/SỬA (GIỮ NGUYÊN) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                <i className="ri-close-line"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên danh mục</label>
                <input 
                  {...register('name', { required: 'Vui lòng nhập tên' })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả ngắn</label>
                <textarea 
                  {...register('description')}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-gray-900 dark:text-white resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ảnh đại diện (Banner)</label>
                <div className="flex gap-2">
                  <input 
                    {...register('bannerUrl')}
                    placeholder="Link ảnh hoặc Tải lên"
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-gray-900 dark:text-white text-sm"
                  />
                  <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-3 rounded-xl font-bold transition-colors flex items-center justify-center whitespace-nowrap">
                    {isUploadingBanner ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-upload-cloud-2-line"></i>}
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploadingBanner}/>
                  </label>
                </div>

                <div className="mt-3 w-full h-32 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-xs">Chưa có ảnh</span>
                  )}
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSaving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 mt-2"
              >
                {isSaving ? 'Đang xử lý...' : 'Lưu Danh Mục'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;