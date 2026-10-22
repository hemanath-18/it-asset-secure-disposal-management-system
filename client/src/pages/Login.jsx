import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, Lock, Mail, ArrowRight, Server, UserCheck, ShieldAlert } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Please fill in both email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      showSuccess('Authentication successful! Welcome to the portal.');
      navigate('/dashboard');
    } catch (err) {
      showError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickLogin = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-2xl shadow-xl shadow-cyan-900/40 mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 font-display tracking-tight">
            IT Asset <span className="text-cyan-400">Secure Disposal</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Enterprise Lifecycle & Compliance Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Corporate Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@disposal.org"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Logins Section */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <p className="text-xs font-bold text-slate-400 text-center uppercase tracking-wider mb-3">
            Quick Demo Persona Login
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => fillQuickLogin('admin@disposal.org', 'Admin@123')}
              className="px-2 py-2 bg-slate-950 hover:bg-slate-800 border border-rose-900/40 rounded-xl text-rose-300 text-[11px] font-semibold flex flex-col items-center gap-1 transition-all"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => fillQuickLogin('itstaff@disposal.org', 'Staff@123')}
              className="px-2 py-2 bg-slate-950 hover:bg-slate-800 border border-cyan-900/40 rounded-xl text-cyan-300 text-[11px] font-semibold flex flex-col items-center gap-1 transition-all"
            >
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>IT Staff</span>
            </button>
            <button
              onClick={() => fillQuickLogin('manager@disposal.org', 'Manager@123')}
              className="px-2 py-2 bg-slate-950 hover:bg-slate-800 border border-amber-900/40 rounded-xl text-amber-300 text-[11px] font-semibold flex flex-col items-center gap-1 transition-all"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Manager</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
