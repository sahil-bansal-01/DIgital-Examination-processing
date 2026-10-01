import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Zap, 
  Bell, 
  Crosshair, 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  LogOut,
  User,
  Shield,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = ({ setIsMobileOpen }) => {
  const { user, logout, isAdmin, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');
  const [timeZone, setTimeZone] = useState('IST'); // 'IST' | 'UTC'
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [clusterLatency, setClusterLatency] = useState('0.2ms');
  const [gpuLoad, setGpuLoad] = useState('14%');

  // Live real-time system clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      if (timeZone === 'UTC') {
        setCurrentTime(now.toUTCString().slice(17, 25) + ' UTC');
      } else {
        setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }) + ' IST');
      }
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [timeZone]);

  // Subtle telemetry jitter for futuristic live feel
  useEffect(() => {
    const interval = setInterval(() => {
      const latencies = ['0.2ms', '0.18ms', '0.24ms', '0.21ms', '0.19ms'];
      const loads = ['14%', '15%', '13%', '16%', '14%'];
      setClusterLatency(latencies[Math.floor(Math.random() * latencies.length)]);
      setGpuLoad(loads[Math.floor(Math.random() * loads.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sampleNotifications = [
    { id: 1, title: 'Worker Pool Re-balanced', time: '1m ago', type: 'info' },
    { id: 2, title: 'CS301 Results Verified', time: '14m ago', type: 'success' },
    { id: 3, title: 'Amdahl Speedup 3.82x Reached', time: '1h ago', type: 'alert' },
  ];

  return (
    <header className="h-16 border-b border-cyan-500/20 bg-[#080C14]/90 backdrop-blur-2xl sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 shadow-2xl relative select-none">
      {/* Top subtle cyan scanline bar */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />

      {/* Left: Mobile Toggle & Minimalist Crosshair Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-cyan-400 hover:text-white hover:bg-cyan-500/10 border border-cyan-500/30 transition"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Branding */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative p-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 group-hover:border-cyan-400 transition-colors">
            <Crosshair className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '20s' }} />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-white tracking-widest uppercase">
                CAPP ENGINE
              </span>
              <span className="text-[10px] font-mono text-cyan-400/80">
                // PARALLEL COMPUTATION CORE
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Center: Live Status Ticker */}
      <div className="hidden md:flex items-center gap-4 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-slate-900/60 font-mono text-xs">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
          <span className="font-bold tracking-wider">SYSTEM ONLINE</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-1.5 text-cyan-300">
          <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span className="text-slate-400">LATENCY:</span>
          <span className="font-bold text-cyan-400">{clusterLatency}</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-1.5 text-purple-300">
          <Activity className="w-3 h-3 text-purple-400" />
          <span className="text-slate-400">LOAD:</span>
          <span className="font-bold text-purple-400">{gpuLoad}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Performance Lab Quick Trigger */}
        {(isAdmin || isTeacher) && (
          <Link
            to="/performance-lab"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 transition text-xs font-mono font-semibold shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">CAPP LAB</span>
          </Link>
        )}

        {/* Live System Clock (Monospace UTC/IST toggle) */}
        <button
          onClick={() => setTimeZone((prev) => (prev === 'IST' ? 'UTC' : 'IST'))}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition text-xs font-mono"
          title="Click to toggle UTC / IST"
        >
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{currentTime || '00:00:00'}</span>
        </button>

        {/* Notification Bell with Glowing Alert Badge */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="relative p-2 rounded-lg bg-slate-900/70 border border-slate-700/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition"
            aria-label="System Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00F2FE]" />
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#080C14] border border-cyan-500/30 rounded-xl shadow-2xl p-3 z-50 tech-corners">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 font-mono text-xs">
                <span className="text-cyan-400 font-bold uppercase tracking-wider">// SYSTEM NOTIFICATIONS</span>
                <span className="text-[10px] text-emerald-400">3 NEW</span>
              </div>
              <div className="space-y-2">
                {sampleNotifications.map((n) => (
                  <div key={n.id} className="p-2 rounded bg-slate-900/70 border border-white/5 text-xs font-mono hover:border-cyan-500/30 transition">
                    <p className="text-slate-200 font-semibold">{n.title}</p>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 sm:px-2 sm:py-1.5 rounded-lg bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400 transition"
          >
            <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-cyan-600 to-purple-600 flex items-center justify-center text-white font-mono font-bold text-xs shadow-md">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-white font-mono leading-tight truncate max-w-[100px]">
                {user?.name}
              </p>
              <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono">
                {user?.role}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Dropdown Panel */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#080C14] border border-cyan-500/30 rounded-xl shadow-2xl p-2 z-50 tech-corners font-mono">
              <div className="p-2 border-b border-white/10 mb-1">
                <p className="text-xs text-white font-bold">{user?.name}</p>
                <p className="text-[10px] text-slate-400">{user?.email}</p>
                <div className="mt-1">
                  <Badge variant={isAdmin ? 'rose' : isTeacher ? 'indigo' : 'emerald'} size="xs">
                    {user?.role?.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 p-2 rounded text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>TERMINATE SESSION</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
