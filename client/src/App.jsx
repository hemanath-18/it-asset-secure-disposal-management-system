import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import { ProtectedRoute, RoleGuard } from './components/RoleGuard';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import AssetDetails from './pages/AssetDetails';
import AssetForm from './pages/AssetForm';
import DataWiping from './pages/DataWiping';
import Verification from './pages/Verification';
import Disposal from './pages/Disposal';
import Recycling from './pages/Recycling';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import UserManagement from './pages/UserManagement';
import ProfileSettings from './pages/ProfileSettings';
import NotFound from './pages/NotFound';

export const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Dashboard Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/assets/:id" element={<AssetDetails />} />
                
                {/* Admin / IT Staff Only */}
                <Route element={<RoleGuard allowedRoles={['ADMIN', 'IT_STAFF']} />}>
                  <Route path="/assets/new" element={<AssetForm />} />
                  <Route path="/assets/edit/:id" element={<AssetForm />} />
                </Route>

                <Route path="/wiping" element={<DataWiping />} />

                {/* Admin / Manager Only */}
                <Route element={<RoleGuard allowedRoles={['ADMIN', 'MANAGER']} />}>
                  <Route path="/verification" element={<Verification />} />
                </Route>

                <Route path="/disposal" element={<Disposal />} />
                <Route path="/recycling" element={<Recycling />} />

                {/* Admin / Manager Only */}
                <Route element={<RoleGuard allowedRoles={['ADMIN', 'MANAGER']} />}>
                  <Route path="/reports" element={<Reports />} />
                </Route>

                <Route path="/audit-logs" element={<AuditLogs />} />

                {/* Admin Only */}
                <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
                  <Route path="/users" element={<UserManagement />} />
                </Route>

                <Route path="/profile" element={<ProfileSettings />} />
              </Route>
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
