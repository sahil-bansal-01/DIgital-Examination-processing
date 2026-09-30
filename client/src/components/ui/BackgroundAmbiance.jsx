import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export const BackgroundAmbiance = () => {
  const { currentTheme, isDark } = useTheme();

  // Generate lightweight deterministic background particle coordinates
  const particles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: `${(i * 17) % 96 + 2}%`,
      top: `${(i * 23) % 94 + 3}%`,
      size: (i % 3) + 2,
      delay: (i % 5) * 0.8,
      duration: 3.5 + (i % 4) * 1.2,
      opacity: 0.2 + (i % 4) * 0.15,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      {/* 1. Base Midnight Cosmic Gradient or Pristine Frosted Light Quartz */}
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          isDark
            ? 'bg-gradient-to-b from-[#050711] via-[#070a16] to-[#04050b]'
            : 'bg-gradient-to-b from-[#fcfcff] via-[#f7f6fc] to-[#edeaf8]'
        }`}
      />

      {/* 2. Top Overhead Spotlight / Ethereal Radiant Beam */}
      <div
        className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[70vw] max-w-4xl h-80 rounded-full blur-[130px] transition-all duration-700 ${
          isDark ? 'opacity-40' : 'opacity-25'
        }`}
        style={{
          background: `radial-gradient(ellipse at center, ${currentTheme.primary} 0%, ${currentTheme.secondary} 45%, transparent 75%)`,
        }}
      />

      {/* 3. Floating Aurora Nebula Orbs */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute top-1/4 -left-20 w-[450px] h-[450px] rounded-full blur-[140px] pointer-events-none ${
          isDark ? 'opacity-25' : 'opacity-15'
        }`}
        style={{
          background: `radial-gradient(circle, ${currentTheme.primary} 0%, transparent 70%)`,
        }}
      />

      <motion.div
        animate={{
          x: [0, -35, 25, 0],
          y: [0, 35, -25, 0],
          scale: [1, 0.92, 1.08, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute bottom-1/6 -right-20 w-[480px] h-[480px] rounded-full blur-[150px] opacity-25 pointer-events-none ${
          isDark ? 'opacity-25' : 'opacity-15'
        }`}
        style={{
          background: `radial-gradient(circle, ${currentTheme.secondary} 0%, transparent 70%)`,
        }}
      />

      {/* 4. Center-Right Micro Ambient Glow */}
      <div
        className={`absolute top-2/3 left-1/3 w-80 h-80 rounded-full blur-[120px] pointer-events-none ${
          isDark ? 'opacity-15' : 'opacity-10'
        }`}
        style={{
          background: `radial-gradient(circle, ${currentTheme.accent} 0%, transparent 70%)`,
        }}
      />

      {/* 5. Cyber Geometric Dot Matrix Grid Overlay */}
      <div
        className={`absolute inset-0 bg-repeat ${
          isDark ? 'opacity-[0.14]' : 'opacity-[0.10]'
        }`}
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(circle, rgba(255, 255, 255, 0.7) 1px, transparent 1px)'
            : 'radial-gradient(circle, rgba(124, 58, 237, 0.35) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 40%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 40%, transparent 95%)',
        }}
      />

      {/* 6. Subtle Twinkling Quantum Stars / Compute Nodes */}
      {isDark && (
        <div className="absolute inset-0">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                backgroundColor: p.id % 2 === 0 ? currentTheme.primary : '#ffffff',
                boxShadow: `0 0 ${p.size * 3}px ${p.id % 2 === 0 ? currentTheme.primary : '#ffffff'}`,
              }}
              animate={{
                opacity: [0.1, p.opacity, 0.1],
                scale: [0.8, 1.25, 0.8],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* 7. Subtle Vignette Edge Frame */}
      <div
        className={`absolute inset-0 ${
          isDark
            ? 'bg-gradient-to-t from-[#04050a]/80 via-transparent to-transparent'
            : 'bg-gradient-to-t from-slate-200/40 via-transparent to-transparent'
        }`}
      />
    </div>
  );
};
