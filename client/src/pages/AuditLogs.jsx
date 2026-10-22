import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import Timeline from '../components/Timeline';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { formatDateTime } from '../utils/formatters';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  UserCheck,
  FileText
} from 'lucide-react';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/audit-logs', {
        params: {
          page,
          limit: 20,
          search: search || undefined,
          action: actionFilter || undefined,
          userRole: roleFilter || undefined
        }
      });
      setLogs(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      setError('Unable to query audit logs database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [search, actionFilter, roleFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 font-display tracking-tight">
          System Immutable Audit Trail
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Cryptographically recorded log stream of asset modifications, status changes, and user actions.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, description..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="">All Operator Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="IT_STAFF">IT_STAFF</option>
          <option value="MANAGER">MANAGER</option>
        </select>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        >
          <option value="">All Action Types</option>
          <option value="ASSET_REGISTERED">ASSET_REGISTERED</option>
          <option value="STATUS_CHANGED">STATUS_CHANGED</option>
          <option value="WIPING_STARTED">WIPING_STARTED</option>
          <option value="WIPING_COMPLETED">WIPING_COMPLETED</option>
          <option value="WIPING_VERIFIED">WIPING_VERIFIED</option>
          <option value="DISPOSAL_APPROVED">DISPOSAL_APPROVED</option>
          <option value="RECYCLING_COMPLETED">RECYCLING_COMPLETED</option>
          <option value="USER_LOGIN">USER_LOGIN</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner message="Querying immutable audit logs..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchLogs(1)} />
      ) : logs.length === 0 ? (
        <EmptyState title="No audit logs recorded" description="No audit entries match the current filter options." />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            <Timeline logs={logs} />
          </div>
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(p) => fetchLogs(p)}
          />
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
