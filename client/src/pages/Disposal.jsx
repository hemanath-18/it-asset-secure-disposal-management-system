import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { DISPOSAL_METHODS } from '../utils/constants';
import { formatDateTime, formatDate } from '../utils/formatters';
import {
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  RefreshCw,
  RotateCcw,
  Flame,
  Building,
  Award,
  ArrowRight
} from 'lucide-react';

export const Disposal = () => {
  const [disposalRecords, setDisposalRecords] = useState([]);
  const [verifiedAssets, setVerifiedAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Request Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [disposalMethod, setDisposalMethod] = useState('Recycle');
  const [vendorRecycler, setVendorRecycler] = useState('');
  const [requestNotes, setRequestNotes] = useState('');

  // Approve Modal State
  const [approveRecord, setApproveRecord] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState('APPROVED');
  const [approvalNotes, setApprovalNotes] = useState('');

  // Execute Disposal Modal State
  const [executeRecord, setExecuteRecord] = useState(null);
  const [execVendor, setExecVendor] = useState('');
  const [certificateNo, setCertificateNo] = useState('');
  const [execNotes, setExecNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchDisposalData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resDisposals, resAssets] = await Promise.all([
        API.get('/disposals'),
        API.get('/assets', { params: { limit: 100 } })
      ]);
      setDisposalRecords(resDisposals.data.data);
      // Assets that have WIPING_VERIFIED status can be submitted for disposal
      const eligible = (resAssets.data.data || []).filter(
        (a) => a.status === 'WIPING_VERIFIED'
      );
      setVerifiedAssets(eligible);
    } catch (err) {
      console.error('Failed to fetch disposal records:', err);
      setError('Unable to load disposal records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisposalData();
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!selectedAssetId) {
      showError('Please select a verified asset for disposal');
      return;
    }

    setIsSubmitting(true);
    try {
      await API.post('/disposals/request', {
        assetId: selectedAssetId,
        disposalMethod,
        vendorRecycler,
        notes: requestNotes
      });
      showSuccess('Disposal request submitted successfully and pending manager approval');
      setShowRequestModal(false);
      setSelectedAssetId('');
      setVendorRecycler('');
      setRequestNotes('');
      fetchDisposalData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to submit disposal request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveDisposal = async (e) => {
    e.preventDefault();
    if (!approveRecord) return;

    setIsSubmitting(true);
    try {
      await API.put(`/disposals/${approveRecord._id}/approve`, {
        approvalStatus,
        approvalNotes
      });
      showSuccess(`Disposal request ${approvalStatus.toLowerCase()}`);
      setApproveRecord(null);
      setApprovalNotes('');
      fetchDisposalData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update approval status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteDisposal = async (e) => {
    e.preventDefault();
    if (!executeRecord) return;

    setIsSubmitting(true);
    try {
      await API.put(`/disposals/${executeRecord._id}/execute`, {
        vendorRecycler: execVendor,
        certificateNumber: certificateNo,
        notes: execNotes
      });
      showSuccess(`Disposal method execution recorded for ${executeRecord.disposalMethod}`);
      setExecuteRecord(null);
      setExecVendor('');
      setCertificateNo('');
      setExecNotes('');
      fetchDisposalData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to execute disposal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteDisposal = async (recordId) => {
    setIsSubmitting(true);
    try {
      await API.put(`/disposals/${recordId}/complete`);
      showSuccess('Asset disposal successfully completed');
      fetchDisposalData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to complete disposal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 font-display tracking-tight">
            Disposal Operations Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Governance desk for approving E-Waste Recycling, Internal Reuse, Refurbishment, and Shredding.
          </p>
        </div>

        {hasRole('ADMIN', 'IT_STAFF') && (
          <button
            onClick={() => setShowRequestModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-900/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Disposal Request</span>
          </button>
        )}
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingSpinner message="Fetching disposal records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDisposalData} />
      ) : disposalRecords.length === 0 ? (
        <EmptyState
          title="No disposal records"
          description="Create a disposal request for hardware that has completed QA data wiping verification."
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Asset ID / Serial</th>
                  <th className="px-6 py-4">Disposal Method</th>
                  <th className="px-6 py-4">Approval Status</th>
                  <th className="px-6 py-4">Approved By</th>
                  <th className="px-6 py-4">Vendor / Certificate</th>
                  <th className="px-6 py-4 text-right">Governance Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {disposalRecords.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium">
                      <div className="text-slate-100 font-bold">{r.asset?.assetId || 'N/A'}</div>
                      <div className="text-[11px] text-slate-500">{r.asset?.serialNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg font-semibold">
                        {r.disposalMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        r.approvalStatus === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : r.approvalStatus === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {r.approvalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {r.approvedBy?.name || 'Pending Review'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-200 font-medium">{r.vendorRecycler || 'Internal'}</div>
                      <div className="text-[11px] font-mono text-emerald-400">{r.certificateNumber || 'Cert Pending'}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.approvalStatus === 'PENDING' && hasRole('ADMIN', 'MANAGER') && (
                          <button
                            onClick={() => {
                              setApproveRecord(r);
                              setApprovalStatus('APPROVED');
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-all shadow-md"
                          >
                            Manager Review
                          </button>
                        )}

                        {r.approvalStatus === 'APPROVED' && r.asset?.status !== 'DISPOSAL_COMPLETED' && hasRole('ADMIN', 'IT_STAFF') && (
                          <button
                            onClick={() => {
                              setExecuteRecord(r);
                              setExecVendor(r.vendorRecycler || '');
                              setCertificateNo(r.certificateNumber || `CERT-DISP-${r.asset?.assetId || '001'}`);
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs transition-all shadow-md flex items-center gap-1"
                          >
                            <span>Execute Method</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {r.approvalStatus === 'APPROVED' && r.asset?.status !== 'DISPOSAL_COMPLETED' && ['DESTROY', 'RECYCLE', 'REUSE', 'REFURBISH', 'RESELL'].includes(r.asset?.status) && hasRole('ADMIN', 'MANAGER') && (
                          <button
                            onClick={() => handleCompleteDisposal(r._id)}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-semibold text-xs transition-all shadow-md flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Sign-off Complete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Create Request */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Submit Disposal Request"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Verified Asset (Wiping Verified Only)
            </label>
            {verifiedAssets.length === 0 ? (
              <p className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                No assets currently in 'WIPING_VERIFIED' status. Wiping QA verification must be completed first.
              </p>
            ) : (
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500 font-mono"
                required
              >
                <option value="">-- Choose Verified Asset --</option>
                {verifiedAssets.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.assetId} - {a.brand} {a.model} ({a.serialNumber})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Proposed Disposal Method
            </label>
            <select
              value={disposalMethod}
              onChange={(e) => setDisposalMethod(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500"
              required
            >
              {DISPOSAL_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Vendor / Recycler Name
            </label>
            <input
              type="text"
              value={vendorRecycler}
              onChange={(e) => setVendorRecycler(e.target.value)}
              placeholder="e.g. EcoTech Recycling Inc., GreenTech Solutions"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Disposal Request Notes
            </label>
            <textarea
              value={requestNotes}
              onChange={(e) => setRequestNotes(e.target.value)}
              placeholder="State rationale for disposal or internal reallocation details..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500 h-20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowRequestModal(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || verifiedAssets.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-900/30 flex items-center gap-2"
            >
              {isSubmitting && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
              Submit Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Approve Request */}
      <Modal
        isOpen={!!approveRecord}
        onClose={() => setApproveRecord(null)}
        title={`Manager Approval: ${approveRecord?.asset?.assetId}`}
      >
        <form onSubmit={handleApproveDisposal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Approval Decision
            </label>
            <select
              value={approvalStatus}
              onChange={(e) => setApprovalStatus(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500 font-semibold"
              required
            >
              <option value="APPROVED">APPROVED (Grant Disposal Approval)</option>
              <option value="REJECTED">REJECTED (Deny Request)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Approval / Governance Notes
            </label>
            <textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="State governance conditions, authorized recycler requirements..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500 h-24"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setApproveRecord(null)}
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
              Save Approval Decision
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Execute Disposal */}
      <Modal
        isOpen={!!executeRecord}
        onClose={() => setExecuteRecord(null)}
        title={`Execute ${executeRecord?.disposalMethod}: ${executeRecord?.asset?.assetId}`}
      >
        <form onSubmit={handleExecuteDisposal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Vendor / Recycler Partner
            </label>
            <input
              type="text"
              value={execVendor}
              onChange={(e) => setExecVendor(e.target.value)}
              placeholder="e.g. GreenTech Solutions, EcoRecycle Inc."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Certificate of Destruction / E-Waste Reference No.
            </label>
            <input
              type="text"
              value={certificateNo}
              onChange={(e) => setCertificateNo(e.target.value)}
              placeholder="e.g. CERT-RECY-2026-9901"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Execution Remarks
            </label>
            <textarea
              value={execNotes}
              onChange={(e) => setExecNotes(e.target.value)}
              placeholder="Record pickup details, physical shredding confirmation, new employee assignment..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-indigo-500 h-20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setExecuteRecord(null)}
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
              Complete Method Execution
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Disposal;
