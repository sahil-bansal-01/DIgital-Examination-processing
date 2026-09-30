import React from 'react';

export const Badge = ({ children, variant = 'cyan', size = 'sm', className = '' }) => {
  const variantMap = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
    pass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold',
    fail: 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-bold',
  };

  const sizeMap = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${variantMap[variant] || variantMap.cyan} ${sizeMap[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const Skeleton = ({ className = '', rounded = 'rounded-xl' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-200 ${rounded} ${className}`}
    />
  );
};
