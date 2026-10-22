import React from 'react';
import { STATUS_COLORS } from '../utils/constants';
import { formatStatusText } from '../utils/formatters';

export const StatusBadge = ({ status, size = 'md' }) => {
  const colorClass = STATUS_COLORS[status] || 'bg-slate-800 text-slate-300 border-slate-700';
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${sizeClasses[size]} ${colorClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 animate-pulse" />
      {formatStatusText(status)}
    </span>
  );
};

export default StatusBadge;
