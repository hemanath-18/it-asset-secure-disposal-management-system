import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('disposal_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (user?.token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            const updated = { ...user, ...res.data.data };
            setUser(updated);
            localStorage.setItem('disposal_user', JSON.stringify(updated));
          }
        } catch (err) {
          console.error('Session validation failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    if (res.data.success) {
      const userData = res.data.data;
      setUser(userData);
      localStorage.setItem('disposal_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('disposal_user');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isITStaff = user?.role === 'IT_STAFF';
  const isManager = user?.role === 'MANAGER';

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin,
        isITStaff,
        isManager,
        hasRole,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
