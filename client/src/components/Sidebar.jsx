import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  HardDrive,
  Eraser,
  CheckCircle2,
  Trash2,
  RefreshCw,
  FileBarChart,
  History,
  Users,
  Settings,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { hasRole } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'IT_STAFF', 'MANAGER'] },
    { name: 'Asset Inventory', path: '/assets', icon: HardDrive, roles: ['ADMIN', 'IT_STAFF', 'MANAGER'] },
    { name: 'Data Wiping', path: '/wiping', icon: Eraser, roles: ['ADMIN', 'IT_STAFF', 'MANAGER'] },
    { name: 'Wiping Verification', path: '/verification', icon: CheckCircle2, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Disposal Management', path: '/disposal', icon: Trash2, roles: ['ADMIN', 'IT_STAFF', 'MANAGER'] },
    { name: 'Recycling Workflow', path: '/recycling', icon: RefreshCw, roles: ['ADMIN', 'IT_STAFF', 'MANAGER'] },
    { name: 'Reports', path: '/reports', icon: FileBarChart, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Audit Logs', path: '/audit-logs', icon: History, roles: ['ADMIN', 'IT_STAFF', 'MANAGER'] },
    { name: 'User Management', path: '/users', icon: Users, roles: ['ADMIN'] },
    { name: 'Profile / Settings', path: '/profile', icon: Settings, roles: ['ADMIN', 'IT_STAFF', 'MANAGER'] }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:z-auto flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800 lg:hidden">
          <span className="font-bold text-slate-100 font-display">Navigation</span>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-1 overflow-y-auto flex-1">
          <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            Core Modules
          </div>

          {navItems.map((item) => {
            if (!hasRole(...item.roles)) return null;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-900/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="text-[11px] text-slate-500 text-center font-medium">
            IT Disposal Platform v1.0 Enterprise
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
