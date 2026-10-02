import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CappCircuitLogo } from '../capp/CappCircuitLogo';

const LOG_MESSAGES = [
  '[INITIALIZING HARDWARE CORES]',
  '[CHECKING WORKERS]',
  '[SPAWNING 24 PARALLEL THREADS]',
  '[COMPUTE ACTIVE]',
  '[AES-256 ENCRYPTION READY]',
  '[MAPPING EVALUATION BUS]',
  '[VALIDATING MEMORY REGISTERS]',
  '[ALL SYSTEMS NOMINAL - 100%]',
];

export const Preloader = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [logIndex, setLogIndex] = useState(0);

  // Allow re-triggering preloader anytime for demo / presentation
  useEffect(() => {
    const handleReplay = () => {
      setProgress(0);
      setIsVisible(true);
      setLogIndex(0);
    };
    window.addEventListener('capp-replay-preloader', handleReplay);
    return () => window.removeEventListener('capp-replay-preloader', handleReplay);
  }, []);

  useEffect(() => {
    if (!isVisible && progress >= 100) return;

    // Fast-updating status logs interval
    const logTimer = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % LOG_MESSAGES.length);
    }, 280);

    // Progress counter (smooth 0% to 100%)
    const durationMs = 2400; // ~2.4 seconds total smooth load
    const intervalMs = 20;
    const increment = 100 / (durationMs / intervalMs);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        let delta = increment;
        // Non-linear realistic feel (faster at start, steady mid, quick snap at 100)
        if (prev < 30) delta *= 1.4;
        else if (prev >= 30 && prev < 75) delta *= 0.85;
        else if (prev >= 75) delta *= 1.3;

        const next = Math.min(100, prev + delta);

        if (next >= 100) {
          clearInterval(progressTimer);
          clearInterval(logTimer);
          setLogIndex(LOG_MESSAGES.length - 1);

          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
              onFinish?.();
            }, 500);
          }, 450);

          return 100;
        }
        return next;
      });
    }, intervalMs);

    return () => {
      clearInterval(progressTimer);
      clearInterval(logTimer);
    };
  }, [isVisible, onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="capp-preloader-overlay"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.03,
            filter: 'blur(10px)',
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#040810] overflow-hidden select-none font-mono"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Subtle Cyber Grid Background Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage: `
                radial-gradient(circle at center, rgba(0, 242, 255, 0.12) 0%, transparent 65%),
                linear-gradient(to right, rgba(0, 242, 255, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 242, 255, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 36px 36px, 36px 36px',
            }}
          />

          {/* Central Deep Glow Aura (Cyan & Purple) */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none opacity-30 animate-pulse"
            style={{
              background: 'radial-gradient(circle, #00F2FF 0%, #A855F7 45%, transparent 70%)',
            }}
          />

          {/* Precision Corner HUD Guides */}
          <div className="absolute top-6 left-6 text-[10px] text-cyan-400/40 tracking-widest uppercase">
            // SYS.BOOT // SECURE ARCHITECTURE
          </div>
          <div className="absolute top-6 right-6 text-[10px] text-cyan-400/40 tracking-widest uppercase">
            AES-256 // ENCRYPTED
          </div>
          <div className="absolute bottom-6 left-6 text-[10px] text-cyan-400/40 tracking-widest uppercase">
            PARALLEL CORE // THREADS: 24
          </div>
          <div className="absolute bottom-6 right-6 text-[10px] text-cyan-400/40 tracking-widest uppercase">
            DIAGNOSTIC: OK-2026
          </div>

          {/* Center Stage: Glowing Hexagonal Circuit-Chip Core */}
          <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6">
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative mb-6"
            >
              {/* Circuit Logo Vector */}
              <CappCircuitLogo size={240} glow={true} animate={true} showLabel={false} />
            </motion.div>

            {/* Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-center mb-5"
            >
              <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-white uppercase">
                CAPP <span className="text-[#00F2FF] text-glow-cyan">ENGINE</span>
              </h1>
              <p className="text-[11px] tracking-[0.22em] text-[#00F2FF] font-semibold uppercase mt-1">
                // INITIALIZING CAPP EXAMINATION CORE...
              </p>
            </motion.div>

            {/* Progress Bar & Fast-Updating Status Logs */}
            <div className="w-full space-y-3 font-mono">
              {/* Status Header: Fast-Updating Status Log + Percent */}
              <div className="flex items-center justify-between text-xs px-0.5">
                <div className="flex items-center gap-2 text-cyan-300">
                  <span className="w-2 h-2 rounded-full bg-[#00F2FF] animate-ping" />
                  <span className="text-[11px] tracking-wider text-cyan-200 font-bold min-w-[200px]">
                    {LOG_MESSAGES[logIndex]}
                  </span>
                </div>
                <span className="text-[#00F2FF] font-bold text-sm tracking-wider">
                  {Math.round(progress)}%
                </span>
              </div>

              {/* Glowing Progress Bar Track & Bar */}
              <div className="relative w-full h-2 bg-[#080E1A] border border-[#00F2FF]/40 rounded-full p-[2px] overflow-hidden shadow-[0_0_15px_rgba(0,242,255,0.25)]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#00F2FF] via-[#38BDF8] to-[#A855F7] shadow-[0_0_12px_#00F2FF]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Sub-log Metrics */}
              <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 tracking-wider">
                <span>PARALLEL CHUNKER: ONLINE</span>
                <span className="text-[#00F2FF]">AES-256 GCM</span>
                <span>MEM: 512MB POOL</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
