import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtext }) => {
  const colorMap = {
    indigo: 'from-indigo-500/20 to-indigo-600/5 text-indigo-400 border-indigo-500/20',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20',
    rose: 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/20',
    cyan: 'from-cyan-500/20 to-cyan-600/5 text-cyan-400 border-cyan-500/20',
    purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20'
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorMap[color]} rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity`} />
      
      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl border bg-slate-800/80 ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="relative z-10">
        <div className="text-2xl font-bold text-slate-100 font-display tracking-tight">{value}</div>
        {subtext && <p className="text-xs text-slate-500 mt-1 font-medium">{subtext}</p>}
      </div>
    </div>
  );
};

export default StatCard;
