import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900/40 text-rose-400 mb-4">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-bold text-slate-100 font-display">404 - Page Not Found</h1>
      <p className="text-sm text-slate-400 max-w-sm mt-2 mb-6">
        The requested resource path does not exist in the IT Asset Disposal portal.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-900/30 transition-all"
      >
        <Home className="w-4 h-4" />
        <span>Return to Operations Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFound;
