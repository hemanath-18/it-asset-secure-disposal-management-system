import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { formatDateTime, formatDate } from '../utils/formatters';
import {
  RefreshCw,
  Truck,
  CheckCircle2,
  Award,
  FileText,
  Building,
  Clock
} from 'lucide-react';

export const Recycling = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update Modal State
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recyclerName, setRecyclerName] = useState('');
  const [recyclingStatus, setRecyclingStatus] = useState('ASSIGNED_TO_RECYCLER');
  const [refNo, setRefNo] = useState('');
  const [certNo, setCertNo] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchRecyclingRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/recycling');
      setRecords(res.data.data);
    } catch (err) {
      console.error('Failed to fetch recycling records:', err);
      setError('Unable to load recycling workflow records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecyclingRecords();
  }, []);

  const handleUpdateRecord = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setIsSubmitting(true);
    try {
      await API.put(`/recycling/${selectedRecord._id}`, {
        recyclerName,
        recyclingStatus,
        referenceNumber: refNo,
        certificateNumber: certNo,
        notes
      });
      showSuccess('Recycling workflow record updated successfully');
      setSelectedRecord(null);
      fetchRecyclingRecords();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update recycling status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 font-display tracking-tight">
          E-Waste Recycling Workflow Tracker
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Track certified recycling vendors, pickup collection dates, material recovery, and destruction certificates.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching e-waste recycling records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRecyclingRecords} />
      ) : records.length === 0 ? (
        <EmptyState
          title="No recycling workflows active"
          description="Assets approved for 'Recycle' disposal method will automatically appear here."
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Asset ID / Serial</th>
                  <th className="px-6 py-4">Recycling Vendor</th>
                  <th className="px-6 py-4">Pickup Date</th>
                  <th className="px-6 py-4">Ref & Cert No.</th>
                  <th className="px-6 py-4">Recycling Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium">
                      <div className="text-slate-100 font-bold">{r.asset?.assetId || 'N/A'}</div>
                      <div className="text-[11px] text-slate-500">{r.asset?.serialNumber}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {r.recyclerName}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {formatDate(r.pickupDate)}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px]">
                      <div className="text-slate-300">Ref: {r.referenceNumber || 'N/A'}</div>
                      <div className="text-emerald-400">Cert: {r.certificateNumber || 'Pending'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        r.recyclingStatus === 'RECYCLING_COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : r.recyclingStatus === 'COLLECTED'
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {r.recyclingStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {hasRole('ADMIN', 'IT_STAFF', 'MANAGER') && (
                        <button
                          onClick={() => {
                            setSelectedRecord(r);
                            setRecyclerName(r.recyclerName || 'GreenTech Solutions');
                            setRecyclingStatus(r.recyclingStatus);
                            setRefNo(r.referenceNumber || `REF-RECY-${r.asset?.assetId || '001'}`);
                            setCertNo(r.certificateNumber || `CERT-RECY-${r.asset?.assetId || '001'}`);
                            setNotes(r.notes || '');
                          }}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-semibold text-xs transition-all shadow-md"
                        >
                          Update Workflow
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Update Recycling Record Modal */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={`Update Recycling Workflow: ${selectedRecord?.asset?.assetId}`}
      >
        <form onSubmit={handleUpdateRecord} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Recycler / E-Waste Partner Name
            </label>
            <input
              type="text"
              value={recyclerName}
              onChange={(e) => setRecyclerName(e.target.value)}
              placeholder="e.g. GreenTech Solutions"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Current Recycling Stage
            </label>
            <select
              value={recyclingStatus}
              onChange={(e) => setRecyclingStatus(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-teal-500 font-semibold"
              required
            >
              <option value="READY_FOR_RECYCLING">READY_FOR_RECYCLING</option>
              <option value="ASSIGNED_TO_RECYCLER">ASSIGNED_TO_RECYCLER</option>
              <option value="COLLECTED">COLLECTED (Picked up by Vendor)</option>
              <option value="RECYCLING_IN_PROGRESS">RECYCLING_IN_PROGRESS</option>
              <option value="RECYCLING_COMPLETED">RECYCLING_COMPLETED (Final Certificate Issued)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Vendor Reference Number
            </label>
            <input
              type="text"
              value={refNo}
              onChange={(e) => setRefNo(e.target.value)}
              placeholder="e.g. REF-GT-8841"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-teal-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Destruction / Material Recycling Certificate No.
            </label>
            <input
              type="text"
              value={certNo}
              onChange={(e) => setCertNo(e.target.value)}
              placeholder="e.g. CERT-RECY-2026-88"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-teal-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Recycling Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record material extraction details, precious metal recovery notes..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-teal-500 h-20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedRecord(null)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl shadow-lg shadow-teal-900/30 flex items-center gap-2"
            >
              {isSubmitting && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
              Save Workflow Status
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Recycling;
