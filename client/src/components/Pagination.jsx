import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ page, pages, total, limit, onPageChange }) => {
  if (pages <= 1) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-900/60 border-t border-slate-800 rounded-b-2xl">
      <div className="text-xs text-slate-400">
        Showing <span className="font-medium text-slate-200">{startItem}</span> to{' '}
        <span className="font-medium text-slate-200">{endItem}</span> of{' '}
        <span className="font-medium text-slate-200">{total}</span> assets
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-semibold text-slate-300 px-3 py-1 bg-slate-800 rounded-lg border border-slate-700">
          Page {page} of {pages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
