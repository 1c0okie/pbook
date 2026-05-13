import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { bookService } from '../../services/book.service';
import { authorService } from '../../services/author.service';
import { categoryService } from '../../services/category.service';
import api from '../../utils/api';

const BookManager = () => {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Phân trang
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const imageUrlPreview = watch('imageUrl');

  // Load Data
  const fetchData = async (pageNumber = 1) => {
    try {
      setIsLoading(true);
      const [bookData, authorData, categoryData] = await Promise.all([
        bookService.getAll(pageNumber),
        authorService.getAll(),
        categoryService.getAll()
      ]);
      
      setBooks(bookData.books);
      setPage(bookData.page);
      setTotalPages(bookData.pages);
      
      setAuthors(authorData);
      setCategories(categoryData);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const handleOpenAddModal = () => {
    setEditingBook(null);
    reset({
      title: '', 
      description: '', // <-- THÊM VÀO ĐÂY
      price: '', 
      sale_price: 0, 
      quantityInStock: 0,
      author: '', 
      categories: [], 
      imageUrl: '',
      isTrending: false, 
      isFeatured: false, 
      isBestSeller: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book) => {
    setEditingBook(book);
    setValue('title', book.title);
    setValue('description', book.description || ''); // <-- THÊM VÀO ĐÂY
    setValue('price', book.price);
    setValue('sale_price', book.sale_price);
    setValue('quantityInStock', book.quantityInStock);
    setValue('imageUrl', book.imageUrl);
    setValue('isTrending', book.isTrending);
    setValue('isFeatured', book.isFeatured);
    setValue('isBestSeller', book.isBestSeller);
    
    // Xử lý select giá trị cũ
    setValue('author', book.author?._id || '');
    setValue('categories', book.categories.map(c => c._id));
    
    setIsModalOpen(true);
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsUploading(true);
      const { data } = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setValue('imageUrl', data.imageUrl);
      toast.success('Upload ảnh bìa thành công!');
    } catch (error) {
      toast.error('Lỗi upload ảnh');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data) => {
    data.price = Number(data.price);
    data.sale_price = Number(data.sale_price);
    data.quantityInStock = Number(data.quantityInStock);

    try {
      if (editingBook) {
        await bookService.update(editingBook._id, data);
        toast.success('Cập nhật sách thành công!');
      } else {
        await bookService.create(data);
        toast.success('Thêm sách mới thành công!');
      }
      setIsModalOpen(false);
      fetchData(page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa quyển sách này?')) {
      try {
        await bookService.delete(id);
        toast.success('Xóa sách thành công!');
        fetchData(page);
      } catch (error) {
        toast.error('Lỗi khi xóa!');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Kho Sách</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Quản lý toàn bộ sản phẩm trong hệ thống</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          <i className="ri-add-line text-xl"></i> Thêm Sách
        </button>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 text-sm uppercase tracking-wider">
                <th className="p-5 font-semibold">Sách</th>
                <th className="p-5 font-semibold">Tác giả</th>
                <th className="p-5 font-semibold">Giá bán</th>
                <th className="p-5 font-semibold">Kho</th>
                <th className="p-5 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr><td colSpan="5" className="text-center p-8 text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : books.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-8 text-gray-500">Kho sách trống.</td></tr>
              ) : (
                books.map((book) => (
                  <tr key={book._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                    <td className="p-5 flex items-center gap-4">
                      <div className="h-16 w-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                        {book.imageUrl ? (
                          <img src={book.imageUrl} alt={book.title} className="h-full w-full object-cover" />
                        ) : (
                          <i className="ri-book-line flex items-center justify-center h-full w-full text-gray-400"></i>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white line-clamp-1">{book.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {book.categories.map(c => c.name).join(', ')}
                        </p>
                      </div>
                    </td>
                    <td className="p-5 text-gray-600 dark:text-gray-400">
                      {book.author?.name || 'Đang cập nhật'}
                    </td>
                    <td className="p-5">
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {formatPrice(book.sale_price > 0 ? book.sale_price : book.price)}
                      </span>
                      {book.sale_price > 0 && (
                        <span className="block text-xs text-gray-400 line-through mt-0.5">{formatPrice(book.price)}</span>
                      )}
                    </td>
                    <td className="p-5">
                      {book.quantityInStock > 0 ? (
                        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                          Còn {book.quantityInStock}
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                          Hết hàng
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-right space-x-3">
                      <button onClick={() => handleOpenEditModal(book)} className="text-blue-500 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 p-2 rounded-lg">
                        <i className="ri-pencil-line"></i>
                      </button>
                      <button onClick={() => handleDelete(book._id)} className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 p-2 rounded-lg">
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-5 border-t border-gray-100 dark:border-gray-800">
            <button 
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Trang trước
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">Trang {page} / {totalPages}</span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>

      {/* Modal Form Lớn */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 my-8 relative">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingBook ? 'Cập nhật Sách' : 'Thêm Sách Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 text-2xl">
                <i className="ri-close-line"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cột 1: Thông tin cơ bản */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên sách <span className="text-red-500">*</span></label>
                    <input {...register('title', { required: true })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
                  </div>
                  
                  {/* Ô MÔ TẢ ĐƯỢC THÊM VÀO ĐÂY */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả sách</label>
                    <textarea 
                      rows="4" 
                      {...register('description')} 
                      placeholder="Nhập nội dung giới thiệu sách..."
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giá gốc <span className="text-red-500">*</span></label>
                      <input type="number" {...register('price', { required: true })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giá khuyến mãi</label>
                      <input type="number" {...register('sale_price')} defaultValue={0} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số lượng kho <span className="text-red-500">*</span></label>
                      <input type="number" {...register('quantityInStock', { required: true })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tác giả</label>
                      <select {...register('author')} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white">
                        <option value="">-- Chọn tác giả --</option>
                        {authors.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Cột 2: Danh mục, Ảnh, Tags */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Danh mục (Giữ Ctrl/Cmd để chọn nhiều)</label>
                    <select multiple {...register('categories')} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white h-24">
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ảnh bìa Sách</label>
                    <div className="flex items-center gap-4">
                      <div className="h-24 w-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shrink-0 shadow-sm">
                        {imageUrlPreview ? <img src={imageUrlPreview} alt="Preview" className="h-full w-full object-cover" /> : <i className="ri-image-add-line flex items-center justify-center h-full w-full text-gray-400 text-2xl"></i>}
                      </div>
                      <div className="flex-1">
                        <input type="file" onChange={uploadFileHandler} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 transition-colors cursor-pointer" />
                        <input type="hidden" {...register('imageUrl')} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600 mt-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Thẻ phân loại ưu tiên</p>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <input type="checkbox" {...register('isTrending')} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" /> Trending
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <input type="checkbox" {...register('isBestSeller')} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" /> Bán chạy
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <input type="checkbox" {...register('isFeatured')} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" /> Nổi bật
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Hủy</button>
                <button type="submit" disabled={isUploading} className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2">
                  <i className="ri-save-line"></i> {editingBook ? 'Lưu thay đổi' : 'Thêm Sách'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookManager;