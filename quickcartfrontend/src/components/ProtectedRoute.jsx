import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// role: 'CUSTOMER' | 'ADMIN'
export default function ProtectedRoute({ role }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role === 'ADMIN' && user.role !== 'ADMIN') {
    return <Navigate to="/" replace state={{ notAuthorised: true }} />;
  }

  if (role === 'CUSTOMER' && user.role === 'ADMIN') {
    return <Navigate to="/admin/orders" replace />;
  }

  return <Outlet />;
}