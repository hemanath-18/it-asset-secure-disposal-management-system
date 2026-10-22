import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { formatDateTime } from '../utils/formatters';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  FileText,
  User,
  HardDrive
} from 'lucide-react';

export const Verification = () => {
  const [wipingRecords, setWipingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verification Modal State
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('VERIFIED');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchVerificationQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/wiping');
      setWipingRecords(res.data.data);
    } catch (err) {
      console.error('Failed to fetch verification queue:', err);
      setError('Unable to load QA verification queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationQueue();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setIsSubmitting(true);
    try {
      await API.put(`/wiping/${selectedRecord._id}/verify`, {
        verificationStatus,
        verificationNotes
      });
      showSuccess(`Wiping verification recorded as ${verificationStatus}`);
      setSelectedRecord(null);
      setVerificationNotes('');
      fetchVerificationQueue();
    } catch (err) {
      showError(err.response?.data?.message || 'Verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 font-display tracking-tight">
          QA Data Wiping Verification Queue
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Compliance inspection desk for Managers & Admins to audit wiping evidence before approving disposal.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading sanitization verification queue..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchVerificationQueue} />
      ) : wipingRecords.length === 0 ? (
        <EmptyState
          title="Queue is clean"
          description="No data wiping operations currently require QA verification."
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Asset ID / Serial</th>
                  <th className="px-6 py-4">Wiping Method</th>
                  <th className="px-6 py-4">Technician</th>
                  <th className="px-6 py-4">Evidence Log Ref</th>
                  <th className="px-6 py-4">Completed Date</th>
                  <th className="px-6 py-4">Verification Status</th>
                  <th className="px-6 py-4 text-right">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {wipingRecords.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium">
                      <div className="text-slate-100 font-bold">{r.asset?.assetId || 'N/A'}</div>
                      <div className="text-[11px] text-slate-500">{r.asset?.serialNumber}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-cyan-400">
                      {r.wipingMethod}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {r.operator?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-300">
                      {r.evidenceReference || 'No File Attached'}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {formatDateTime(r.completedAt || r.updatedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        r.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : r.verificationStatus === 'FAILED'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {r.verificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {hasRole('ADMIN', 'MANAGER') && (
                        <button
                          onClick={() => {
                            setSelectedRecord(r);
                            setVerificationStatus(r.verificationStatus === 'VERIFIED' ? 'VERIFIED' : 'VERIFIED');
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs transition-all shadow-md"
                        >
                          Verify Evidence
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

      {/* Verification Action Modal */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={`Compliance Audit: ${selectedRecord?.asset?.assetId}`}
      >
        {selectedRecord && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Asset Model:</span>
                <span className="font-semibold text-slate-200">{selectedRecord.asset?.brand} {selectedRecord.asset?.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Technician Operator:</span>
                <span className="font-semibold text-slate-200">{selectedRecord.operator?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Wiping Method Used:</span>
                <span className="font-semibold text-cyan-400">{selectedRecord.wipingMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Attached Evidence:</span>
                <span className="font-mono text-emerald-400">{selectedRecord.evidenceReference || 'N/A'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Verification Decision
              </label>
              <select
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 font-semibold"
                required
              >
                <option value="VERIFIED">VERIFIED (Pass Compliance - Grant Approval)</option>
                <option value="FAILED">FAILED (Fail Audit - Reject Sanitization)</option>
                <option value="REQUIRES_REVIEW">REQUIRES_REVIEW (Hold for Further Analysis)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Auditor Audit Notes / Justification
              </label>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="State compliance inspection findings or reasons for approval/rejection..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 h-24"
                required
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
                Submit QA Audit Decision
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Verification;
