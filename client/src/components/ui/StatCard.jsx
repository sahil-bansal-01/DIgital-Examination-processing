import React from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  color = 'cyan', // 'cyan', 'indigo', 'emerald', 'amber', 'rose', 'purple'
}) => {
  const colorMap = {
    cyan: {
      border: 'border-cyan-500/25 hover:border-cyan-400',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
      glow: 'shadow-[0_0_20px_rgba(0,242,254,0.08)] hover:shadow-[0_0_25px_rgba(0,242,254,0.2)]',
      valueColor: 'text-cyan-300',
      accent: '#00F2FE',
    },
    purple: {
      border: 'border-purple-500/25 hover:border-purple-400',
      iconBg: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
      glow: 'shadow-[0_0_20px_rgba(139,92,246,0.08)] hover:shadow-[0_0_25px_rgba(139,92,246,0.2)]',
      valueColor: 'text-purple-300',
      accent: '#8B5CF6',
    },
    indigo: {
      border: 'border-indigo-500/25 hover:border-indigo-400',
      iconBg: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
      glow: 'shadow-[0_0_20px_rgba(99,102,241,0.08)] hover:shadow-[0_0_25px_rgba(99,102,241,0.2)]',
      valueColor: 'text-indigo-300',
      accent: '#6366F1',
    },
    emerald: {
      border: 'border-emerald-500/25 hover:border-emerald-400',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.08)] hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]',
      valueColor: 'text-emerald-300',
      accent: '#10B981',
    },
    amber: {
      border: 'border-amber-500/25 hover:border-amber-400',
      iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.08)] hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]',
      valueColor: 'text-amber-300',
      accent: '#F59E0B',
    },
    rose: {
      border: 'border-rose-500/25 hover:border-rose-400',
      iconBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.08)] hover:shadow-[0_0_25px_rgba(244,63,94,0.2)]',
      valueColor: 'text-rose-300',
      accent: '#F43F5E',
    },
  };

  const scheme = colorMap[color] || colorMap.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={`relative overflow-hidden rounded-xl p-4 sm:p-5 border bg-[#0F172A]/60 backdrop-blur-xl transition-all duration-200 ${scheme.border} ${scheme.glow} tech-corners group`}
    >
      {/* Top subtle HUD bracket index */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: scheme.accent }} />
          <span>TELEMETRY NODE</span>
        </span>
        <span className="text-[9px] text-cyan-500/60 font-mono">SYS//OK</span>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-mono font-medium text-slate-400 tracking-wider uppercase">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono ${scheme.valueColor}`}>
              {value}
            </span>
            {trend && (
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                  trend.isPositive 
                    ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30' 
                    : 'text-rose-300 bg-rose-500/15 border-rose-500/30'
                }`}
              >
                {trend.isPositive ? '▲' : '▼'} {trend.text}
              </span>
            )}
          </div>
          {subtext && (
            <p className="mt-1 text-xs font-mono text-slate-400">
              {subtext}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg shrink-0 ${scheme.iconBg} group-hover:scale-110 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
