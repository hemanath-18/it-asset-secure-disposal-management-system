import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({ title = 'No records found', description = 'There are no assets or logs matching your request.', action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 my-4">
      <div className="p-4 rounded-2xl bg-slate-800/80 text-slate-400 mb-4 border border-slate-700/50">
        <Inbox className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6">{description}</p>
      {action}
    </div>
  );
};

export default EmptyState;
