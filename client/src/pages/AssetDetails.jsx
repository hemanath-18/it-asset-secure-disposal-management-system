import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import Timeline from '../components/Timeline';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { formatDate, formatDateTime } from '../utils/formatters';
import {
  HardDrive,
  ShieldCheck,
  Eraser,
  Trash2,
  RefreshCw,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Building,
  CheckCircle,
  AlertTriangle,
  FileText,
  ExternalLink
} from 'lucide-react';

export const AssetDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssetDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/assets/${id}`);
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch asset details:', err);
      setError(err.response?.data?.message || 'Asset details not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetDetails();
  }, [id]);

  if (loading) return <LoadingSpinner message="Fetching asset specification and lifecycle history..." />;
  if (error) return <ErrorState message={error} onRetry={fetchAssetDetails} />;

  const { asset, wipingRecord, disposalRecord, recyclingRecord, auditLogs, complianceStatus } = data;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/assets"
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-100 font-display">{asset.assetId}</h1>
              <StatusBadge status={asset.status} size="lg" />
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                complianceStatus === 'COMPLIANT'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : complianceStatus === 'REQUIRES_REVIEW'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                Compliance: {complianceStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {asset.brand} {asset.model} • Serial: <span className="font-mono text-slate-200">{asset.serialNumber}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/assets/edit/${asset._id}`}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            Edit Specifications
          </Link>
        </div>
      </div>

      {/* Main Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Specs Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 font-display flex items-center gap-2 border-b border-slate-800 pb-3">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            Hardware & Assignment Specs
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Asset Type:</span>
              <span className="font-semibold text-slate-200">{asset.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="font-semibold text-slate-200">{asset.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Department:</span>
              <span className="font-semibold text-slate-200">{asset.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Employee:</span>
              <span className="font-semibold text-slate-200">{asset.assignedEmployee || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Physical Location:</span>
              <span className="font-semibold text-slate-200">{asset.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Physical Condition:</span>
              <span className="font-semibold text-emerald-400">{asset.condition}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Purchase Date:</span>
              <span className="font-semibold text-slate-200">{formatDate(asset.purchaseDate)}</span>
            </div>
          </div>
        </div>

        {/* Data Wiping Record Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 font-display flex items-center gap-2 border-b border-slate-800 pb-3">
            <Eraser className="w-4 h-4 text-cyan-400" />
            Data Sanitization Record
          </h3>
          {wipingRecord ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Wiping Method:</span>
                <span className="font-semibold text-cyan-400">{wipingRecord.wipingMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Operator:</span>
                <span className="font-semibold text-slate-200">{wipingRecord.operator?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Wiping Status:</span>
                <span className="font-semibold text-slate-200">{wipingRecord.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">QA Verification:</span>
                <span className={`font-semibold ${wipingRecord.verificationStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {wipingRecord.verificationStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verified By:</span>
                <span className="font-semibold text-slate-200">{wipingRecord.verifiedBy?.name || 'Pending'}</span>
              </div>
              {wipingRecord.evidenceReference && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-500 block mb-1">Evidence Reference:</span>
                  <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-cyan-300 flex items-center justify-between">
                    <span>{wipingRecord.evidenceReference}</span>
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-4">No data wiping operation recorded yet.</p>
          )}
        </div>

        {/* Disposal & Recycling Record Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 font-display flex items-center gap-2 border-b border-slate-800 pb-3">
            <Trash2 className="w-4 h-4 text-indigo-400" />
            Disposal & Recycling Execution
          </h3>
          {disposalRecord ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Disposal Method:</span>
                <span className="font-semibold text-indigo-400">{disposalRecord.disposalMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Approval Status:</span>
                <span className="font-semibold text-emerald-400">{disposalRecord.approvalStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Approved By:</span>
                <span className="font-semibold text-slate-200">{disposalRecord.approvedBy?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vendor / Recycler:</span>
                <span className="font-semibold text-slate-200">{disposalRecord.vendorRecycler || recyclingRecord?.recyclerName || 'N/A'}</span>
              </div>
              {disposalRecord.certificateNumber && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-500 block mb-1">Destruction / E-Waste Cert:</span>
                  <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-emerald-300 flex items-center justify-between">
                    <span>{disposalRecord.certificateNumber}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-4">Disposal request not yet submitted.</p>
          )}
        </div>
      </div>

      {/* Audit History Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-slate-200 font-display flex items-center gap-2 border-b border-slate-800 pb-4 mb-6">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          Complete Asset Lifecycle Audit Trail
        </h3>
        <Timeline logs={auditLogs} />
      </div>
    </div>
  );
};

export default AssetDetails;
