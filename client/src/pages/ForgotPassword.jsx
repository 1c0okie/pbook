import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userService } from '../services/user.service';

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const res = await userService.forgotPassword(data.email);
      toast.success(res.message);
      setIsSent(true); // Đổi UI sang màn hình báo thành công
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="bg-white dark:bg-gray-900 max-w-md w-full p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 text-center animate-fade-in">
        
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className={isSent ? "ri-mail-send-line text-3xl" : "ri-lock-unlock-line text-3xl"}></i>
        </div>

        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
          {isSent ? 'Kiểm tra hộp thư' : 'Quên mật khẩu?'}
        </h2>
        <p className="text-gray-500 mb-8 text-sm">
          {isSent 
            ? 'Chúng tôi đã gửi link khôi phục vào email của bạn. Vui lòng kiểm tra cả hộp thư rác (Spam).' 
            : 'Đừng lo lắng, hãy nhập email bạn đã đăng ký để nhận link tạo mật khẩu mới.'}
        </p>

        {!isSent && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email của bạn</label>
              <input 
                type="email" 
                {...register('email', { required: 'Vui lòng nhập email' })}
                className="w-full px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                placeholder="Ví dụ: nva@gmail.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-70"
            >
              {isLoading ? <i className="ri-loader-4-line animate-spin text-lg"></i> : 'Gửi Yêu Cầu'}
            </button>
          </form>
        )}

        <div className="mt-8 text-sm">
          <Link to="/login" className="text-gray-500 hover:text-blue-600 font-bold transition-colors">
            <i className="ri-arrow-left-line"></i> Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;