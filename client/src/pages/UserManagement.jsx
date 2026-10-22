import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { DEPARTMENTS } from '../utils/constants';
import { Users, Plus, Shield, CheckCircle, XCircle, Edit } from 'lucide-react';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'IT_STAFF',
    department: 'IT'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showSuccess, showError } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Unable to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post('/users', formData);
      showSuccess('User account created successfully');
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', role: 'IT_STAFF', department: 'IT' });
      fetchUsers();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create user account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      await API.put(`/users/${user._id}`, { isActive: !user.isActive });
      showSuccess(`User account ${!user.isActive ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (err) {
      showError('Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 font-display tracking-tight">
            User Account & RBAC Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Provision user accounts and assign Role-Based Access Control permissions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-900/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching user accounts database..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchUsers} />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" description="Click 'Provision New User' to add account." />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User Name</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-mono">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        u.role === 'ADMIN'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : u.role === 'MANAGER'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{u.department}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${u.isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleUserStatus(u)}
                        className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all ${
                          u.isActive ? 'bg-slate-800 hover:bg-rose-950/40 text-rose-400 border border-rose-900/40' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Provision New User Account"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. John Doe"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Corporate Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@disposal.org"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••••••"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">System Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 font-semibold"
                required
              >
                <option value="IT_STAFF">IT_STAFF (Asset Wiping/Ops)</option>
                <option value="MANAGER">MANAGER (Approvals/Audit)</option>
                <option value="ADMIN">ADMIN (Full Control)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500"
                required
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-lg shadow-cyan-900/30 flex items-center gap-2"
            >
              {isSubmitting && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
              Create Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
