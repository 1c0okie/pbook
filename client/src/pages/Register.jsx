import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useAuthStore from '../store/auth.store';
import { useNavigate, Link } from 'react-router-dom';

// Schema validation
const schema = yup.object().shape({
  firstname: yup.string().required('Vui lòng nhập Tên'),
  lastname: yup.string().required('Vui lòng nhập Họ'),
  email: yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
  password: yup.string().min(6, 'Mật khẩu phải từ 6 ký tự').required('Vui lòng nhập mật khẩu'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Mật khẩu xác nhận không khớp')
    .required('Vui lòng xác nhận mật khẩu'),
});

const Register = () => {
  const registerAction = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await registerAction({
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        password: data.password
      });
      navigate('/');
    } catch (error) {
      // Lỗi xử lý qua Toast
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 sm:px-6 lg:px-8 transition-colors duration-500 overflow-hidden py-12">
      
      {/* =========================================
          HIỆU ỨNG NỀN BLUR (BACKGROUND BLOBS)
          ========================================= */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-400/30 dark:bg-blue-600/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-400/30 dark:bg-purple-600/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      {/* =========================================
          FORM ĐĂNG KÝ (GLASSMORPHISM CARD)
          ========================================= */}
      <div className="relative z-10 max-w-xl w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-gray-700/50 p-8 sm:p-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
            Tạo tài khoản mới
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tham gia cộng đồng yêu sách của chúng tôi ngay hôm nay
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Row: Họ và Tên */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Họ */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Họ</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <i className="ri-user-line text-lg"></i>
                </div>
                <input 
                  type="text" 
                  {...register('lastname')}
                  className={`w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-2 ${errors.lastname ? 'border-red-500 bg-red-50/50' : 'border-transparent focus:border-blue-500 hover:border-gray-200 dark:hover:border-gray-700'} focus:bg-white dark:focus:bg-gray-900 text-gray-900 dark:text-white transition-all outline-none font-medium placeholder:font-normal shadow-inner`}
                  placeholder="VD: Nguyễn"
                />
              </div>
              {errors.lastname && <p className="mt-1.5 ml-1 text-xs font-semibold text-red-500 flex items-center gap-1"><i className="ri-error-warning-fill"></i> {errors.lastname.message}</p>}
            </div>

            {/* Tên */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Tên</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <i className="ri-user-star-line text-lg"></i>
                </div>
                <input 
                  type="text" 
                  {...register('firstname')}
                  className={`w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-2 ${errors.firstname ? 'border-red-500 bg-red-50/50' : 'border-transparent focus:border-blue-500 hover:border-gray-200 dark:hover:border-gray-700'} focus:bg-white dark:focus:bg-gray-900 text-gray-900 dark:text-white transition-all outline-none font-medium placeholder:font-normal shadow-inner`}
                  placeholder="VD: Văn A"
                />
              </div>
              {errors.firstname && <p className="mt-1.5 ml-1 text-xs font-semibold text-red-500 flex items-center gap-1"><i className="ri-error-warning-fill"></i> {errors.firstname.message}</p>}
            </div>
          </div>

          {/* Email */}
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
                placeholder="email@example.com"
              />
            </div>
            {errors.email && <p className="mt-1.5 ml-1 text-xs font-semibold text-red-500 flex items-center gap-1"><i className="ri-error-warning-fill"></i> {errors.email.message}</p>}
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Mật khẩu</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                <i className="ri-lock-line text-lg"></i>
              </div>
              <input 
                type="password" 
                {...register('password')}
                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-2 ${errors.password ? 'border-red-500 bg-red-50/50' : 'border-transparent focus:border-blue-500 hover:border-gray-200 dark:hover:border-gray-700'} focus:bg-white dark:focus:bg-gray-900 text-gray-900 dark:text-white transition-all outline-none font-medium placeholder:font-normal shadow-inner`}
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>
            {errors.password && <p className="mt-1.5 ml-1 text-xs font-semibold text-red-500 flex items-center gap-1"><i className="ri-error-warning-fill"></i> {errors.password.message}</p>}
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Xác nhận mật khẩu</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                <i className="ri-shield-check-line text-lg"></i>
              </div>
              <input 
                type="password" 
                {...register('confirmPassword')}
                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-2 ${errors.confirmPassword ? 'border-red-500 bg-red-50/50' : 'border-transparent focus:border-blue-500 hover:border-gray-200 dark:hover:border-gray-700'} focus:bg-white dark:focus:bg-gray-900 text-gray-900 dark:text-white transition-all outline-none font-medium placeholder:font-normal shadow-inner`}
                placeholder="Nhập lại mật khẩu"
              />
            </div>
            {errors.confirmPassword && <p className="mt-1.5 ml-1 text-xs font-semibold text-red-500 flex items-center gap-1"><i className="ri-error-warning-fill"></i> {errors.confirmPassword.message}</p>}
          </div>

          {/* Nút Đăng Ký */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 flex justify-center items-center gap-2 mt-4"
          >
            {isLoading ? (
              <><i className="ri-loader-4-line animate-spin text-xl"></i> Đang xử lý...</>
            ) : (
              <><i className="ri-user-add-line text-xl"></i> Đăng Ký Tài Khoản</>
            )}
          </button>
          
          <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 mt-6">
            Bạn đã có tài khoản?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 hover:underline transition-colors">
              Đăng nhập ngay
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;