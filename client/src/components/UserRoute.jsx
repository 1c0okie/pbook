import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/auth.store';

const UserRoute = () => {
  const user = useAuthStore((state) => state.user);
  
  // Nếu đã đăng nhập và LÀ ADMIN -> Đá văng về trang Dashboard của Admin
  return user && user.isAdmin ? <Navigate to="/admin/dashboard" replace /> : <Outlet />;
};

export default UserRoute;