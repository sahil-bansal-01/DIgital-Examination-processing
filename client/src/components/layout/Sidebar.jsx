import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  GraduationCap,
  CalendarCheck,
  Edit3,
  Cpu,
  Zap,
  BarChart3,
  FileCheck2,
  ScrollText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Badge } from '../ui/Badge';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout, isAdmin, isTeacher, isStudent } = useAuth();
  const { currentTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Nav Items Config
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student'] },
    
    // Academic & Exam Setup (Admin)
    { to: '/academic', label: 'Academic Setup', icon: GraduationCap, roles: ['admin'] },
    { to: '/exams', label: 'Exam Management', icon: CalendarCheck, roles: ['admin'] },
    
    // Marks Entry (Admin & Teacher)
    { to: '/marks', label: 'Marks Entry', icon: Edit3, roles: ['admin', 'teacher'] },
    
    // CAPP Core Modules (Admin & Teacher)
    { to: '/processing', label: 'Processing Engine', icon: Cpu, roles: ['admin'] },
    { to: '/performance-lab', label: 'Performance Lab', icon: Zap, roles: ['admin', 'teacher'], highlight: true },
    
    // Results & Reports
    { to: '/results', label: 'Results & Reports', icon: BarChart3, roles: ['admin', 'teacher'] },
    
    // Student Portal
    { to: '/my-results', label: 'My Results & Transcript', icon: FileCheck2, roles: ['student'] },
    
    // Re-evaluations
    { to: '/reevaluation', label: 'Re-Evaluations', icon: FileCheck2, roles: ['admin', 'student'] },
    
    // Audit Logs (Admin)
    { to: '/audit-logs', label: 'Audit Trail', icon: ScrollText, roles: ['admin'] },
  ];

  const filteredNav = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#060813]/90 dark:bg-[#060813]/90 light:bg-white/95 border-r border-white/10 dark:border-white/10 light:border-slate-200 backdrop-blur-2xl transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 dark:border-white/10 light:border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="p-2 rounded-xl shadow-md shrink-0"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
              }}
            >
              <Cpu className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                <span className="font-bold text-base tracking-tight text-white dark:text-white light:text-slate-900">
                  DIGITAL <span style={{ color: currentTheme.primary }}>EPS</span>
                </span>
                <span className="block text-[10px] uppercase font-mono tracking-widest text-slate-400">
                  CAPP Engine
                </span>
              </motion.div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileOpen(false)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 select-none ${
                  isActive
                    ? 'font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                } ${item.highlight ? 'border border-indigo-500/20 bg-indigo-500/5' : ''}`}
                style={{
                  color: isActive ? currentTheme.primary : undefined,
                }}
              >
                {/* Active Sliding Indicator Pill */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 rounded-xl border"
                    style={{
                      backgroundColor: `${currentTheme.primary}15`,
                      borderColor: `${currentTheme.primary}45`,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                <Icon
                  className="w-5 h-5 shrink-0 relative z-10"
                  style={{ color: isActive ? currentTheme.primary : undefined }}
                />

                {!collapsed && (
                  <span className="relative z-10 truncate">{item.label}</span>
                )}

                {!collapsed && item.highlight && (
                  <span
                    className="ml-auto relative z-10 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold"
                    style={{
                      backgroundColor: `${currentTheme.primary}25`,
                      color: currentTheme.primary,
                    }}
                  >
                    CAPP
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-white/10 dark:border-white/10 light:border-slate-200 shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.04] dark:bg-white/[0.04] light:bg-slate-100 border border-white/5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            {!collapsed && (
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-semibold text-white dark:text-white light:text-slate-900 truncate">
                  {user?.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge
                    variant={isAdmin ? 'rose' : isTeacher ? 'indigo' : 'emerald'}
                    size="xs"
                  >
                    {user?.role?.toUpperCase()}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
};
