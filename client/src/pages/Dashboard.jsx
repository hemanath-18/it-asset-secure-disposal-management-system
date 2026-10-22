import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import StatCard from '../components/StatCard';
import Timeline from '../components/Timeline';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import {
  HardDrive,
  CheckCircle,
  AlertTriangle,
  Eraser,
  ShieldCheck,
  CheckSquare,
  RefreshCw,
  RotateCcw,
  Flame,
  PieChart as PieIcon,
  BarChart as BarIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resStats, resCharts] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/dashboard/charts')
      ]);
      setStats(resStats.data.data);
      setCharts(resCharts.data.data);
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
      setError(err.response?.data?.message || 'Unable to load real-time analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner message="Calculating real-time database metrics..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboardData} />;

  const PIE_COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 font-display tracking-tight">
          Executive Operations Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time lifecycle monitoring, wiping status verification, and compliance metrics.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Assets"
          value={stats?.totalAssets || 0}
          icon={HardDrive}
          color="indigo"
          subtext="In Inventory"
        />
        <StatCard
          title="Active Assets"
          value={stats?.activeAssets || 0}
          icon={CheckCircle}
          color="emerald"
          subtext="Registered / In Use"
        />
        <StatCard
          title="Pending Disposal"
          value={stats?.pendingDisposal || 0}
          icon={AlertTriangle}
          color="amber"
          subtext="Awaiting Wiping"
        />
        <StatCard
          title="Data Wiping"
          value={stats?.dataWiping || 0}
          icon={Eraser}
          color="cyan"
          subtext="In Progress / Complete"
        />
        <StatCard
          title="Awaiting Verify"
          value={stats?.awaitingVerification || 0}
          icon={ShieldCheck}
          color="purple"
          subtext="Pending QA Review"
        />
        <StatCard
          title="Disposal Approved"
          value={stats?.disposalApproved || 0}
          icon={CheckSquare}
          color="indigo"
          subtext="Ready for Execution"
        />
        <StatCard
          title="Recycled"
          value={stats?.recycled || 0}
          icon={RefreshCw}
          color="emerald"
          subtext="E-Waste Processed"
        />
        <StatCard
          title="Reused / Refurb"
          value={stats?.reused || 0}
          icon={RotateCcw}
          color="amber"
          subtext="Reassigned Internal"
        />
        <StatCard
          title="Destroyed"
          value={stats?.destroyed || 0}
          icon={Flame}
          color="rose"
          subtext="Physical Shredded"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Status Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 font-display flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              Asset Status Distribution
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">MongoDB Aggregate</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.statusDistribution || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {(charts?.statusDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Type Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 font-display flex items-center gap-2">
              <BarIcon className="w-4 h-4 text-indigo-400" />
              Hardware Category & Type Breakdown
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Real-time Stats</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.typeDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Charts & Timeline Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disposal Method Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-200 font-display flex items-center gap-2 mb-4">
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            Approved Disposal Methods
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={charts?.disposalMethodDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 11 }} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audit Activity Stream */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 font-display flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Recent Compliance & Audit Activity Stream
            </h3>
            <span className="text-xs text-slate-500 font-medium">Live Audit Log</span>
          </div>
          <Timeline logs={charts?.recentLogs || []} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
