import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Modal from '../components/Modal';
import { ASSET_TYPES, ASSET_CONDITIONS, DEPARTMENTS, STATUS_COLORS } from '../utils/constants';
import { formatDate } from '../utils/formatters';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  HardDrive,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Transition modal state
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchAssets = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        department: departmentFilter || undefined,
        condition: conditionFilter || undefined
      };
      const res = await API.get('/assets', { params });
      setAssets(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
      setError(err.response?.data?.message || 'Failed to load asset inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets(1);
  }, [search, statusFilter, typeFilter, departmentFilter, conditionFilter]);

  const handleStatusTransition = async (e) => {
    e.preventDefault();
    if (!selectedAsset || !targetStatus) return;

    setIsTransitioning(true);
    try {
      const res = await API.patch(`/assets/${selectedAsset._id}/status`, {
        targetStatus,
        reason: statusReason
      });
      showSuccess(res.data.message || `Asset status transitioned to ${targetStatus}`);
      setSelectedAsset(null);
      setTargetStatus('');
      setStatusReason('');
      fetchAssets(pagination.page);
    } catch (err) {
      showError(err.response?.data?.message || 'Status transition failed.');
    } finally {
      setIsTransitioning(false);
    }
  };

  const allowedNextStatuses = (currentStatus) => {
    const map = {
      REGISTERED: ['IN_USE', 'PENDING_DISPOSAL'],
      IN_USE: ['PENDING_DISPOSAL'],
      PENDING_DISPOSAL: ['DATA_WIPING', 'IN_USE'],
      WIPING_FAILED: ['DATA_WIPING', 'PENDING_DISPOSAL'],
      WIPING_VERIFIED: ['DISPOSAL_APPROVED'],
      DISPOSAL_APPROVED: ['REUSE', 'REFURBISH', 'RECYCLE', 'RESELL', 'DESTROY'],
      DESTROY: ['DISPOSAL_COMPLETED'],
      RECYCLE: ['DISPOSAL_COMPLETED'],
      REUSE: ['DISPOSAL_COMPLETED', 'IN_USE'],
      REFURBISH: ['DISPOSAL_COMPLETED', 'REUSE'],
      RESELL: ['DISPOSAL_COMPLETED'],
      DISPOSAL_COMPLETED: ['ARCHIVED']
    };
    return map[currentStatus] || [];
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 font-display tracking-tight">
            IT Asset Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Register, monitor, and manage organizational hardware across the lifecycle.
          </p>
        </div>

        {hasRole('ADMIN', 'IT_STAFF') && (
          <Link
            to="/assets/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-900/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Asset</span>
          </Link>
        )}
      </div>

      {/* Filter Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Asset ID, Serial, Model, Brand..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Lifecycle Statuses</option>
            <option value="REGISTERED">REGISTERED</option>
            <option value="IN_USE">IN_USE</option>
            <option value="PENDING_DISPOSAL">PENDING_DISPOSAL</option>
            <option value="DATA_WIPING">DATA_WIPING</option>
            <option value="WIPING_COMPLETED">WIPING_COMPLETED</option>
            <option value="WIPING_FAILED">WIPING_FAILED</option>
            <option value="WIPING_VERIFIED">WIPING_VERIFIED</option>
            <option value="DISPOSAL_APPROVED">DISPOSAL_APPROVED</option>
            <option value="RECYCLE">RECYCLE</option>
            <option value="REUSE">REUSE</option>
            <option value="DESTROY">DESTROY</option>
            <option value="DISPOSAL_COMPLETED">DISPOSAL_COMPLETED</option>
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Asset Types</option>
            {ASSET_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Department filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Table */}
      {loading ? (
        <LoadingSpinner message="Querying asset inventory database..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchAssets(1)} />
      ) : assets.length === 0 ? (
        <EmptyState
          title="No assets found"
          description="Try modifying your search keywords or active status filters."
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Asset ID / Serial</th>
                  <th className="px-6 py-4">Brand & Model</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Condition</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {assets.map((asset) => (
                  <tr key={asset._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium">
                      <div className="text-slate-100 font-bold">{asset.assetId}</div>
                      <div className="text-[11px] text-slate-500">{asset.serialNumber}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <div className="text-slate-200">{asset.brand} {asset.model}</div>
                      <div className="text-[11px] text-slate-500">{asset.assignedEmployee || 'Unassigned'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-semibold">
                        {asset.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{asset.department}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        asset.condition === 'Excellent' || asset.condition === 'Good'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : asset.condition === 'Fair'
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-rose-400 bg-rose-500/10'
                      }`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/assets/${asset._id}`}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {hasRole('ADMIN', 'IT_STAFF') && (
                          <Link
                            to={`/assets/edit/${asset._id}`}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Asset"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        )}

                        {allowedNextStatuses(asset.status).length > 0 && hasRole('ADMIN', 'IT_STAFF', 'MANAGER') && (
                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setTargetStatus(allowedNextStatuses(asset.status)[0]);
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Advance Workflow Status"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(p) => fetchAssets(p)}
          />
        </div>
      )}

      {/* Transition Status Modal */}
      <Modal
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        title={`Advance Status: ${selectedAsset?.assetId}`}
      >
        {selectedAsset && (
          <form onSubmit={handleStatusTransition} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Current Status
              </label>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <StatusBadge status={selectedAsset.status} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Select Target Lifecycle State
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              >
                {allowedNextStatuses(selectedAsset.status).map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Reason / Workflow Justification
              </label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="State reason for advancing asset status..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 h-24"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isTransitioning}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-900/30 flex items-center gap-2"
              >
                {isTransitioning && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                Confirm Status Change
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Assets;
