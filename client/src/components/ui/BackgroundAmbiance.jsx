import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export const BackgroundAmbiance = () => {
  // Generate lightweight deterministic background particle coordinates
  const particles = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      left: `${(i * 17) % 96 + 2}%`,
      top: `${(i * 23) % 94 + 3}%`,
      size: (i % 3) + 1.5,
      delay: (i % 5) * 0.7,
      duration: 3 + (i % 4) * 1.5,
      opacity: 0.15 + (i % 4) * 0.12,
      isCyan: i % 3 === 0,
      isPurple: i % 3 === 1,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      {/* 1. Base Deep Space Void Black */}
      <div className="absolute inset-0 bg-[#030508]" />

      {/* 2. Cyber Mesh & Animated Radial Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 20%, rgba(0, 242, 254, 0.08) 0%, transparent 60%),
            radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 50%),
            linear-gradient(to right, rgba(0, 242, 254, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 242, 254, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 100% 100%, 40px 40px, 40px 40px',
        }}
      />

      {/* 3. Concentric Targeting Rings (Sci-Fi Radar Center) */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full pointer-events-none opacity-20 border border-cyan-500/10"
        style={{
          maskImage: 'radial-gradient(circle, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 75%)',
        }}
      >
        <div className="absolute inset-24 rounded-full border border-cyan-500/10 border-dashed animate-radar" style={{ animationDuration: '30s' }} />
        <div className="absolute inset-48 rounded-full border border-purple-500/10" />
        <div className="absolute inset-72 rounded-full border border-cyan-500/15" />
      </div>

      {/* 4. Ambient Atmospheric Glow Orbs (Electric Purple & Neon Cyan) */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -25, 20, 0],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-20 left-1/4 w-[600px] h-[350px] rounded-full blur-[140px] pointer-events-none opacity-25"
        style={{
          background: 'radial-gradient(circle, #00F2FE 0%, #0088FF 40%, transparent 75%)',
        }}
      />

      <motion.div
        animate={{
          x: [0, -30, 25, 0],
          y: [0, 30, -20, 0],
          scale: [1, 0.94, 1.06, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 -right-24 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, #8B5CF6 0%, #6366F1 45%, transparent 75%)',
        }}
      />

      {/* 5. Subtle Twinkling Quantum Node Particles */}
      <div className="absolute inset-0">
        {particles.map((p) => {
          const color = p.isCyan ? '#00F2FE' : p.isPurple ? '#8B5CF6' : '#10B981';
          return (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                backgroundColor: color,
                boxShadow: `0 0 ${p.size * 3}px ${color}`,
              }}
              animate={{
                opacity: [0.08, p.opacity, 0.08],
                scale: [0.8, 1.3, 0.8],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut',
              }}
            />
          );
        })}
      </div>

      {/* 6. Precision HUD Corner Decals */}
      <div className="absolute top-4 left-4 text-[9px] font-mono text-cyan-500/20 tracking-widest hidden md:block">
        SYS.GRID // 44.02-A // EPS-CORE
      </div>
      <div className="absolute bottom-4 right-4 text-[9px] font-mono text-cyan-500/20 tracking-widest hidden md:block">
        PARALLEL_CORE // LATENCY: 0.2MS
      </div>
    </div>
  );
};
