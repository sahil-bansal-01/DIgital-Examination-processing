import React from 'react';
import { Menu, Zap, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Badge } from '../ui/Badge';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { Link } from 'react-router-dom';

export const Navbar = ({ setIsMobileOpen }) => {
  const { user } = useAuth();
  const { currentTheme, isDark, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-white/10 dark:border-white/10 light:border-slate-200 bg-[#060813]/70 dark:bg-[#060813]/70 light:bg-white/85 backdrop-blur-2xl sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-sm">
      {/* Mobile Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Academic Session</span>
          <Badge variant="cyan" size="xs">
            2025 - 2026
          </Badge>
          <span className="text-xs text-slate-600">|</span>
          <span className="text-xs font-medium text-slate-400">
            {user?.department ? `Dept of ${user.department}` : 'University Exam Cell'}
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Performance Lab Quick Trigger */}
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <Link
            to="/performance-lab"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/30 text-indigo-400 hover:text-cyan-300 hover:border-cyan-400/50 transition text-xs font-mono font-semibold shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden md:inline">CAPP Lab</span>
          </Link>
        )}

        {/* 1-Click Light / Dark Background Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 light:bg-slate-100 light:hover:bg-slate-200 border border-slate-700/70 dark:border-slate-700/70 light:border-slate-300 text-slate-200 dark:text-slate-200 light:text-slate-800 transition shadow-sm"
          title={isDark ? 'Switch to Light Background' : 'Switch to Dark Obsidian Background'}
          aria-label="Toggle Light/Dark Background"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-purple-600" />
          )}
        </button>

        {/* Dynamic Theme Palette Switcher Dropdown */}
        <ThemeSwitcher align="right" />

        {/* User Info Capsule */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800 dark:border-slate-800 light:border-slate-200">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-white dark:text-white light:text-slate-900 leading-tight">
              {user?.name}
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
