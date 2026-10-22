import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { WIPING_METHODS } from '../utils/constants';
import { formatDateTime } from '../utils/formatters';
import {
  Eraser,
  Plus,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HardDrive,
  Info,
  Clock
} from 'lucide-react';

export const DataWiping = () => {
  const [wipingRecords, setWipingRecords] = useState([]);
  const [eligibleAssets, setEligibleAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initiate Modal State
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [wipingMethod, setWipingMethod] = useState('Secure Erase');
  const [initiateNotes, setInitiateNotes] = useState('');

  // Update Status Modal State
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('COMPLETED');
  const [evidenceRef, setEvidenceRef] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchWipingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resRecords, resAssets] = await Promise.all([
        API.get('/wiping'),
        API.get('/assets', { params: { limit: 100 } })
      ]);
      setWipingRecords(resRecords.data.data);
      // Assets in PENDING_DISPOSAL or WIPING_FAILED can be wiped
      const eligible = (resAssets.data.data || []).filter(
        (a) => a.status === 'PENDING_DISPOSAL' || a.status === 'WIPING_FAILED' || a.status === 'DATA_WIPING'
      );
      setEligibleAssets(eligible);
    } catch (err) {
      console.error('Failed to fetch wiping data:', err);
      setError('Unable to load data wiping records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWipingData();
  }, []);

  const handleInitiateWiping = async (e) => {
    e.preventDefault();
    if (!selectedAssetId) {
      showError('Please select an asset for data wiping');
      return;
    }

    setIsSubmitting(true);
    try {
      await API.post('/wiping/initiate', {
        assetId: selectedAssetId,
        wipingMethod,
        notes: initiateNotes
      });
      showSuccess('Data wiping operation initiated successfully');
      setShowInitiateModal(false);
      setSelectedAssetId('');
      setInitiateNotes('');
      fetchWipingData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to initiate wiping operation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setIsSubmitting(true);
    try {
      await API.put(`/wiping/${selectedRecord._id}/status`, {
        status: updateStatus,
        evidenceReference: evidenceRef,
        notes: updateNotes
      });
      showSuccess(`Wiping operation marked as ${updateStatus}`);
      setSelectedRecord(null);
      setEvidenceRef('');
      setUpdateNotes('');
      fetchWipingData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update wiping status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 font-display tracking-tight">
            Data Wiping & Sanitization Operations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Initiate, track operator logs, and record verification evidence for storage sanitization.
          </p>
        </div>

        {hasRole('ADMIN', 'IT_STAFF') && (
          <button
            onClick={() => setShowInitiateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-900/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Initiate Wiping Operation</span>
          </button>
        )}
      </div>

      {/* Info Alert Box */}
      <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-cyan-200/90 leading-relaxed">
          <strong className="text-cyan-100 font-semibold">Audit Compliance Notice:</strong> This portal records, tracks, and verifies sanitization operations conducted by authorized technicians. Ensure verifiable evidence references (e.g., DOD 5220.22-M logs, ATA Secure Erase hashes) are attached upon completion.
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingSpinner message="Fetching active wiping records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchWipingData} />
      ) : wipingRecords.length === 0 ? (
        <EmptyState
          title="No data wiping records"
          description="Click 'Initiate Wiping Operation' to start sanitizing obsolete IT hardware."
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Asset ID / Serial</th>
                  <th className="px-6 py-4">Wiping Method</th>
                  <th className="px-6 py-4">Operator</th>
                  <th className="px-6 py-4">Started At</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {wipingRecords.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium">
                      <div className="text-slate-100 font-bold">{r.asset?.assetId || 'N/A'}</div>
                      <div className="text-[11px] text-slate-500">{r.asset?.serialNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-lg font-semibold">
                        {r.wipingMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {r.operator?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {formatDateTime(r.startedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                        r.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : r.status === 'FAILED'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        r.verificationStatus === 'VERIFIED'
                          ? 'text-teal-300 bg-teal-500/10'
                          : r.verificationStatus === 'FAILED'
                          ? 'text-rose-400 bg-rose-500/10'
                          : 'text-amber-300 bg-amber-500/10'
                      }`}>
                        {r.verificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.status === 'IN_PROGRESS' && hasRole('ADMIN', 'IT_STAFF') && (
                        <button
                          onClick={() => {
                            setSelectedRecord(r);
                            setEvidenceRef(`WIPE-LOG-${r.asset?.assetId || '001'}.log`);
                          }}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold text-xs transition-all shadow-md"
                        >
                          Update Status
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

      {/* Modal 1: Initiate Wiping */}
      <Modal
        isOpen={showInitiateModal}
        onClose={() => setShowInitiateModal(false)}
        title="Initiate Data Wiping Operation"
      >
        <form onSubmit={handleInitiateWiping} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Asset (Pending Disposal / Failed Wiping)
            </label>
            {eligibleAssets.length === 0 ? (
              <p className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                No assets currently in 'PENDING_DISPOSAL' or 'WIPING_FAILED' status. Move an asset to disposal status first.
              </p>
            ) : (
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 font-mono"
                required
              >
                <option value="">-- Choose Asset --</option>
                {eligibleAssets.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.assetId} - {a.brand} {a.model} ({a.serialNumber}) [{a.status}]
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Wiping Method
            </label>
            <select
              value={wipingMethod}
              onChange={(e) => setWipingMethod(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500"
              required
            >
              {WIPING_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Operator Notes / Pre-check Remarks
            </label>
            <textarea
              value={initiateNotes}
              onChange={(e) => setInitiateNotes(e.target.value)}
              placeholder="Record sanitization parameters, drive enclosure details, software tool version..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 h-20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowInitiateModal(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || eligibleAssets.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-lg shadow-cyan-900/30 flex items-center gap-2"
            >
              {isSubmitting && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
              Start Sanitization
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Update Wiping Status */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={`Complete Sanitization Operation: ${selectedRecord?.asset?.assetId}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Wiping Outcome Status
            </label>
            <select
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500"
              required
            >
              <option value="COMPLETED">COMPLETED (Successful Wipe)</option>
              <option value="FAILED">FAILED (Sanitization Error)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Evidence Reference / Log Hash
            </label>
            <input
              type="text"
              value={evidenceRef}
              onChange={(e) => setEvidenceRef(e.target.value)}
              placeholder="e.g. WIPE-LOG-2026-9901.pdf or SHA-256 Hash"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Technician Execution Notes
            </label>
            <textarea
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              placeholder="Add details regarding verification check or errors encountered..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 h-20"
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
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-900/30 flex items-center gap-2"
            >
              {isSubmitting && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
              Save Wiping Outcome
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DataWiping;
