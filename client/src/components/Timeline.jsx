import React from 'react';
import { formatDateTime } from '../utils/formatters';
import { ShieldCheck, HardDrive, Trash2, RefreshCw, FileText, UserCheck } from 'lucide-react';

export const Timeline = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return <p className="text-xs text-slate-500 py-4">No audit activity recorded yet.</p>;
  }

  const getActionIcon = (action) => {
    if (action.includes('WIPING')) return <HardDrive className="w-4 h-4 text-cyan-400" />;
    if (action.includes('DISPOSAL')) return <Trash2 className="w-4 h-4 text-indigo-400" />;
    if (action.includes('RECYCLING')) return <RefreshCw className="w-4 h-4 text-emerald-400" />;
    if (action.includes('VERIFIED')) return <ShieldCheck className="w-4 h-4 text-teal-400" />;
    if (action.includes('USER')) return <UserCheck className="w-4 h-4 text-amber-400" />;
    return <FileText className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
      {logs.map((log) => (
        <div key={log._id || log.id} className="relative group">
          <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center group-hover:border-cyan-500 transition-colors">
            {getActionIcon(log.action)}
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-200">{log.action.replace(/_/g, ' ')}</span>
              <span className="text-[11px] text-slate-500">{formatDateTime(log.timestamp || log.createdAt)}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{log.description}</p>
            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
              <span>By: <strong className="text-slate-300">{log.user?.name || log.userRole || 'System'}</strong></span>
              {log.previousStatus && log.newStatus && (
                <span className="text-slate-400">
                  Status: <code className="text-amber-400">{log.previousStatus}</code> → <code className="text-emerald-400">{log.newStatus}</code>
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
