import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, Shield, GraduationCap, UserCheck, Lock, Mail, ArrowRight, Zap, Database, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { ThemeSwitcher } from '../components/ui/ThemeSwitcher';
import { BackgroundAmbiance } from '../components/ui/BackgroundAmbiance';
import { ScrollSteps } from '../components/ui/ScrollSteps';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { currentTheme, isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickLogin = (role) => {
    if (role === 'admin') {
      setEmail('admin@eps.edu');
      setPassword('Password@123');
    } else if (role === 'teacher') {
      setEmail('teacher@eps.edu');
      setPassword('Password@123');
    } else if (role === 'student') {
      setEmail('student@eps.edu');
      setPassword('Password@123');
    }
  };

  return (
    <div className="min-h-screen bg-[#060813] dark:bg-[#060813] light:bg-[#fcfcff] text-slate-100 dark:text-slate-100 light:text-slate-900 flex flex-col items-center justify-start p-4 sm:p-6 relative overflow-x-hidden transition-colors duration-300 selection:bg-purple-500/30">
      {/* Dynamic Cosmic Background with Aurora Mesh, Cyber Grid & Ambient Particles */}
      <BackgroundAmbiance />

      {/* Top Navbar with Theme Switcher */}
      <div className="w-full max-w-7xl flex items-center justify-between py-2 mb-4 sm:mb-8 relative z-20">
        <div className="flex items-center gap-2.5">
          <div
            className="p-2 rounded-xl shadow-md shrink-0"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
            }}
          >
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white dark:text-white light:text-slate-900">
              CAPP <span style={{ color: currentTheme.primary }}>ENGINE</span>
            </span>
            <span className="block text-[10px] uppercase font-mono tracking-widest text-slate-400">
              Parallel Examination Core
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
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

          <ThemeSwitcher align="right" />
        </div>
      </div>

      {/* Hero & Login Section */}
      <div className="relative z-10 w-full max-w-5xl min-h-[75vh] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
        {/* Left Hero Column */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 space-y-6"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-semibold"
            style={{
              backgroundColor: `${currentTheme.primary}18`,
              borderColor: `${currentTheme.primary}40`,
              color: currentTheme.primary,
            }}
          >
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            Parallel Architecture & CAPP Core
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            High-Performance <br />
            <span
              className={`bg-clip-text text-transparent bg-gradient-to-r ${currentTheme.textGradient}`}
            >
              Examination & Result
            </span>{' '}
            Processing
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
            Enterprise academic governance featuring a multi-threaded parallel computation engine.
            Experience true multi-core speedup, Amdahl's Law benchmarks, and zero-defect grade card generation.
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="obsidian-card p-3 rounded-2xl">
              <Cpu className="w-5 h-5 mb-1.5" style={{ color: currentTheme.primary }} />
              <p className="text-xs font-bold text-white font-mono">Worker Pool</p>
              <p className="text-[11px] text-slate-400">Multi-threaded core</p>
            </div>
            <div className="obsidian-card p-3 rounded-2xl">
              <Database className="w-5 h-5 mb-1.5" style={{ color: currentTheme.secondary }} />
              <p className="text-xs font-bold text-white font-mono">100k+ Records</p>
              <p className="text-[11px] text-slate-400">Sub-second batches</p>
            </div>
            <div className="obsidian-card p-3 rounded-2xl">
              <Shield className="w-5 h-5 text-emerald-400 mb-1.5" />
              <p className="text-xs font-bold text-white font-mono">Audit Trail</p>
              <p className="text-[11px] text-slate-400">Tamper-evident logs</p>
            </div>
          </div>
        </motion.div>

        {/* Right Form Column */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="lg:col-span-5 obsidian-card rounded-3xl p-6 sm:p-8 shadow-2xl relative"
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-2.5 rounded-2xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
              }}
            >
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Portal Authentication</h2>
              <p className="text-xs text-slate-400">Sign in to your authorized workspace</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                University Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@eps.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className={`w-full py-3 mt-2 ${currentTheme.primaryBtn}`}
              loading={loading}
              icon={ArrowRight}
            >
              Authenticate & Launch
            </Button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Quick Demo Fill
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillQuickLogin('admin')}
                className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-rose-300 transition hover:border-rose-500/50"
              >
                <Shield className="w-4 h-4 text-rose-400" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => fillQuickLogin('teacher')}
                className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-indigo-300 transition hover:border-indigo-500/50"
              >
                <UserCheck className="w-4 h-4 text-indigo-400" />
                <span>Teacher</span>
              </button>
              <button
                type="button"
                onClick={() => fillQuickLogin('student')}
                className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-emerald-300 transition hover:border-emerald-500/50"
              >
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>Student</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Interactive Feature 2: Scroll-Triggered Step-by-Step CAPP Pipeline Reveal */}
      <div className="relative z-10 w-full border-t border-white/10 dark:border-white/10 light:border-slate-200 pt-8">
        <ScrollSteps />
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mt-12 py-6 border-t border-white/10 dark:border-white/10 light:border-slate-200 text-center text-xs text-slate-500 font-mono">
        <p>CAPP Engine • High-Performance Examination Architecture • Computer Architecture & Parallel Processing</p>
      </footer>
    </div>
  );
};
