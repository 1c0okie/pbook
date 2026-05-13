import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/auth.store';

const AdminRoute = () => {
  const user = useAuthStore((state) => state.user);
  return user && user.isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;