import React from 'react';

export const Badge = ({ children, variant = 'cyan', size = 'sm', className = '' }) => {
  const variantMap = {
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(0,242,254,0.15)]',
    indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40 shadow-[0_0_8px_rgba(99,102,241,0.15)]',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-[0_0_8px_rgba(139,92,246,0.15)]',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.15)]',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700/70',
    pass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    fail: 'bg-rose-500/20 text-rose-400 border-rose-500/50 font-bold shadow-[0_0_10px_rgba(244,63,94,0.2)]',
  };

  const sizeMap = {
    xs: 'text-[9px] px-1.5 py-0.5 tracking-wider font-mono uppercase',
    sm: 'text-[11px] px-2.5 py-0.8 tracking-wider font-mono uppercase',
    md: 'text-xs px-3 py-1 tracking-wider font-mono uppercase',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono rounded border ${variantMap[variant] || variantMap.cyan} ${sizeMap[size]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
};

export const Skeleton = ({ className = '', rounded = 'rounded-lg' }) => {
  return (
    <div
      className={`animate-pulse bg-[#0F172A]/70 border border-cyan-500/10 ${rounded} ${className}`}
    />
  );
};
