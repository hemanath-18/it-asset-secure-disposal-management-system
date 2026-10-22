import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Key, Building, CheckCircle2, Server } from 'lucide-react';

export const ProfileSettings = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 font-display tracking-tight">
          User Profile & Security Governance
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review active session parameters, user role privileges, and authentication token details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 md:col-span-1 text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-cyan-900/30">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 font-display">{user?.name}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
          <div className="inline-block px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-bold">
            {user?.role}
          </div>
        </div>

        {/* Account Privileges */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl md:col-span-2 space-y-6">
          <h3 className="text-sm font-bold text-slate-200 font-display flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-cyan-400" />
            Security & Permission Profile
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-slate-500 block mb-1">Department:</span>
              <span className="font-semibold text-slate-200">{user?.department || 'IT Operations'}</span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-slate-500 block mb-1">Account Status:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Verified
              </span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-slate-500 block mb-1">Authentication Method:</span>
              <span className="font-semibold text-slate-200">JWT Token (HMAC SHA-256)</span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-slate-500 block mb-1">Passphrase Hash:</span>
              <span className="font-mono text-slate-400 text-[11px]">Bcrypt Salt (10 rounds)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Role Matrix Capabilities</h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
              {user?.role === 'ADMIN' && (
                <>
                  <li>Full system read/write access to all hardware assets and wiping logs.</li>
                  <li>User account provisioning, RBAC role assignment, and account deactivation.</li>
                  <li>Disposal method approval, recycling certificate verification, and report exports.</li>
                </>
              )}
              {user?.role === 'IT_STAFF' && (
                <>
                  <li>Register new IT assets and update hardware specifications.</li>
                  <li>Initiate data wiping operations and record sanitization evidence references.</li>
                  <li>Execute approved disposal methods and manage e-waste recycling records.</li>
                </>
              )}
              {user?.role === 'MANAGER' && (
                <>
                  <li>QA inspection desk: Verify data wiping logs and sanitization evidence.</li>
                  <li>Review and grant formal approval for asset disposal requests.</li>
                  <li>Access executive dashboard, compliance matrices, and audit logs.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
