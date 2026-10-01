import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  onClick,
  variant = 'primary', // 'primary', 'secondary', 'danger', 'outline', 'ghost', 'gradient', 'emerald'
  size = 'md', // 'sm', 'md', 'lg'
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  icon: Icon,
}) => {
  const base =
    'relative inline-flex items-center justify-center font-mono font-bold tracking-wider uppercase transition-all duration-150 select-none focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-40 disabled:cursor-not-allowed';

  const sizeMap = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
    md: 'text-xs px-4 py-2.5 gap-2 rounded-lg',
    lg: 'text-sm px-5 py-3 gap-2.5 rounded-xl',
  };

  const variantMap = {
    primary:
      'bg-[#00F2FE] hover:bg-[#00D2FF] text-slate-950 font-extrabold shadow-[0_0_16px_rgba(0,242,254,0.35)] hover:shadow-[0_0_25px_rgba(0,242,254,0.6)] border border-cyan-300',
    secondary:
      'bg-[#0F172A]/80 hover:bg-[#1E293B] text-slate-200 border border-cyan-500/30 hover:border-cyan-400 shadow-md',
    gradient:
      'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-[0_0_18px_rgba(0,242,254,0.25)] border border-cyan-500/40',
    emerald:
      'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_16px_rgba(16,185,129,0.35)] border border-emerald-300',
    danger:
      'bg-rose-600/90 hover:bg-rose-500 text-white shadow-[0_0_16px_rgba(244,63,94,0.3)] border border-rose-500/40',
    outline:
      'border border-cyan-500/50 hover:border-cyan-400 text-cyan-400 hover:bg-cyan-500/10 hover:shadow-[0_0_14px_rgba(0,242,254,0.2)] bg-transparent',
    ghost:
      'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={disabled || loading ? {} : { y: -1, scale: 1.01 }}
      whileTap={disabled || loading ? {} : { y: 1, scale: 0.98 }}
      className={`${base} ${sizeMap[size]} ${variantMap[variant]} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}
      <span>{children}</span>
    </motion.button>
  );
};
