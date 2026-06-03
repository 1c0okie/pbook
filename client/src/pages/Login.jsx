import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useAuthStore from '../store/auth.store';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google'; 
import toast from 'react-hot-toast';
import axios from 'axios';
import api from '../utils/api';

// Schema validation
const schema = yup.object().shape({
  email: yup.string()
    .trim() // Tự động xóa khoảng trắng ở 2 đầu nếu người dùng lỡ copy dư
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
    
  password: yup.string()
    .min(6, 'Mật khẩu phải từ 6 ký tự')
    .required('Vui lòng nhập mật khẩu'),
});

const Login = () => {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  // Đã mở comment setAuth để lưu thông tin user vào store sau khi Google Login thành công
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  // === CẤU HÌNH CUSTOM GOOGLE LOGIN ===
const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await api.post('/users/google', { 
          token: tokenResponse.access_token 
        });

        // QUAN TRỌNG: Lưu dữ liệu vào Zustand và LocalStorage
        if (res.data) {
          setAuth(res.data); // Gọi hàm này để cả hệ thống nhận diện User
          toast.success(`Chào mừng ${res.data.firstname} trở lại!`);
          navigate('/');
        }
      } catch (error) {
        toast.error('Lỗi đăng nhập Google');
      }
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      navigate('/'); 
    } catch (error) {
      // Lỗi đã được xử lý bằng Toast ở auth.store
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 sm:px-6 lg:px-8 transition-colors duration-500 overflow-hidden">
      
      {/* Background Blobs (Giữ nguyên) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/30 dark:bg-blue-600/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-indigo-400/30 dark:bg-indigo-600/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-400/30 dark:bg-pink-600/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-md w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-gray-700/50 p-8 sm:p-10">
        
        {/* Header */}
        <div className="text-center mb-10">
      
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
            Chào mừng trở lại
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Đăng nhập để tiếp tục khám phá kho sách của chúng tôi
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Email Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                <i className="ri-mail-line text-lg"></i>
              </div>
              <input 
                type="email" 
                {...register('email')}
                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-2 ${errors.email ? 'border-red-500 bg-red-50/50' : 'border-transparent focus:border-blue-500 hover:border-gray-200 dark:hover:border-gray-700'} focus:bg-white dark:focus:bg-gray-900 text-gray-900 dark:text-white transition-all outline-none font-medium placeholder:font-normal shadow-inner`}
                placeholder="Nhập email của bạn"
              />
            </div>
            {errors.email && <p className="mt-1.5 ml-1 text-xs font-semibold text-red-500 flex items-center gap-1"><i className="ri-error-warning-fill"></i> {errors.email.message}</p>}
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1 mr-1">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Mật khẩu</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
              <i className="ri-lock-line text-lg"></i>
              </div>
              <input 
                type="password" 
                {...register('password')}
                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-2 ${errors.password ? 'border-red-500 bg-red-50/50' : 'border-transparent focus:border-blue-500 hover:border-gray-200 dark:hover:border-gray-700'} focus:bg-white dark:focus:bg-gray-900 text-gray-900 dark:text-white transition-all outline-none font-medium placeholder:font-normal shadow-inner`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="mt-1.5 ml-1 text-xs font-semibold text-red-500 flex items-center gap-1"><i className="ri-error-warning-fill"></i> {errors.password.message}</p>}
          </div>

          {/* === NÚT ĐĂNG NHẬP CHÍNH === */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 flex justify-center items-center gap-2 mt-2"
          >
            {isLoading ? (
              <><i className="ri-loader-4-line animate-spin text-xl"></i> Đang xử lý...</>
            ) : (
              <> Đăng Nhập</>
            )}
          </button>

          {/* Dải phân cách */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            <span className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Hoặc tiếp tục với
            </span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          {/* === NÚT GOOGLE CUSTOM === */}
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            className="w-full bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 active:scale-[0.98] flex justify-center items-center gap-3"
          >
            <img 
              src="https://www.svgrepo.com/show/475656/google-color.svg" 
              alt="Google Logo" 
              className="w-6 h-6" 
            />
            Đăng nhập bằng Google
          </button>
          
          {/* Link Đăng ký */}
          <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 mt-8">
            Bạn chưa có tài khoản?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 hover:underline transition-colors">
              Đăng ký ngay
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
};

export default Login;