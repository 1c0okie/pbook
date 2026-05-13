import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { postService } from '../../services/post.service';
import { uploadService } from '../../services/upload.service';

const BlogManager = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
  const imagePreview = watch('imageUrl');

  const handleTogglePin = async (id) => {
    try {
      const data = await postService.togglePin(id);
      toast.success(data.message);
      fetchPosts(); // Tải lại để thấy nó nhảy lên đầu
    } catch (error) {
      toast.error('Lỗi khi ghim bài viết');
    }
  };

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      // GỌI HÀM DÀNH RIÊNG CHO ADMIN ĐỂ LẤY CẢ BÀI BỊ ẨN
      const data = await postService.getAllForAdmin(); 
      setPosts(data);
    } catch (error) {
      toast.error('Lỗi tải danh sách bài viết');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenCreate = () => {
    reset({ title: '', category: 'Tin tức', summary: '', content: '', imageUrl: '' });
    setIsEditing(false);
    setEditingId(null);
    setShowForm(true);
  };

  const handleOpenEdit = (post) => {
    reset(post);
    setIsEditing(true);
    setEditingId(post._id);
    setShowForm(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const data = await uploadService.uploadImage(file);
      setValue('imageUrl', data.imageUrl);
      toast.success('Tải ảnh lên thành công!');
    } catch (error) {
      toast.error('Có lỗi khi tải ảnh');
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      if (isEditing) {
        await postService.update(editingId, data);
        toast.success('Cập nhật bài viết thành công');
      } else {
        await postService.create(data);
        toast.success('Đăng bài thành công');
      }
      setShowForm(false);
      fetchPosts();
    } catch (error) {
      toast.error('Lỗi xử lý');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        await postService.delete(id);
        toast.success('Đã xóa bài viết');
        fetchPosts();
      } catch (error) {
        toast.error('Lỗi khi xóa');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await postService.toggleStatus(id);
      fetchPosts();
    } catch (error) {
      toast.error('Lỗi khi đổi trạng thái');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quản Lý Blog</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Quản lý tin tức, thông báo và review sách</p>
        </div>
        <button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          <i className="ri-add-line text-lg"></i> Viết Bài Mới
        </button>
      </div>

      {/* Bảng Danh sách */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 text-sm uppercase tracking-wider">
              <th className="p-5 font-semibold">Bài viết</th>
              <th className="p-5 font-semibold">Chuyên mục</th>
              <th className="p-5 font-semibold">Ngày đăng</th>
              <th className="p-5 font-semibold text-center">Trạng thái</th>
              <th className="p-5 font-semibold text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? <tr><td colSpan="5" className="text-center p-8">Đang tải...</td></tr> : 
              posts.map(post => (
                <tr 
                  key={post._id} 
                  // THÊM LOGIC LÀM MỜ Ở ĐÂY NẾU BÀI VIẾT BỊ ẨN
                  className={`transition-all duration-300 ${!post.isActive ? 'opacity-50 grayscale bg-gray-100/50 dark:bg-gray-800/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}
                >
                  <td className="p-5 flex items-center gap-4">
                    <img src={post.imageUrl || 'https://placehold.co/100x100?text=IMG'} className="w-16 h-12 object-cover rounded-lg" alt="" />
                    <div className="max-w-[200px] sm:max-w-xs truncate font-bold text-gray-900 dark:text-white">{post.title}</div>
                  </td>
                  <td className="p-5 text-gray-600 dark:text-gray-400 font-medium">{post.category}</td>
                  <td className="p-5 text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="p-5 text-center">
                    <button onClick={() => handleToggleStatus(post._id)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${post.isActive ? 'bg-green-500' : 'bg-gray-400'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${post.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="p-5 text-center flex justify-center gap-1">
                    {/* NÚT GHIM MỚI THÊM */}
                    <button 
                      onClick={() => handleTogglePin(post._id)} 
                      className={`p-2 rounded-lg transition-colors ${post.isPinned ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'text-gray-400 hover:text-orange-500'}`}
                      title={post.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
                    >
                      <i className={post.isPinned ? "ri-pushpin-fill text-lg" : "ri-pushpin-line text-lg"}></i>
                    </button>
                    <button onClick={() => handleOpenEdit(post)} className="text-blue-600 p-2"><i className="ri-edit-2-line text-lg"></i></button>
                    <button onClick={() => handleDelete(post._id)} className="text-red-500 p-2"><i className="ri-delete-bin-line text-lg"></i></button>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold dark:text-white">{isEditing ? 'Sửa Bài Viết' : 'Viết Bài Mới'}</h3>
              <button onClick={() => setShowForm(false)} className="text-2xl text-gray-400 hover:text-gray-600"><i className="ri-close-line"></i></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-1">Tiêu đề</label>
                  <input {...register('title', { required: true })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 outline-none dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-1">Chuyên mục</label>
                  <select {...register('category')} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 outline-none dark:text-white">
                    <option value="Tin tức">Tin tức</option>
                    <option value="Review Sách">Review Sách</option>
                    <option value="Góc Chia Sẻ">Góc Chia Sẻ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Ảnh đại diện</label>
                <div className="flex gap-2">
                  <input {...register('imageUrl')} className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 outline-none dark:text-white" />
                  <label className="cursor-pointer bg-gray-200 dark:bg-gray-700 px-4 py-3 rounded-xl font-bold flex items-center">
                    {isUploading ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-upload-cloud-2-line"></i>}
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </label>
                </div>
                {imagePreview && <img src={imagePreview} alt="Preview" className="h-32 object-cover mt-2 rounded-xl" />}
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Tóm tắt ngắn (Hiển thị ở trang ngoài)</label>
                <textarea {...register('summary')} rows="2" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 outline-none dark:text-white resize-none"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Nội dung chi tiết</label>
                <textarea {...register('content', { required: true })} rows="8" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 outline-none dark:text-white custom-scrollbar"></textarea>
              </div>

              <button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl disabled:opacity-50">
                {isSaving ? 'Đang lưu...' : 'Lưu Bài Viết'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default BlogManager;