import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { formatDate } from '../utils/formatters';
import {
  FileBarChart,
  Download,
  Printer,
  Filter,
  ShieldCheck,
  HardDrive,
  Eraser,
  Trash2
} from 'lucide-react';

export const Reports = () => {
  const [activeTab, setActiveTab] = useState('disposal'); // 'disposal', 'wiping', 'compliance'
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '/reports/disposal';
      if (activeTab === 'wiping') endpoint = '/reports/wiping';
      if (activeTab === 'compliance') endpoint = '/reports/compliance';

      const res = await API.get(endpoint, {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined
        }
      });
      setReportData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch report data:', err);
      setError('Failed to generate report metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab, startDate, endDate]);

  const exportToCSV = () => {
    if (!reportData || reportData.length === 0) return;

    const headers = Object.keys(reportData[0]).join(',');
    const rows = reportData.map((row) =>
      Object.values(row)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IT_Asset_${activeTab.toUpperCase()}_Report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 font-display tracking-tight">
            Compliance & Operations Reporting Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate verifiable audit reports, export CSV datasheets, and print regulatory documentation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            disabled={reportData.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-900/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('disposal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'disposal'
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-900/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>Asset Disposal Report</span>
        </button>

        <button
          onClick={() => setActiveTab('wiping')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'wiping'
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-900/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <Eraser className="w-4 h-4" />
          <span>Data Sanitization Report</span>
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'compliance'
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-900/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Compliance Audit Matrix</span>
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center gap-4">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-cyan-400" /> Date Range Filter:
        </span>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
          <span className="text-slate-500 text-xs">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Report Data Table */}
      {loading ? (
        <LoadingSpinner message="Generating report data query..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchReport} />
      ) : reportData.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 text-sm">
          No records found matching report parameters.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden print:bg-white print:text-black">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  {Object.keys(reportData[0]).map((key) => (
                    <th key={key} className="px-6 py-4">
                      {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="px-6 py-4 font-mono text-[11px] text-slate-200">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
