
import { Navigate, Outlet } from 'react-router-dom';

export default function AuthLayout() {
  // Remplacer par votre logique d'authentification
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}