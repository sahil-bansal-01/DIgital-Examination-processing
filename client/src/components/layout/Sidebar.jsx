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
  Crosshair,
  Terminal,
  Shield,
  Radio,
  FileText,
  FlaskConical
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout, isAdmin, isTeacher, isStudent } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Nav Items Config with Technical Sci-Fi Indexing
  const navItems = [
    { 
      to: '/dashboard', 
      label: 'DASHBOARD', 
      sub: 'OVERVIEW',
      code: '01', 
      icon: LayoutDashboard, 
      roles: ['admin', 'teacher', 'student'] 
    },
    { 
      to: '/academic', 
      label: 'ACADEMIC SETUP', 
      sub: 'CURRICULUM',
      code: '02', 
      icon: GraduationCap, 
      roles: ['admin'] 
    },
    { 
      to: '/exams', 
      label: 'EXAM MANAGEMENT', 
      sub: 'PROTOCOLS',
      code: '03', 
      icon: CalendarCheck, 
      roles: ['admin'] 
    },
    { 
      to: '/marks', 
      label: 'MARKS ENTRY', 
      sub: 'TELEMETRY',
      code: '04', 
      icon: Edit3, 
      roles: ['admin', 'teacher'] 
    },
    { 
      to: '/processing', 
      label: 'PROCESSING ENGINE', 
      sub: 'PARALLEL CORE',
      code: '05', 
      icon: Cpu, 
      roles: ['admin'],
      highlight: true 
    },
    { 
      to: '/performance-lab', 
      label: 'PERFORMANCE LAB', 
      sub: 'BENCHMARKS',
      code: '06', 
      icon: Zap, 
      roles: ['admin', 'teacher'], 
      highlight: true 
    },
    { 
      to: '/results', 
      label: 'RESULTS & REPORTS', 
      sub: 'DISPATCH',
      code: '07', 
      icon: BarChart3, 
      roles: ['admin', 'teacher'] 
    },
    { 
      to: '/my-results', 
      label: 'MY TRANSCRIPT', 
      sub: 'OFFICIAL RECORD',
      code: '08', 
      icon: FileCheck2, 
      roles: ['student'] 
    },
    { 
      to: '/reevaluation', 
      label: 'RE-EVALUATIONS', 
      sub: 'PETITIONS',
      code: '09', 
      icon: FileText, 
      roles: ['admin', 'student'] 
    },
    { 
      to: '/audit-logs', 
      label: 'AUDIT TRAIL', 
      sub: 'SECURITY LOGS',
      code: '10', 
      icon: ScrollText, 
      roles: ['admin'] 
    },
    { 
      to: '/capp-lab', 
      label: 'CAPP LAB', 
      sub: 'ARCHITECTURE',
      code: '11', 
      icon: FlaskConical, 
      roles: ['admin', 'teacher', 'student'],
      highlight: true 
    },
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
            className="fixed inset-0 z-40 bg-[#030508]/85 backdrop-blur-md lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: collapsed ? 80 : 270 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#080C14]/95 border-r border-cyan-500/20 backdrop-blur-2xl transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-cyan-500/20 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shrink-0 shadow-[0_0_12px_rgba(0,242,254,0.2)]">
              <Crosshair className="w-5 h-5 text-cyan-400" />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap font-mono"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-widest text-white">
                    CAPP <span className="text-cyan-400">CORE</span>
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <span className="block text-[9px] uppercase tracking-widest text-slate-400">
                  COMMAND CENTER v2.4
                </span>
              </motion.div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-900 border border-transparent hover:border-cyan-500/30 transition"
            aria-label="Toggle Sidebar"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Section Heading Tag */}
        {!collapsed && (
          <div className="px-4 pt-3 pb-1 flex items-center justify-between font-mono text-[10px] text-cyan-500/70 uppercase tracking-widest">
            <span>// NAVIGATION INDEX</span>
            <span className="text-slate-500">{filteredNav.length} NODES</span>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 py-2 px-2.5 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileOpen(false)}
                className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg font-mono text-xs transition-all duration-150 select-none group ${
                  isActive
                    ? 'text-cyan-300 font-bold bg-cyan-950/40 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,242,254,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent hover:border-white/5'
                }`}
              >
                {/* Active Indicator Bar on Left */}
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    className="absolute left-0 top-1 bottom-1 w-1 bg-cyan-400 rounded-r shadow-[0_0_8px_#00F2FE]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}

                {/* Tech Index Code e.g. [01] */}
                <span className={`text-[10px] font-bold ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400/70'}`}>
                  [{item.code}]
                </span>

                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-cyan-400 animate-pulse' : 'text-slate-400 group-hover:text-cyan-300'
                  }`}
                />

                {!collapsed && (
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <span className="truncate tracking-wide">{item.label}</span>
                    {item.highlight && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        CAPP
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-cyan-500/20 shrink-0 font-mono">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/70 border border-cyan-500/20 mb-2">
            <div className="w-7 h-7 rounded bg-gradient-to-tr from-cyan-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            {!collapsed && (
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] uppercase tracking-wider text-cyan-400">
                    ID: {user?.role}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border border-transparent hover:border-rose-500/30 transition ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>ABORT SESSION</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
};
