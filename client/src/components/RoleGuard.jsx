import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Authenticating session..." />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const RoleGuard = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Checking permissions..." />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 m-6">
        <h2 className="text-xl font-bold text-rose-400">Access Restricted</h2>
        <p className="text-sm text-slate-400 mt-2">
          Your role ({user?.role || 'Guest'}) does not have permission to view this page.
        </p>
      </div>
    );
  }

  return <Outlet />;
};
