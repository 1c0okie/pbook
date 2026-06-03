import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom'; 
import { couponService } from '../../services/coupon.service';

const CouponManager = () => {
  const today = new Date().toISOString().split('T')[0];
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('q') || '';

  const filteredCoupons = coupons.filter(coupon => 
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const data = await couponService.getAll();
      setCoupons(data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách mã giảm giá');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const onSubmit = async (data) => {
    try {
      setIsCreating(true);
      await couponService.create(data);
      toast.success('Tạo mã giảm giá thành công');
      reset(); 
      fetchCoupons(); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi tạo mã');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã này?')) {
      try {
        await couponService.delete(id);
        toast.success('Đã xóa mã giảm giá');
        fetchCoupons();
      } catch (error) {
        toast.error('Lỗi khi xóa mã');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const data = await couponService.toggleStatus(id);
      toast.success(data.message);
      fetchCoupons();
    } catch (error) {
      toast.error('Lỗi khi thay đổi trạng thái');
    }
  };

  const handleToggleShowHome = async (id) => {
    try {
      const data = await couponService.toggleShowOnHome(id);
      toast.success('Đã cập nhật hiển thị trang chủ');
      fetchCoupons();
    } catch (error) {
      toast.error('Lỗi khi thay đổi hiển thị');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý Mã Giảm Giá</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Tạo và kiểm soát các chiến dịch khuyến mãi</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Tạo mã mới</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mã (Code)</label>
                <input 
                  {...register('code', { required: 'Vui lòng nhập mã' })}
                  placeholder="VD: TET2026"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-gray-900 dark:text-white uppercase"
                />
                {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
              </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phần trăm giảm (%)</label>
                <input 
                  type="number"
                  {...register('discount', { 
                    required: 'Vui lòng nhập % giảm', 
                    min: { value: 1, message: 'Mức giảm tối thiểu là 1%' }, 
                    max: { value: 99, message: 'Mức giảm tối đa không được vượt quá 99%' } 
                  })}
                  placeholder="VD: 15"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                />
                {errors.discount && <p className="text-red-500 text-xs mt-1 font-medium">{errors.discount.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày hết hạn</label>
                <input 
                  type="date"
                  min={today}
                  {...register('expiryDate', { required: 'Vui lòng chọn ngày hết hạn' })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                />
              </div>

              <button 
                type="submit"
                disabled={isCreating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-colors disabled:opacity-50 mt-2"
              >
                {isCreating ? 'Đang tạo...' : 'Thêm Mã Khuyến Mãi'}
              </button>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 text-sm uppercase tracking-wider">
                    <th className="p-5 font-semibold">Mã (Code)</th>
                    <th className="p-5 font-semibold">Mức giảm</th>
                    <th className="p-5 font-semibold">Hạn sử dụng</th>
                    <th className="p-5 font-semibold text-center">Hoạt động</th>
                    <th className="p-5 font-semibold text-center">Hiện Trang chủ</th>
                    <th className="p-5 font-semibold text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {isLoading ? (
                    <tr><td colSpan="6" className="text-center p-8 text-gray-500">Đang tải dữ liệu...</td></tr>
                  ) : filteredCoupons.length === 0 ? (
                    <tr><td colSpan="6" className="text-center p-8 text-gray-500">Không tìm thấy mã giảm giá nào.</td></tr>
                  ) : (
                    filteredCoupons.map((coupon) => {
                      // KIỂM TRA MÃ ĐÃ HẾT HẠN HAY CHƯA
                      const isExpired = new Date(coupon.expiryDate) < new Date();
                      
                      return (
                        <tr key={coupon._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="p-5 font-bold text-gray-900 dark:text-white uppercase">
                            {coupon.code}
                          </td>
                          <td className="p-5 font-bold text-blue-600 dark:text-blue-400">
                            {coupon.discount}%
                          </td>
                          <td className="p-5 text-gray-600 dark:text-gray-400 text-sm">
                            {new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}
                            {isExpired && <span className="block text-red-500 text-xs mt-1">Đã hết hạn</span>}
                          </td>
                          
                          {/* Nút bật tắt kích hoạt */}
                          <td className="p-5 text-center">
                            <button 
                              onClick={() => handleToggleStatus(coupon._id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${coupon.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${coupon.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </td>
                          
                          {/* NÚT BẬT TẮT HIỂN THỊ TRANG CHỦ (ĐÃ SỬA) */}
                          <td className="p-5 text-center">
                            <button 
                              disabled={isExpired}
                              title={isExpired ? "Mã đã hết hạn, không thể hiển thị" : "Bật/tắt hiển thị trang chủ"}
                              onClick={() => handleToggleShowHome(coupon._id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isExpired ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${coupon.isShowOnHome ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${coupon.isShowOnHome ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </td>

                          <td className="p-5 text-center">
                            <button 
                              onClick={() => handleDelete(coupon._id)}
                              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                              title="Xóa mã"
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
        </div>

      </div>
    </div>
  );
};

export default CouponManager;