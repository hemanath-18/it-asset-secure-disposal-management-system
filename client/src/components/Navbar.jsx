import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, LogOut, Menu, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    if (role === 'ADMIN') return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    if (role === 'MANAGER') return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-xl shadow-lg shadow-cyan-900/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-100 font-display hidden sm:inline-block tracking-tight">
            IT Asset <span className="text-cyan-400">Disposal</span> Engine
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-200 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-slate-400">{user?.email}</p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadge(user?.role)} ml-1`}>
            {user?.role}
          </span>
        </div>

        <Link
          to="/profile"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          title="Profile Settings"
        >
          <User className="w-5 h-5" />
        </Link>

        <button
          onClick={logout}
          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl border border-rose-900/40 transition-colors flex items-center gap-2 text-xs font-semibold"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
