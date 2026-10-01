import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ShieldCheck, Database, CheckCircle2, Crosshair, Sparkles } from 'lucide-react';
import { isReducedMotion } from '../../animations/variants';

const STATUS_STAGES = [
  { max: 25, text: 'BOOTING CAPP CORE...', icon: Cpu },
  { max: 50, text: 'INGESTING PARALLEL MATRICES...', icon: Sparkles },
  { max: 70, text: 'VERIFYING ENCRYPTION & ROLES...', icon: ShieldCheck },
  { max: 90, text: 'SYNCHRONIZING THREAD POOL...', icon: Database },
  { max: 100, text: 'COMMAND CENTER ONLINE', icon: CheckCircle2 },
];

export const Preloader = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [dbChecked, setDbChecked] = useState(false);
  const dbCheckStartedRef = useRef(false);

  useEffect(() => {
    const seen = sessionStorage.getItem('capp_preloader_seen');
    if (seen) {
      setIsVisible(false);
      onFinish?.();
      return;
    }

    const reduced = isReducedMotion();
    const totalDuration = reduced ? 1000 : 2600;
    const intervalMs = 24;
    const baseIncrement = (100 / (totalDuration / intervalMs));

    const timer = setInterval(() => {
      setProgress((prev) => {
        let delta = baseIncrement;
        if (prev < 30) delta *= 1.3;
        else if (prev >= 30 && prev < 75) delta *= 0.9;
        else if (prev >= 75) delta *= 1.25;

        const next = Math.min(100, prev + delta);

        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            sessionStorage.setItem('capp_preloader_seen', 'true');
            setIsVisible(false);
            setTimeout(() => {
              onFinish?.();
            }, 400);
          }, 350);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [onFinish]);

  const currentStage = STATUS_STAGES.find((s) => progress <= s.max) || STATUS_STAGES[STATUS_STAGES.length - 1];
  const StageIcon = currentStage.icon;

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="capp-preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: 'blur(8px)',
            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030508] overflow-hidden select-none"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Cyber Radial Grid */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #00F2FE 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
            }}
          />

          {/* Central Pulsing Cyan / Purple Halo */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-30 animate-pulse"
            style={{
              background: 'radial-gradient(circle, #00F2FE 0%, #8B5CF6 45%, transparent 70%)',
            }}
          />

          {/* Central Logo & Circular Progress */}
          <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative flex items-center justify-center mb-8"
            >
              {/* SVG Ring Background & Stroke */}
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="rgba(0, 242, 254, 0.15)"
                  strokeWidth="3"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="url(#cyanGlowGrad)"
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{
                    transition: 'stroke-dashoffset 0.08s linear',
                    filter: 'drop-shadow(0 0 8px rgba(0, 242, 254, 0.8))',
                  }}
                />
                <defs>
                  <linearGradient id="cyanGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00F2FE" />
                    <stop offset="60%" stopColor="#00D2FF" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Central Crosshair / Core Icon */}
              <div className="absolute w-20 h-20 rounded-xl bg-[#080C14] border border-cyan-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(0,242,254,0.3)] tech-corners">
                <Crosshair className="w-10 h-10 text-cyan-400 animate-spin" style={{ animationDuration: '24s' }} />
              </div>
            </motion.div>

            {/* Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-center mb-6 font-mono"
            >
              <h1 className="text-2xl font-extrabold tracking-wider text-white">
                CAPP <span className="text-cyan-400">ENGINE</span>
              </h1>
              <p className="text-[10px] tracking-widest text-cyan-400/80 uppercase mt-1">
                // PARALLEL EXAMINATION CORE
              </p>
            </motion.div>

            {/* Linear Progress */}
            <div className="w-full space-y-2.5 font-mono">
              <div className="flex items-center justify-between text-xs">
                <div className="h-5 flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStage.text}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-1.5 text-cyan-300 text-[11px]"
                    >
                      <StageIcon className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      <span>{currentStage.text}</span>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <span className="text-cyan-400 font-bold text-xs tracking-wider">
                  {Math.round(progress)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-slate-900 border border-cyan-500/30 rounded-full p-0.2 overflow-hidden shadow-[0_0_10px_rgba(0,242,254,0.2)]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-purple-500 shadow-[0_0_10px_#00F2FE]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
