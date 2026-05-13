import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userService } from '../services/user.service';

const ResetPassword = () => {
  const { token } = useParams(); // Lấy token từ URL (VD: /reset-password/abc123xyz)
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      return toast.error('Mật khẩu không khớp!');
    }

    try {
      setIsLoading(true);
      const res = await userService.resetPassword(token, data.password);
      toast.success(res.message);
      navigate('/login'); // Đổi xong đá thẳng về trang Đăng nhập
    } catch (error) {
      toast.error(error.response?.data?.message || 'Link đã hết hạn hoặc không hợp lệ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="bg-white dark:bg-gray-900 max-w-md w-full p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 animate-fade-in">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 text-center">Tạo Mật Khẩu Mới</h2>
        <p className="text-gray-500 mb-8 text-sm text-center">Mật khẩu mới của bạn phải khác với các mật khẩu trước đây.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mật khẩu mới</label>
            <input 
              type="password" 
              {...register('password', { required: 'Vui lòng nhập mật khẩu mới', minLength: { value: 6, message: 'Ít nhất 6 ký tự' } })}
              className="w-full px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Xác nhận lại</label>
            <input 
              type="password" 
              {...register('confirmPassword', { required: 'Vui lòng xác nhận mật khẩu' })}
              className="w-full px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-70 mt-2"
          >
            {isLoading ? <i className="ri-loader-4-line animate-spin text-lg"></i> : 'Xác Nhận'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;