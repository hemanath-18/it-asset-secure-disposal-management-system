import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export const ErrorState = ({ message = 'Failed to load requested data.', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-rose-950/20 rounded-2xl border border-rose-900/40 my-4">
      <div className="p-4 rounded-2xl bg-rose-900/30 text-rose-400 mb-4 border border-rose-800/40">
        <AlertOctagon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-rose-200">System Communication Error</h3>
      <p className="text-sm text-rose-300/80 max-w-sm mt-1 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-xl text-sm transition-colors shadow-lg shadow-rose-900/30"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      )}
    </div>
  );
};

export default ErrorState;
