import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Section 10.5: /login and /register redirect logged-in users away.
export default function GuestRoute() {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    const target = isAdmin ? '/admin/orders' : location.state?.from || '/';
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}