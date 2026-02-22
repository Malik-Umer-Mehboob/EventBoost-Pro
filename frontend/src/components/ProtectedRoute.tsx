import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the user's specific dashboard instead of a generic /dashboard
    const dashboardPath = 
      user.role === 'admin' ? '/admin/dashboard' :
      user.role === 'organizer' ? '/organizer-dashboard' :
      '/user/dashboard';
    
    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
