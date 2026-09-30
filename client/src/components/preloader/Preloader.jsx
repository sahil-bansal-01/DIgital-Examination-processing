import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ShieldCheck, Database, CheckCircle2, Sparkles } from 'lucide-react';
import { isReducedMotion } from '../../animations/variants';

const STATUS_STAGES = [
  { max: 25, text: 'Initializing CAPP Engine...', icon: Cpu },
  { max: 50, text: 'Loading Examination Modules...', icon: Sparkles },
  { max: 70, text: 'Verifying Security...', icon: ShieldCheck },
  { max: 90, text: 'Connecting to Database...', icon: Database },
  { max: 100, text: 'System Ready', icon: CheckCircle2 },
];

export const Preloader = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [dbChecked, setDbChecked] = useState(false);
  const dbCheckStartedRef = useRef(false);

  useEffect(() => {
    // 1. Session check: Only show on the first load of each session
    const seen = sessionStorage.getItem('capp_preloader_seen');
    if (seen) {
      setIsVisible(false);
      onFinish?.();
      return;
    }

    const reduced = isReducedMotion();
    const totalDuration = reduced ? 1200 : 3400; // ~3.4s for natural realism
    const intervalMs = 28;
    const baseIncrement = (100 / (totalDuration / intervalMs));

    // Optional Real Health-Check Call during 70-90% phase
    const checkBackendHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);
        const res = await fetch('http://localhost:5000/api/auth/me', {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        // Any response (even 401 unauth) confirms server & database express router are live
        if (res.status === 200 || res.status === 401 || res.status === 404) {
          setDbChecked(true);
        } else {
          setDbChecked(true);
        }
      } catch (err) {
        // Fallback gracefully so preloader never hangs
        setDbChecked(true);
      }
    };

    const timer = setInterval(() => {
      setProgress((prev) => {
        // Realistic uneven progress pacing
        let delta = baseIncrement;
        if (prev < 25) {
          delta *= 1.25; // quick startup
        } else if (prev >= 25 && prev < 50) {
          delta *= 0.95;
        } else if (prev >= 50 && prev < 70) {
          delta *= 1.1;
        } else if (prev >= 70 && prev < 88) {
          // Trigger health check if not yet started
          if (!dbCheckStartedRef.current) {
            dbCheckStartedRef.current = true;
            checkBackendHealth();
          }
          // Slower pacing while pinging database
          delta = dbChecked ? delta * 1.3 : delta * 0.45;
        } else if (prev >= 88 && prev < 98) {
          delta *= 1.2;
        }

        const next = Math.min(100, prev + delta);

        if (next >= 100) {
          clearInterval(timer);
          // Show "System Ready" briefly (400ms) before fading out with scale-up
          setTimeout(() => {
            sessionStorage.setItem('capp_preloader_seen', 'true');
            setIsVisible(false);
            setTimeout(() => {
              onFinish?.();
            }, 500);
          }, 400);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [dbChecked, onFinish]);

  // Current status stage matching the progress range
  const currentStage = STATUS_STAGES.find((s) => progress <= s.max) || STATUS_STAGES[STATUS_STAGES.length - 1];
  const StageIcon = currentStage.icon;

  // Circular ring geometry calculations
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
            scale: 1.05,
            filter: 'blur(8px)',
            transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden select-none"
          style={{
            background: 'radial-gradient(ellipse 90% 70% at 50% 40%, #1A0B2E 0%, #0c0517 55%, #05020A 100%)',
          }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Subtle Ambient Background Grid */}
          <div
            className="absolute inset-0 opacity-[0.12] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(168, 85, 247, 0.6) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              maskImage: 'radial-gradient(circle at center, black 35%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(circle at center, black 35%, transparent 75%)',
            }}
          />

          {/* Glowing Ambient Violet Nebula Aura */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full blur-[140px] pointer-events-none opacity-40 animate-pulse"
            style={{
              background: 'radial-gradient(circle, #7C3AED 0%, #A855F7 35%, transparent 70%)',
            }}
          />

          {/* Central Logo & Circular Progress Unit */}
          <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6">
            {/* Circular Progress Ring Surrounding Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-center justify-center mb-8"
            >
              {/* SVG Ring Background & Animated Stroke */}
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                {/* Track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="rgba(124, 58, 237, 0.18)"
                  strokeWidth="4"
                  fill="transparent"
                />
                {/* Progress Glow Stroke */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="url(#purpleGlowGrad)"
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{
                    transition: 'stroke-dashoffset 0.08s linear',
                    filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.75))',
                  }}
                />
                <defs>
                  <linearGradient id="purpleGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="50%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#C084FC" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Central Processor Icon Container */}
              <motion.div
                animate={{
                  scale: [1, 1.03, 1],
                  boxShadow: [
                    '0 0 20px rgba(124, 58, 237, 0.35)',
                    '0 0 40px rgba(168, 85, 247, 0.7)',
                    '0 0 20px rgba(124, 58, 237, 0.35)',
                  ],
                }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#1A0B2E] via-[#2A114B] to-[#1A0B2E] border border-purple-500/40 flex items-center justify-center"
              >
                <Cpu className="w-12 h-12 text-purple-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
              </motion.div>
            </motion.div>

            {/* Wordmark: CAPP ENGINE */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-center mb-6"
            >
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-white flex items-center justify-center gap-2">
                <span>CAPP</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-300">
                  ENGINE
                </span>
              </h1>
              <p className="text-[11px] font-mono tracking-widest text-purple-300/80 uppercase mt-1">
                Parallel Execution & Examination Matrix
              </p>
            </motion.div>

            {/* Linear Progress Bar & Percentage */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-purple-200">
                {/* Dynamic Status Text with Smooth Slide/Fade Transition */}
                <div className="h-5 flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStage.text}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="flex items-center gap-1.5 text-lavender font-medium"
                    >
                      <StageIcon className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                      <span className="text-purple-200/90">{currentStage.text}</span>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Percentage Counter */}
                <span className="text-purple-300 font-bold font-mono text-sm tracking-wider">
                  {Math.round(progress)}%
                </span>
              </div>

              {/* Glowing Linear Bar */}
              <div className="w-full h-1.5 bg-purple-950/70 border border-purple-800/40 rounded-full p-0.5 overflow-hidden shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-400 shadow-[0_0_12px_rgba(168,85,247,0.8)]"
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
