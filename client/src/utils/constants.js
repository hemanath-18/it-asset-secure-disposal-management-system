export const ASSET_TYPES = [
  'Laptop',
  'Desktop',
  'Server',
  'Hard Disk',
  'SSD',
  'Mobile',
  'Tablet',
  'Printer',
  'Monitor',
  'USB Drive',
  'Network Equipment',
  'Other'
];

export const ASSET_CONDITIONS = [
  'Excellent',
  'Good',
  'Fair',
  'Poor',
  'Damaged'
];

export const STATUS_COLORS = {
  REGISTERED: 'bg-slate-700/60 text-slate-300 border-slate-600',
  IN_USE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  PENDING_DISPOSAL: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  DATA_WIPING: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  WIPING_COMPLETED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  WIPING_FAILED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  WIPING_VERIFIED: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
  DISPOSAL_APPROVED: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  REUSE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  REFURBISH: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  RECYCLE: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
  RESELL: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  DESTROY: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  DISPOSAL_COMPLETED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  ARCHIVED: 'bg-slate-800 text-slate-400 border-slate-700'
};

export const WIPING_METHODS = [
  'Secure Erase',
  'Cryptographic Erase',
  'Overwrite',
  'Manufacturer Secure Erase',
  'Physical Destruction',
  'Other'
];

export const DISPOSAL_METHODS = [
  'Reuse',
  'Refurbish',
  'Recycle',
  'Resell',
  'Physical Destruction'
];

export const DEPARTMENTS = [
  'IT',
  'Engineering',
  'Finance',
  'Human Resources',
  'Operations',
  'Design',
  'Legal',
  'Executive',
  'Sales & Marketing'
];
