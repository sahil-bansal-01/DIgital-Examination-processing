import React, { useState, useEffect } from 'react';
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
  Activity, 
  CheckCircle2, 
  Radio, 
  Layers, 
  Sparkles,
  Server,
  KeyRound,
  FlaskConical
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BackgroundAmbiance } from '../components/ui/BackgroundAmbiance';
import { ScrollSteps } from '../components/ui/ScrollSteps';

export const Login = () => {
  const [selectedRole, setSelectedRole] = useState('admin'); // 'admin', 'teacher', 'student'
  const [email, setEmail] = useState('admin@eps.edu');
  const [password, setPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);
  const [activeNode, setActiveNode] = useState(3); // default highlighted worker node
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Role quick select handler
  const handleSelectRole = (role) => {
    setSelectedRole(role);
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

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      toast.error('ACCESS DENIED: Email and password required');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`SESSION INITIALISED: Welcome, ${user.name}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'AUTHENTICATION REJECTED: Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // Process Map nodes definition
  const nodes = [
    { id: 1, label: 'EXAM', sub: '01 / CONFIG', x: 12, y: 35 },
    { id: 2, label: 'ANSWERS', sub: '02 / INGEST', x: 88, y: 35 },
    { id: 3, label: 'WORKERS', sub: '24 / ACTIVE', x: 88, y: 68, active: true },
    { id: 4, label: 'VALIDATION', sub: '03 / VERIFY', x: 62, y: 88 },
    { id: 5, label: 'RESULTS', sub: '04 / OUTPUT', x: 38, y: 88 },
    { id: 6, label: 'AUDIT', sub: '05 / TRACK', x: 12, y: 68 },
  ];

  return (
    <div className="min-h-screen bg-[#030508] text-slate-100 flex flex-col items-center justify-start p-3 sm:p-6 relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      {/* Sci-Fi Deep Space Ambient System */}
      <BackgroundAmbiance />

      {/* 1. TOP STATUS BAR */}
      <header className="w-full max-w-7xl flex items-center justify-between py-3 border-b border-cyan-500/20 mb-6 relative z-20 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-cyan-950/40 border border-cyan-500/40 text-cyan-400">
            <Crosshair className="w-4 h-4 animate-spin" style={{ animationDuration: '24s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wider text-white">CAPP ENGINE</span>
              <span className="text-[10px] text-cyan-400/80 hidden sm:inline">// PARALLEL EXAMINATION CORE</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/capp-lab')}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-purple-950/60 border border-purple-500/50 hover:border-purple-400 text-purple-300 hover:text-white transition-all shadow-[0_0_10px_rgba(139,92,246,0.2)] font-mono text-[11px] cursor-pointer"
          >
            <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
            <span>CAPP LAB ↗</span>
          </button>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/60 border border-cyan-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
            <span className="text-emerald-400 font-bold tracking-wider text-[11px]">SYSTEM ONLINE</span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-slate-400 text-[10px] hidden md:inline">INSTANCE C2-80 / REGION 04</span>
          </div>
        </div>
      </header>

      {/* 2. HERO DISPLAY HEADER */}
      <div className="w-full max-w-7xl mb-8 relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 font-mono">
        <div>
          <div className="text-[11px] text-cyan-400 tracking-widest uppercase mb-1">
            // ACADEMIC COMPUTE / COMMAND CENTER
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase leading-none font-mono">
            EXAMINATION.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-200 to-white">
              ENGINEERED AT SCALE.
            </span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-2xl font-sans">
            High performance examination processing powered by parallel computation, automated evaluation and intelligent result generation.
          </p>
        </div>

        {/* Right System Specs Block */}
        <div className="p-3 rounded-lg border border-cyan-500/20 bg-[#0F172A]/60 backdrop-blur-xl text-[10px] space-y-1 text-slate-400 hidden lg:block shrink-0">
          <div className="flex items-center justify-between gap-6">
            <span>CORE BUILD:</span>
            <span className="text-cyan-400 font-bold">2.4.12-STABLE</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span>UPTIME:</span>
            <span className="text-emerald-400 font-bold">+23 XXX 18M</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span>ENCRYPTION:</span>
            <span className="text-purple-400 font-bold">AES-256 ACTIVE</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN COMMAND STAGE (2 Columns: Process Map + Authorized Access) */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 mb-8">
        
        {/* LEFT COLUMN: LIVE PROCESS MAP */}
        <div className="lg:col-span-7 bg-[#0F172A]/50 border border-cyan-500/30 rounded-xl p-4 sm:p-6 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between tech-corners min-h-[480px]">
          {/* Top Panel Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 font-mono text-xs mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00F2FE]" />
              <span className="text-white font-bold tracking-wider">// LIVE PROCESS MAP</span>
            </div>
            <div className="text-[10px] text-cyan-400/70">
              DIFF / 07.12.83
            </div>
          </div>

          {/* Center Interactive Graph Stage */}
          <div className="relative flex-1 flex items-center justify-center min-h-[300px] my-2 select-none">
            {/* SVG Connecting Ray Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0 0 4px rgba(0,242,254,0.3))' }}>
              <defs>
                <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#00F2FE" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#00F2FE" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Connecting lines from center (50%, 50%) to surrounding nodes */}
              <line x1="50%" y1="50%" x2="18%" y2="35%" stroke="#00F2FE" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
              <line x1="50%" y1="50%" x2="82%" y2="35%" stroke="#00F2FE" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
              <line x1="50%" y1="50%" x2="82%" y2="68%" stroke="#00F2FE" strokeWidth="2" opacity="0.8" />
              <line x1="50%" y1="50%" x2="62%" y2="84%" stroke="#00F2FE" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
              <line x1="50%" y1="50%" x2="38%" y2="84%" stroke="#00F2FE" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
              <line x1="50%" y1="50%" x2="18%" y2="68%" stroke="#00F2FE" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
            </svg>

            {/* Central Glowing Engine Node */}
            <div className="relative z-10 flex flex-col items-center justify-center p-6 rounded-full bg-gradient-to-tr from-[#080C14] via-[#1E1B4B] to-[#080C14] border-2 border-cyan-400 shadow-[0_0_35px_rgba(0,242,254,0.5)] w-36 h-36">
              <div className="absolute inset-0 rounded-full border border-purple-500/40 animate-ping" style={{ animationDuration: '4s' }} />
              <div className="text-center font-mono">
                <span className="block text-xs font-extrabold text-white tracking-widest">CAPP</span>
                <span className="block text-[11px] font-bold text-cyan-400">ENGINE</span>
                <div className="mt-1 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[8px] uppercase tracking-wider text-emerald-300">COMPUTE ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Peripheral Nodes */}
            {/* 01. Exam Node */}
            <div className="absolute left-[8%] top-[25%] p-2 rounded-lg bg-[#080C14]/90 border border-cyan-500/30 font-mono text-center shadow-lg hover:border-cyan-400 transition cursor-pointer">
              <p className="text-[10px] font-bold text-white">EXAM</p>
              <p className="text-[8px] text-slate-400">01 / CONFIG</p>
            </div>

            {/* 02. Answers Node */}
            <div className="absolute right-[8%] top-[25%] p-2 rounded-lg bg-[#080C14]/90 border border-cyan-500/30 font-mono text-center shadow-lg hover:border-cyan-400 transition cursor-pointer">
              <p className="text-[10px] font-bold text-white">ANSWERS</p>
              <p className="text-[8px] text-slate-400">02 / INGEST</p>
            </div>

            {/* 03. Parallel Workers Node (Highlighted) */}
            <div className="absolute right-[8%] top-[60%] p-2.5 rounded-lg bg-cyan-950/80 border-2 border-cyan-400 font-mono text-center shadow-[0_0_20px_rgba(0,242,254,0.4)] cursor-pointer">
              <div className="flex items-center gap-1 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <p className="text-[11px] font-extrabold text-cyan-300">WORKERS</p>
              </div>
              <p className="text-[9px] font-bold text-white">24 / ACTIVE</p>
            </div>

            {/* 04. Validation Node */}
            <div className="absolute right-[28%] bottom-[5%] p-2 rounded-lg bg-[#080C14]/90 border border-cyan-500/30 font-mono text-center shadow-lg hover:border-cyan-400 transition cursor-pointer">
              <p className="text-[10px] font-bold text-white">VALIDATION</p>
              <p className="text-[8px] text-slate-400">03 / VERIFY</p>
            </div>

            {/* 05. Results Node */}
            <div className="absolute left-[28%] bottom-[5%] p-2 rounded-lg bg-[#080C14]/90 border border-cyan-500/30 font-mono text-center shadow-lg hover:border-cyan-400 transition cursor-pointer">
              <p className="text-[10px] font-bold text-white">RESULTS</p>
              <p className="text-[8px] text-slate-400">04 / OUTPUT</p>
            </div>

            {/* 06. Audit Node */}
            <div className="absolute left-[8%] top-[60%] p-2 rounded-lg bg-[#080C14]/90 border border-cyan-500/30 font-mono text-center shadow-lg hover:border-cyan-400 transition cursor-pointer">
              <p className="text-[10px] font-bold text-white">AUDIT</p>
              <p className="text-[8px] text-slate-400">05 / TRACK</p>
            </div>
          </div>

          {/* Process Map Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-cyan-500/20 font-mono text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>FLOW: ACTIVE</span>
            </div>
            <div>NODES: 6/6 OK</div>
            <div className="text-cyan-400 font-bold">LATENCY: 18 MS</div>
          </div>
        </div>

        {/* RIGHT COLUMN: AUTHORIZED ACCESS FORM */}
        <div className="lg:col-span-5 bg-[#0F172A]/70 border border-cyan-500/40 rounded-xl p-5 sm:p-7 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col justify-between tech-corners font-mono">
          <div>
            {/* Header with ACCESS AUTH badge */}
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-4">
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-400 font-bold">
                ACCESS AUTH // 01
              </span>
              <div className="p-1 rounded bg-slate-900 border border-slate-700 text-slate-400">
                <Terminal className="w-3.5 h-3.5" />
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-white tracking-tight uppercase">
              AUTHORIZED ACCESS
            </h2>
            <p className="text-xs text-cyan-400/80 mb-5">
              // CAPP Examination Core
            </p>

            {/* Role Selectors */}
            <div className="space-y-1.5 mb-5">
              <label className="block text-[10px] text-slate-400 uppercase tracking-widest">
                SELECT ACCESS MODULE:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectRole('admin')}
                  className={`p-2 rounded-lg border text-left transition ${
                    selectedRole === 'admin'
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                      : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <div className="text-[10px] font-bold text-cyan-400">01 / ADMIN</div>
                  <div className="text-[8px] text-slate-300 leading-tight">SYSTEM CONTROL</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('teacher')}
                  className={`p-2 rounded-lg border text-left transition ${
                    selectedRole === 'teacher'
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                      : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <div className="text-[10px] font-bold text-cyan-400">02 / TEACHER</div>
                  <div className="text-[8px] text-slate-300 leading-tight">EXAM MANAGEMENT</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('student')}
                  className={`p-2 rounded-lg border text-left transition ${
                    selectedRole === 'student'
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                      : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <div className="text-[10px] font-bold text-cyan-400">03 / STUDENT</div>
                  <div className="text-[8px] text-slate-300 leading-tight">ACADEMIC ACCESS</div>
                </button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1.5">
                  UNIVERSITY EMAIL
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@eps.edu"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#080C14] border border-cyan-500/30 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-300 uppercase tracking-widest mb-1.5">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#080C14] border border-cyan-500/30 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                    required
                  />
                </div>
              </div>

              {/* Glowing Initialise Session Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-[#00F2FE] hover:bg-[#00D2FF] text-slate-950 font-mono font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.4)] hover:shadow-[0_0_30px_rgba(0,242,254,0.7)] transition active:scale-[0.99] mt-3"
              >
                <span>{loading ? 'INITIALISING SESSION...' : 'INITIALISE SESSION'}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Footnote */}
          <div className="mt-5 pt-3 border-t border-cyan-500/20 flex items-center justify-between text-[9px] text-slate-500">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              <span>SECURE CHANNEL // SESSION ENCRYPTED</span>
            </span>
            <span className="text-cyan-500">TLS 1.3</span>
          </div>
        </div>
      </div>

      {/* 4. SEGMENTED TELEMETRY HUD BAR */}
      <div className="w-full max-w-7xl mb-8 relative z-10 font-mono">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Item 1 */}
          <div className="p-3 rounded-lg bg-[#0F172A]/60 border border-cyan-500/20 backdrop-blur-xl">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>TELEMETRY</span>
            </div>
            <div className="text-xs font-bold text-cyan-300">// LIVE STREAM</div>
          </div>

          {/* Item 2 */}
          <div className="p-3 rounded-lg bg-[#0F172A]/60 border border-cyan-500/20 backdrop-blur-xl">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">PARALLEL WORKERS</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-white">24</span>
              <span className="text-[9px] text-cyan-400">ACTIVE</span>
            </div>
          </div>

          {/* Item 3 */}
          <div className="p-3 rounded-lg bg-[#0F172A]/60 border border-cyan-500/20 backdrop-blur-xl">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">ACTIVE EXAMS</div>
            <div className="text-lg font-bold text-white">08</div>
          </div>

          {/* Item 4 */}
          <div className="p-3 rounded-lg bg-[#0F172A]/60 border border-cyan-500/20 backdrop-blur-xl">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">PROCESSING QUEUED</div>
            <div className="text-lg font-bold text-cyan-400">1,284</div>
          </div>

          {/* Item 5 */}
          <div className="p-3 rounded-lg bg-[#0F172A]/60 border border-emerald-500/30 backdrop-blur-xl">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">RESULT ENGINE</div>
            <div className="text-lg font-bold text-emerald-400 tracking-wider">READY</div>
          </div>

          {/* Item 6 */}
          <div className="p-3 rounded-lg bg-[#0F172A]/60 border border-cyan-500/20 backdrop-blur-xl flex flex-col justify-center">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">CORE STATUS</div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
              <span>+ SYSTEM ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM PIPELINE FLOW */}
      <div className="w-full max-w-7xl mb-12 relative z-10 font-mono text-xs p-4 rounded-xl bg-[#0F172A]/40 border border-cyan-500/20 backdrop-blur-xl">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-cyan-500/10 text-[10px] text-slate-400">
          <span className="text-cyan-400 font-bold uppercase tracking-wider">// EXAMINATION PIPELINE</span>
          <span className="text-slate-500 hidden sm:inline">END-TO-END PROCESS / ALL SYSTEMS NOMINAL</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          <div className="p-2 rounded bg-slate-900/60 border border-white/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <div>
              <p className="text-[9px] text-slate-500">[01]</p>
              <p className="text-[10px] text-white font-bold">EXAM INPUT</p>
            </div>
          </div>

          <div className="p-2 rounded bg-slate-900/60 border border-white/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <div>
              <p className="text-[9px] text-slate-500">[02]</p>
              <p className="text-[10px] text-white font-bold">QUEUE</p>
            </div>
          </div>

          <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <div>
              <p className="text-[9px] text-cyan-400">[03]</p>
              <p className="text-[10px] text-cyan-300 font-bold">WORKERS</p>
            </div>
          </div>

          <div className="p-2 rounded bg-slate-900/60 border border-white/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <div>
              <p className="text-[9px] text-slate-500">[04]</p>
              <p className="text-[10px] text-white font-bold">VALIDATION</p>
            </div>
          </div>

          <div className="p-2 rounded bg-slate-900/60 border border-white/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <div>
              <p className="text-[9px] text-emerald-400">[05]</p>
              <p className="text-[10px] text-emerald-300 font-bold">RESULTS</p>
            </div>
          </div>

          <div className="p-2 rounded bg-slate-900/60 border border-white/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <div>
              <p className="text-[9px] text-purple-400">[06]</p>
              <p className="text-[10px] text-purple-300 font-bold">AUDIT</p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Interactive CAPP Architecture Pipeline Steps on Scroll */}
      <div className="w-full max-w-7xl relative z-10 border-t border-cyan-500/20 pt-8">
        <ScrollSteps />
      </div>

      {/* 7. Footer */}
      <footer className="w-full max-w-7xl mt-8 py-4 border-t border-cyan-500/20 text-center font-mono text-[10px] text-slate-500 flex items-center justify-between">
        <span>CAPP ENGINE // PARALLEL EXAMINATION CORE</span>
        <span>COMPUTE GATEWAY // OK-2026</span>
      </footer>
    </div>
  );
};
