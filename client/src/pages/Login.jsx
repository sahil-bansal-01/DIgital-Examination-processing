import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Crosshair, 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowUpRight, 
  Radio, 
  FlaskConical,
  RotateCcw,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BackgroundAmbiance } from '../components/ui/BackgroundAmbiance';
import { CappProcessMap } from '../components/capp/CappProcessMap';
import { CappCircuitLogo } from '../components/capp/CappCircuitLogo';

export const Login = () => {
  const [selectedRole, setSelectedRole] = useState('admin'); // 'admin', 'teacher', 'student'
  const [email, setEmail] = useState('admin@eps.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [actualPassword, setActualPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Handle module toggle tab selection
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    if (role === 'admin') {
      setEmail('admin@eps.edu');
      setActualPassword('Password@123');
      setPassword('••••••••••••');
    } else if (role === 'teacher') {
      setEmail('teacher@eps.edu');
      setActualPassword('Password@123');
      setPassword('••••••••••••');
    } else if (role === 'student') {
      setEmail('student@eps.edu');
      setActualPassword('Password@123');
      setPassword('••••••••••••');
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setActualPassword(val);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email) {
      toast.error('ACCESS DENIED: Email address required');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, actualPassword || 'Password@123');
      toast.success(`SESSION INITIALISED: Access granted for ${user.name}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'AUTHENTICATION REJECTED: Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const replayBootSequence = () => {
    window.dispatchEvent(new CustomEvent('capp-replay-preloader'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B111E] to-[#040810] text-slate-100 flex flex-col items-center justify-start p-3 sm:p-6 relative overflow-x-hidden selection:bg-[#00F2FF] selection:text-black font-mono">
      {/* Sci-Fi Deep Space Ambient System with Subtle Grid */}
      <BackgroundAmbiance />

      {/* 1. TOP UTILITY STRIP */}
      <header className="w-full max-w-7xl flex items-center justify-between py-2.5 px-1 border-b border-[#00F2FF]/20 mb-6 relative z-20 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-1 rounded bg-cyan-950/60 border border-[#00F2FF]/40 text-[#00F2FF] shadow-[0_0_10px_rgba(0,242,255,0.3)]">
            <Crosshair className="w-4 h-4 animate-spin" style={{ animationDuration: '24s' }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm sm:text-base tracking-wider text-white">CAPP ENGINE</span>
            <span className="text-[10px] text-[#00F2FF]/80 hidden md:inline">// PARALLEL EXAMINATION CORE</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Replay Preloader Button */}
          <button
            onClick={replayBootSequence}
            title="Replay HUD boot preloader sequence"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/50 border border-cyan-500/30 hover:border-[#00F2FF] text-[10px] text-cyan-300 hover:text-white transition shadow-[0_0_8px_rgba(0,242,255,0.15)] cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-[#00F2FF]" />
            <span className="hidden sm:inline">REPLAY HUD BOOT</span>
          </button>

          {/* CAPP Lab Shortcut */}
          <button
            onClick={() => navigate('/capp-lab')}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-purple-950/60 border border-purple-500/50 hover:border-purple-400 text-purple-300 hover:text-white transition shadow-[0_0_10px_rgba(168,85,247,0.2)] text-[11px] cursor-pointer"
          >
            <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
            <span>CAPP LAB ↗</span>
          </button>

          {/* System Online Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#080D1A]/80 border border-[#00F2FF]/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
            <span className="text-emerald-400 font-bold tracking-wider text-[11px]">SYSTEM ONLINE</span>
            <span className="text-slate-600 hidden lg:inline">|</span>
            <span className="text-slate-400 text-[10px] hidden lg:inline">INSTANCE C2-80 / REGION 04</span>
          </div>
        </div>
      </header>

      {/* 2. TOP HEADER BAR (Exact Match per spec) */}
      <div className="w-full max-w-7xl mb-7 relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        {/* Left: Bold text "ENGINEERED AT SCALE." with subtext */}
        <div className="max-w-3xl">
          <div className="text-[10px] text-[#00F2FF] tracking-[0.25em] uppercase mb-1 font-bold">
            // HIGH PERFORMANCE PARALLEL COMPUTATION & AUTOMATED EVALUATION
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase leading-none font-mono">
            <span className="text-slate-400 block text-2xl sm:text-3xl font-extrabold mb-1">EXAMINATION.</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-[#00F2FF] drop-shadow-[0_0_20px_rgba(0,242,255,0.4)]">
              ENGINEERED AT SCALE.
            </span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-2.5 font-sans leading-relaxed">
            High performance examination processing powered by parallel computation, automated evaluation and intelligent result generation.
          </p>
        </div>

        {/* Right: HUD metrics panel showing CORE BUILD, UPTIME, ENCRYPTION */}
        <div className="p-3.5 rounded-lg border border-[#00F2FF]/30 bg-[#0A101D]/80 backdrop-blur-xl text-xs space-y-1.5 text-slate-300 shadow-[0_0_20px_rgba(0,0,0,0.6)] shrink-0 w-full md:w-auto tech-corners">
          <div className="flex items-center justify-between gap-8">
            <span className="text-slate-400 font-medium">CORE BUILD:</span>
            <span className="text-[#00F2FF] font-extrabold tracking-wider">2.4.12-STABLE</span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="text-slate-400 font-medium">UPTIME:</span>
            <span className="text-emerald-400 font-extrabold tracking-wider">+23 XXX 18M</span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="text-slate-400 font-medium">ENCRYPTION:</span>
            <span className="text-purple-400 font-extrabold tracking-wider">AES-256 ACTIVE</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT: 2 COLUMNS (Left: Live Process Map, Right: Authorized Access) */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 mb-8">
        
        {/* LEFT SECTION ("// LIVE PROCESS MAP") */}
        <div className="lg:col-span-7 bg-[#0A101D]/75 border border-[#00F2FF]/30 rounded-xl p-4 sm:p-6 backdrop-blur-2xl relative overflow-hidden flex flex-col justify-between tech-corners min-h-[520px] shadow-[0_0_35px_rgba(0,0,0,0.7)]">
          {/* Subtle Cyber Grid Lines inside Panel */}
          <div
            className="absolute inset-0 pointer-events-none opacity-15"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(0, 242, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 242, 255, 0.1) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Interactive Live Process Map Component */}
          <div className="relative z-10 w-full h-full flex flex-col justify-between">
            <CappProcessMap />
          </div>
        </div>

        {/* RIGHT SECTION ("AUTHORIZED ACCESS // CAPP Examination Core") */}
        <div className="lg:col-span-5 bg-[#0A101D]/85 border border-[#00F2FF]/40 rounded-xl p-5 sm:p-7 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.85)] flex flex-col justify-between tech-corners">
          <div>
            {/* Header Badge & Title */}
            <div className="flex items-center justify-between pb-3 border-b border-[#00F2FF]/20 mb-4">
              <span className="px-2.5 py-0.5 rounded bg-[#00F2FF]/10 border border-[#00F2FF]/30 text-[10px] text-[#00F2FF] font-extrabold tracking-wider">
                ACCESS AUTH // 01
              </span>
              <div className="p-1 rounded bg-[#050912] border border-[#00F2FF]/20 text-[#00F2FF]">
                <Terminal className="w-3.5 h-3.5" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              AUTHORIZED ACCESS
            </h2>
            <p className="text-xs text-[#00F2FF] tracking-wider mb-5">
              // CAPP Examination Core
            </p>

            {/* Access Module Toggle Tabs (Exact Match per spec) */}
            <div className="space-y-1.5 mb-5">
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                ACCESS MODULE TOGGLE:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* 01 / ADMIN */}
                <button
                  type="button"
                  onClick={() => handleSelectRole('admin')}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedRole === 'admin'
                      ? 'bg-cyan-950/80 border-[#00F2FF] text-white shadow-[0_0_15px_rgba(0,242,255,0.4)] ring-1 ring-[#00F2FF]'
                      : 'bg-[#060B14]/80 border-slate-700/60 text-slate-400 hover:border-[#00F2FF]/50 hover:text-slate-200'
                  }`}
                >
                  <div className="text-[10px] font-extrabold text-[#00F2FF]">01 / ADMIN</div>
                  <div className="text-[8px] text-slate-300 font-semibold leading-tight mt-0.5">SYSTEM CONTROL</div>
                </button>

                {/* 02 / TEACHER */}
                <button
                  type="button"
                  onClick={() => handleSelectRole('teacher')}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedRole === 'teacher'
                      ? 'bg-cyan-950/80 border-[#00F2FF] text-white shadow-[0_0_15px_rgba(0,242,255,0.4)] ring-1 ring-[#00F2FF]'
                      : 'bg-[#060B14]/80 border-slate-700/60 text-slate-400 hover:border-[#00F2FF]/50 hover:text-slate-200'
                  }`}
                >
                  <div className="text-[10px] font-extrabold text-[#00F2FF]">02 / TEACHER</div>
                  <div className="text-[8px] text-slate-300 font-semibold leading-tight mt-0.5">EXAM MANAGEMENT</div>
                </button>

                {/* 03 / STUDENT */}
                <button
                  type="button"
                  onClick={() => handleSelectRole('student')}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedRole === 'student'
                      ? 'bg-cyan-950/80 border-[#00F2FF] text-white shadow-[0_0_15px_rgba(0,242,255,0.4)] ring-1 ring-[#00F2FF]'
                      : 'bg-[#060B14]/80 border-slate-700/60 text-slate-400 hover:border-[#00F2FF]/50 hover:text-slate-200'
                  }`}
                >
                  <div className="text-[10px] font-extrabold text-[#00F2FF]">03 / STUDENT</div>
                  <div className="text-[8px] text-slate-300 font-semibold leading-tight mt-0.5">ACADEMIC ACCESS</div>
                </button>
              </div>
            </div>

            {/* Login Form Fields with Cyan Focus Glow */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: UNIVERSITY EMAIL */}
              <div>
                <label className="block text-[10px] text-slate-300 uppercase tracking-widest font-bold mb-1.5">
                  UNIVERSITY EMAIL
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#00F2FF] absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@eps.edu"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#050912] border border-[#00F2FF]/35 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00F2FF] focus:ring-2 focus:ring-[#00F2FF]/60 shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)] focus:shadow-[0_0_15px_rgba(0,242,255,0.35)] transition"
                    required
                  />
                </div>
              </div>

              {/* Field 2: PASSWORD with dots */}
              <div>
                <label className="block text-[10px] text-slate-300 uppercase tracking-widest font-bold mb-1.5">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#00F2FF] absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#050912] border border-[#00F2FF]/35 rounded-lg text-xs text-white tracking-widest placeholder-slate-500 focus:outline-none focus:border-[#00F2FF] focus:ring-2 focus:ring-[#00F2FF]/60 shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)] focus:shadow-[0_0_15px_rgba(0,242,255,0.35)] transition"
                    required
                  />
                </div>
              </div>

              {/* Main CTA Button: Full-width bright cyan (#00F2FF) button with black bold text and hover glow */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-lg bg-[#00F2FF] hover:bg-[#33F5FF] text-black font-mono font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,242,255,0.5)] hover:shadow-[0_0_40px_rgba(0,242,255,0.85)] active:scale-[0.99] transition duration-200 cursor-pointer mt-4"
              >
                <span>{loading ? 'INITIALISING SESSION...' : 'INITIALISE SESSION ↗'}</span>
              </button>
            </form>
          </div>

          {/* Security Channel Footnote */}
          <div className="mt-6 pt-3.5 border-t border-[#00F2FF]/20 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00F2FF]" />
              <span>SECURE CHANNEL // SESSION ENCRYPTED</span>
            </span>
            <span className="text-[#00F2FF] font-bold">TLS 1.3 / AES-256</span>
          </div>
        </div>
      </div>

      {/* 4. SEGMENTED TELEMETRY HUD BAR */}
      <div className="w-full max-w-7xl mb-8 relative z-10 font-mono">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-lg bg-[#0A101D]/70 border border-[#00F2FF]/20 backdrop-blur-xl">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
              <Radio className="w-3 h-3 text-[#00F2FF] animate-pulse" />
              <span>TELEMETRY</span>
            </div>
            <div className="text-xs font-bold text-cyan-300">// LIVE STREAM</div>
          </div>

          <div className="p-3 rounded-lg bg-[#0A101D]/70 border border-[#00F2FF]/20 backdrop-blur-xl">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">PARALLEL WORKERS</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-white">24</span>
              <span className="text-[9px] text-[#00F2FF] font-bold">ACTIVE</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#0A101D]/70 border border-[#00F2FF]/20 backdrop-blur-xl">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">ACTIVE EXAMS</div>
            <div className="text-lg font-bold text-white">08</div>
          </div>

          <div className="p-3 rounded-lg bg-[#0A101D]/70 border border-[#00F2FF]/20 backdrop-blur-xl">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">PROCESSING QUEUED</div>
            <div className="text-lg font-bold text-[#00F2FF]">1,284</div>
          </div>

          <div className="p-3 rounded-lg bg-[#0A101D]/70 border border-emerald-500/30 backdrop-blur-xl">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">RESULT ENGINE</div>
            <div className="text-lg font-bold text-emerald-400 tracking-wider">READY</div>
          </div>

          <div className="p-3 rounded-lg bg-[#0A101D]/70 border border-[#00F2FF]/20 backdrop-blur-xl flex flex-col justify-center">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">CORE STATUS</div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
              <span>+ SYSTEM ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM PIPELINE FLOW INDICATOR */}
      <div className="w-full max-w-7xl mb-8 relative z-10 font-mono text-xs p-4 rounded-xl bg-[#0A101D]/60 border border-[#00F2FF]/20 backdrop-blur-xl">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#00F2FF]/15 text-[10px] text-slate-400">
          <span className="text-[#00F2FF] font-bold uppercase tracking-wider">// EXAMINATION PIPELINE</span>
          <span className="text-slate-500 hidden sm:inline">END-TO-END PROCESS / ALL SYSTEMS NOMINAL</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          <div className="p-2 rounded bg-[#060B14] border border-white/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00F2FF]" />
            <div>
              <p className="text-[9px] text-slate-500">[01]</p>
              <p className="text-[10px] text-white font-bold">EXAM INPUT</p>
            </div>
          </div>

          <div className="p-2 rounded bg-[#060B14] border border-white/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00F2FF]" />
            <div>
              <p className="text-[9px] text-slate-500">[02]</p>
              <p className="text-[10px] text-white font-bold">QUEUE</p>
            </div>
          </div>

          <div className="p-2 rounded bg-cyan-950/60 border border-[#00F2FF]/40 flex items-center gap-2 shadow-[0_0_10px_rgba(0,242,255,0.2)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00F2FF] animate-pulse" />
            <div>
              <p className="text-[9px] text-[#00F2FF]">[03]</p>
              <p className="text-[10px] text-cyan-300 font-bold">WORKERS</p>
            </div>
          </div>

          <div className="p-2 rounded bg-[#060B14] border border-white/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00F2FF]" />
            <div>
              <p className="text-[9px] text-slate-500">[04]</p>
              <p className="text-[10px] text-white font-bold">VALIDATION</p>
            </div>
          </div>

          <div className="p-2 rounded bg-[#060B14] border border-white/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <div>
              <p className="text-[9px] text-emerald-400">[05]</p>
              <p className="text-[10px] text-emerald-300 font-bold">RESULTS</p>
            </div>
          </div>

          <div className="p-2 rounded bg-[#060B14] border border-white/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <div>
              <p className="text-[9px] text-purple-400">[06]</p>
              <p className="text-[10px] text-purple-300 font-bold">AUDIT</p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. FOOTER */}
      <footer className="w-full max-w-7xl mt-4 py-4 border-t border-[#00F2FF]/20 text-center font-mono text-[10px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FF]" />
          <span>CAPP ENGINE // HIGH PERFORMANCE PARALLEL COMPUTATION & AUTOMATED EVALUATION SYSTEM</span>
        </span>
        <span className="text-slate-500">COMPUTE GATEWAY // OK-2026 // AES-256 ACTIVE</span>
      </footer>
    </div>
  );
};
