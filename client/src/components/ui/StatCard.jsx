import React from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  color = 'cyan', // 'cyan', 'indigo', 'emerald', 'amber', 'rose'
}) => {
  const colorMap = {
    cyan: {
      bg: 'from-cyan-500/10 to-transparent',
      border: 'border-cyan-500/20 hover:border-cyan-500/50',
      iconBg: 'bg-cyan-500/20 text-cyan-400',
      glow: 'shadow-cyan-500/10',
    },
    indigo: {
      bg: 'from-indigo-500/10 to-transparent',
      border: 'border-indigo-500/20 hover:border-indigo-500/50',
      iconBg: 'bg-indigo-500/20 text-indigo-400',
      glow: 'shadow-indigo-500/10',
    },
    emerald: {
      bg: 'from-emerald-500/10 to-transparent',
      border: 'border-emerald-500/20 hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      glow: 'shadow-emerald-500/10',
    },
    amber: {
      bg: 'from-amber-500/10 to-transparent',
      border: 'border-amber-500/20 hover:border-amber-500/50',
      iconBg: 'bg-amber-500/20 text-amber-400',
      glow: 'shadow-amber-500/10',
    },
    rose: {
      bg: 'from-rose-500/10 to-transparent',
      border: 'border-rose-500/20 hover:border-rose-500/50',
      iconBg: 'bg-rose-500/20 text-rose-400',
      glow: 'shadow-rose-500/10',
    },
  };

  const scheme = colorMap[color] || colorMap.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className={`relative overflow-hidden rounded-2xl p-5 border bg-gradient-to-b ${scheme.bg} bg-[#0a0e1c]/75 dark:bg-[#0a0e1c]/75 light:bg-white/90 backdrop-blur-2xl transition-all shadow-xl ${scheme.glow} ${scheme.border}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-400 light:text-slate-500 tracking-wider uppercase">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white dark:text-white light:text-slate-900 font-mono">
              {value}
            </span>
            {trend && (
              <span
                className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                  trend.isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                }`}
              >
                {trend.isPositive ? '+' : ''}{trend.text}
              </span>
            )}
          </div>
          {subtext && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
              {subtext}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
