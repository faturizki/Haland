import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { AppRole } from '../../shared/types';

interface AuthGuardProps {
  allowedRoles?: AppRole[];
}

export const AuthGuard = ({ allowedRoles }: AuthGuardProps) => {
  const { isAuthenticated, role, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return <div className="surface-card">Loading session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
