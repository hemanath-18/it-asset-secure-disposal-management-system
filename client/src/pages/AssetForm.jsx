import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../utils/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { ASSET_TYPES, ASSET_CONDITIONS, DEPARTMENTS } from '../utils/constants';
import { ArrowLeft, Save, HardDrive } from 'lucide-react';

export const AssetForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    assetId: '',
    type: 'Laptop',
    category: 'Hardware',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    assignedEmployee: '',
    department: 'IT',
    location: 'HQ Floor 1',
    condition: 'Good',
    description: '',
    notes: ''
  });

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (isEdit) {
      const fetchAsset = async () => {
        try {
          const res = await API.get(`/assets/${id}`);
          const a = res.data.data.asset;
          setFormData({
            assetId: a.assetId || '',
            type: a.type || 'Laptop',
            category: a.category || 'Hardware',
            brand: a.brand || '',
            model: a.model || '',
            serialNumber: a.serialNumber || '',
            purchaseDate: a.purchaseDate ? a.purchaseDate.substring(0, 10) : '',
            assignedEmployee: a.assignedEmployee || '',
            department: a.department || 'IT',
            location: a.location || '',
            condition: a.condition || 'Good',
            description: a.description || '',
            notes: a.notes || ''
          });
        } catch (err) {
          setError('Failed to load asset for editing');
        } finally {
          setLoading(false);
        }
      };
      fetchAsset();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) {
        await API.put(`/assets/${id}`, formData);
        showSuccess('Asset updated successfully');
      } else {
        await API.post('/assets', formData);
        showSuccess('Asset registered successfully');
      }
      navigate('/assets');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save asset record');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading asset form data..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
        <Link
          to="/assets"
          className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-100 font-display tracking-tight">
            {isEdit ? `Edit Asset: ${formData.assetId}` : 'Register New IT Asset'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Enter hardware specifications and serial details for compliance indexing.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Asset ID (Auto-generated if empty)
            </label>
            <input
              type="text"
              name="assetId"
              value={formData.assetId}
              onChange={handleChange}
              placeholder="e.g. AST-2026-0099"
              disabled={isEdit}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 focus:outline-none font-mono disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Serial Number <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              placeholder="Hardware Serial Number"
              required
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Hardware Brand <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g. Dell, Apple, Lenovo, Cisco"
              required
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Hardware Model <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="e.g. Latitude 7420, MacBook Pro"
              required
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Asset Type <span className="text-rose-400">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              required
            >
              {ASSET_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Department <span className="text-rose-400">*</span>
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              required
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Physical Location <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. HQ Floor 3 Rack 4B"
              required
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Assigned Employee
            </label>
            <input
              type="text"
              name="assignedEmployee"
              value={formData.assignedEmployee}
              onChange={handleChange}
              placeholder="Employee Name"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Physical Condition
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              {ASSET_CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Description / Specifications
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed hardware specs (CPU, RAM, Storage capacity...)"
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-cyan-500 focus:outline-none h-20"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Link
            to="/assets"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-900/30 flex items-center gap-2"
          >
            {submitting ? (
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isEdit ? 'Update Asset' : 'Save Asset Record'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssetForm;
