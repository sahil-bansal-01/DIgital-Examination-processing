import React from 'react';

export const CappCircuitLogo = ({ 
  size = 280, 
  className = '', 
  glow = true,
  animate = true,
  showLabel = false 
}) => {
  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          {/* Intense Neon Cyan Glow */}
          <filter id="cappCyanGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur1" />
            <feGaussianBlur stdDeviation="14" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Electric Purple Glow */}
          <filter id="cappPurpleGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur1" />
            <feGaussianBlur stdDeviation="12" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Core Center Laser Glow */}
          <filter id="cappCoreBright" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradients */}
          <linearGradient id="cappCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F2FF" />
            <stop offset="100%" stopColor="#00A3FF" />
          </linearGradient>

          <linearGradient id="cappPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#7E22CE" />
          </linearGradient>

          <linearGradient id="cappCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#08101E" />
            <stop offset="50%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#060A14" />
          </linearGradient>

          <linearGradient id="cappChipDieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F2FF" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#0077B6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#023E8A" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        <style>{`
          @keyframes cappPulse {
            0%, 100% { opacity: 0.85; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.02); filter: drop-shadow(0 0 16px rgba(0, 242, 255, 0.9)); }
          }
          @keyframes cappDash {
            to { stroke-dashoffset: -40; }
          }
          @keyframes cappDashRev {
            to { stroke-dashoffset: 40; }
          }
          @keyframes cappLightTravel {
            0% { stroke-dashoffset: 80; opacity: 0.4; }
            50% { opacity: 1; }
            100% { stroke-dashoffset: 0; opacity: 0.4; }
          }
          .capp-core-pulse {
            transform-origin: 250px 250px;
            animation: ${animate ? 'cappPulse 3s ease-in-out infinite' : 'none'};
          }
          .capp-circuit-pulse-cyan {
            stroke-dasharray: 8 6;
            animation: ${animate ? 'cappDash 2.5s linear infinite' : 'none'};
          }
          .capp-circuit-pulse-purple {
            stroke-dasharray: 6 5;
            animation: ${animate ? 'cappDashRev 3.5s linear infinite' : 'none'};
          }
          .capp-travel-pulse {
            stroke-dasharray: 20 60;
            animation: ${animate ? 'cappLightTravel 2s linear infinite' : 'none'};
          }
        `}</style>

        {/* Ambient Halo Behind Logo */}
        {glow && (
          <g opacity="0.35">
            <circle cx="250" cy="250" r="160" fill="radial-gradient(circle, #00F2FF 0%, #A855F7 50%, transparent 75%)" opacity="0.3" filter="blur(20px)" />
          </g>
        )}

        {/* 1. OUTERMOST HEXAGONAL / ANGLED CHASSIS (Purple & Cyan stepped borders) */}
        {/* Layer 1: Outer Hexagon Border */}
        <polygon
          points="250,45 425,146 425,354 250,455 75,354 75,146"
          stroke="#00F2FF"
          strokeWidth="1.5"
          strokeOpacity="0.4"
          fill="none"
        />

        {/* Outer Corner Accents */}
        <path d="M240,40 L250,34 L260,40" stroke="#00F2FF" strokeWidth="2.5" fill="none" filter="url(#cappCyanGlow)" />
        <path d="M240,460 L250,466 L260,460" stroke="#00F2FF" strokeWidth="2.5" fill="none" filter="url(#cappCyanGlow)" />
        <path d="M68,142 L62,146 L68,150" stroke="#00F2FF" strokeWidth="2.5" fill="none" filter="url(#cappCyanGlow)" />
        <path d="M432,142 L438,146 L432,150" stroke="#00F2FF" strokeWidth="2.5" fill="none" filter="url(#cappCyanGlow)" />

        {/* Layer 2: Main Stepped Hexagon Frame (Cyan & Purple dual tone) */}
        <polygon
          points="250,68 405,158 405,342 250,432 95,342 95,158"
          stroke="url(#cappCyanGrad)"
          strokeWidth="2.5"
          fill="#060A12"
          fillOpacity="0.65"
          filter={glow ? 'url(#cappCyanGlow)' : undefined}
        />

        {/* Layer 3: Inner Purple Octagonal Shield */}
        <polygon
          points="250,92 380,168 380,332 250,408 120,332 120,168"
          stroke="url(#cappPurpleGrad)"
          strokeWidth="2"
          strokeOpacity="0.85"
          fill="none"
          filter={glow ? 'url(#cappPurpleGlow)' : undefined}
          className="capp-circuit-pulse-purple"
        />

        {/* Layer 4: Stepped Inner Geometric Contour */}
        <polygon
          points="250,115 355,176 355,324 250,385 145,324 145,176"
          stroke="#00F2FF"
          strokeWidth="1"
          strokeOpacity="0.5"
          fill="none"
          strokeDasharray="4 4"
        />

        {/* 2. INTRICATE CIRCUIT PATHWAYS (CYAN & PURPLE) */}
        {/* Top Branch Traces */}
        <g strokeWidth="2" fill="none">
          {/* Top Center-Right Trace */}
          <path d="M250,185 L250,135 L285,100 L285,75" stroke="#00F2FF" filter="url(#cappCyanGlow)" />
          <circle cx="285" cy="75" r="3.5" fill="#00F2FF" filter="url(#cappCyanGlow)" />
          
          {/* Top Center-Left Trace */}
          <path d="M250,185 L250,135 L215,100 L215,75" stroke="#C084FC" filter="url(#cappPurpleGlow)" />
          <circle cx="215" cy="75" r="3.5" fill="#C084FC" filter="url(#cappPurpleGlow)" />

          {/* Top-Right Angled Trace 1 */}
          <path d="M265,185 L265,145 L320,115 L350,115" stroke="#00F2FF" filter="url(#cappCyanGlow)" />
          <circle cx="350" cy="115" r="3" fill="#00F2FF" />

          {/* Top-Right Angled Trace 2 (Purple) */}
          <path d="M280,185 L280,160 L345,135 L375,135" stroke="#A855F7" filter="url(#cappPurpleGlow)" />
          <circle cx="375" cy="135" r="3" fill="#A855F7" />

          {/* Top-Left Angled Trace 1 */}
          <path d="M235,185 L235,145 L180,115 L150,115" stroke="#00F2FF" filter="url(#cappCyanGlow)" />
          <circle cx="150" cy="115" r="3" fill="#00F2FF" />

          {/* Top-Left Angled Trace 2 (Purple) */}
          <path d="M220,185 L220,160 L155,135 L125,135" stroke="#A855F7" filter="url(#cappPurpleGlow)" />
          <circle cx="125" cy="135" r="3" fill="#A855F7" />
        </g>

        {/* Bottom Branch Traces */}
        <g strokeWidth="2" fill="none">
          {/* Bottom Center-Right Trace */}
          <path d="M250,315 L250,365 L285,400 L285,425" stroke="#C084FC" filter="url(#cappPurpleGlow)" />
          <circle cx="285" cy="425" r="3.5" fill="#C084FC" filter="url(#cappPurpleGlow)" />

          {/* Bottom Center-Left Trace */}
          <path d="M250,315 L250,365 L215,400 L215,425" stroke="#00F2FF" filter="url(#cappCyanGlow)" />
          <circle cx="215" cy="425" r="3.5" fill="#00F2FF" filter="url(#cappCyanGlow)" />

          {/* Bottom-Right Angled Trace 1 */}
          <path d="M265,315 L265,355 L320,385 L350,385" stroke="#00F2FF" filter="url(#cappCyanGlow)" />
          <circle cx="350" cy="385" r="3" fill="#00F2FF" />

          {/* Bottom-Right Angled Trace 2 (Purple) */}
          <path d="M280,315 L280,340 L345,365 L375,365" stroke="#A855F7" filter="url(#cappPurpleGlow)" />
          <circle cx="375" cy="365" r="3" fill="#A855F7" />

          {/* Bottom-Left Angled Trace 1 */}
          <path d="M235,315 L235,355 L180,385 L150,385" stroke="#00F2FF" filter="url(#cappCyanGlow)" />
          <circle cx="150" cy="385" r="3" fill="#00F2FF" />

          {/* Bottom-Left Angled Trace 2 (Purple) */}
          <path d="M220,315 L220,340 L155,365 L125,365" stroke="#A855F7" filter="url(#cappPurpleGlow)" />
          <circle cx="125" cy="365" r="3" fill="#A855F7" />
        </g>

        {/* Horizontal Left & Right Busses (Connecting outward) */}
        <g strokeWidth="2.5" fill="none">
          {/* Right Horizontal High-Speed Bus 1 */}
          <path d="M315,225 L345,225 L365,210 L415,210" stroke="#00F2FF" filter="url(#cappCyanGlow)" />
          <circle cx="415" cy="210" r="3.5" fill="#00F2FF" filter="url(#cappCyanGlow)" />

          {/* Right Horizontal High-Speed Bus 2 (Middle) */}
          <path d="M315,250 L375,250 L425,250" stroke="#00F2FF" strokeWidth="3" filter="url(#cappCyanGlow)" />
          <circle cx="425" cy="250" r="4" fill="#00F2FF" filter="url(#cappCyanGlow)" />

          {/* Right Horizontal High-Speed Bus 3 */}
          <path d="M315,275 L345,275 L365,290 L415,290" stroke="#C084FC" filter="url(#cappPurpleGlow)" />
          <circle cx="415" cy="290" r="3.5" fill="#C084FC" filter="url(#cappPurpleGlow)" />

          {/* Left Horizontal High-Speed Bus 1 */}
          <path d="M185,225 L155,225 L135,210 L85,210" stroke="#00F2FF" filter="url(#cappCyanGlow)" />
          <circle cx="85" cy="210" r="3.5" fill="#00F2FF" filter="url(#cappCyanGlow)" />

          {/* Left Horizontal High-Speed Bus 2 (Middle) */}
          <path d="M185,250 L125,250 L75,250" stroke="#00F2FF" strokeWidth="3" filter="url(#cappCyanGlow)" />
          <circle cx="75" cy="250" r="4" fill="#00F2FF" filter="url(#cappCyanGlow)" />

          {/* Left Horizontal High-Speed Bus 3 */}
          <path d="M185,275 L155,275 L135,290 L85,290" stroke="#C084FC" filter="url(#cappPurpleGlow)" />
          <circle cx="85" cy="290" r="3.5" fill="#C084FC" filter="url(#cappPurpleGlow)" />
        </g>

        {/* 3. CHIP SOCKET & PINS */}
        {/* Outer Socket Frame */}
        <rect
          x="180"
          y="180"
          width="140"
          height="140"
          rx="12"
          fill="url(#cappCoreGrad)"
          stroke="#00F2FF"
          strokeWidth="2.5"
          filter="url(#cappCyanGlow)"
        />

        {/* Chip Pin Contacts (Top, Bottom, Left, Right) */}
        {/* Top Pins */}
        {[198, 211, 224, 237, 250, 263, 276, 289, 302].map((x, i) => (
          <line
            key={`pin-t-${i}`}
            x1={x}
            y1="180"
            x2={x}
            y2="170"
            stroke={i % 2 === 0 ? '#00F2FF' : '#C084FC'}
            strokeWidth="2"
          />
        ))}

        {/* Bottom Pins */}
        {[198, 211, 224, 237, 250, 263, 276, 289, 302].map((x, i) => (
          <line
            key={`pin-b-${i}`}
            x1={x}
            y1="320"
            x2={x}
            y2="330"
            stroke={i % 2 === 0 ? '#00F2FF' : '#C084FC'}
            strokeWidth="2"
          />
        ))}

        {/* Left Pins */}
        {[198, 211, 224, 237, 250, 263, 276, 289, 302].map((y, i) => (
          <line
            key={`pin-l-${i}`}
            x1="180"
            y1={y}
            x2="170"
            y2={y}
            stroke={i % 2 === 0 ? '#00F2FF' : '#C084FC'}
            strokeWidth="2"
          />
        ))}

        {/* Right Pins */}
        {[198, 211, 224, 237, 250, 263, 276, 289, 302].map((y, i) => (
          <line
            key={`pin-r-${i}`}
            x1="320"
            y1={y}
            x2="330"
            y2={y}
            stroke={i % 2 === 0 ? '#00F2FF' : '#C084FC'}
            strokeWidth="2"
          />
        ))}

        {/* 4. SILICON PROCESSOR DIE (CENTER) */}
        <g className="capp-core-pulse">
          {/* Silicon Substrate Die */}
          <rect
            x="202"
            y="202"
            width="96"
            height="96"
            rx="8"
            fill="url(#cappChipDieGrad)"
            stroke="#00F2FF"
            strokeWidth="2"
          />

          {/* Micro-Die Internal Ring */}
          <rect
            x="216"
            y="216"
            width="68"
            height="68"
            rx="6"
            fill="#050B14"
            stroke="#00F2FF"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />

          {/* Inner Glowing Computation Core */}
          <rect
            x="230"
            y="230"
            width="40"
            height="40"
            rx="4"
            fill="#00F2FF"
            filter="url(#cappCoreBright)"
          />

          {/* Center Micro Core Window */}
          <rect
            x="238"
            y="238"
            width="24"
            height="24"
            rx="2"
            fill="#E0FFFF"
            opacity="0.9"
          />

          {/* Subtle Silicon Etchings */}
          <path
            d="M216,234 L230,234 M216,266 L230,266 M270,234 L284,234 M270,266 L284,266 M234,216 L234,230 M266,216 L266,230 M234,270 L234,284 M266,270 L266,284"
            stroke="#00F2FF"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />
        </g>

        {/* Traveling Light Energy Pulses */}
        {animate && (
          <g>
            <path
              d="M75,250 L185,250 M315,250 L425,250"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              fill="none"
              className="capp-travel-pulse"
              filter="url(#cappCyanGlow)"
            />
            <path
              d="M250,75 L250,185 M250,315 L250,425"
              stroke="#E9D5FF"
              strokeWidth="2"
              fill="none"
              className="capp-travel-pulse"
              filter="url(#cappPurpleGlow)"
            />
          </g>
        )}
      </svg>

      {/* Optional Wordmark for Preloader or Hero */}
      {showLabel && (
        <div className="mt-4 text-center font-mono">
          <div className="text-2xl font-black tracking-widest text-white uppercase">
            CAPP <span className="text-[#00F2FF] text-glow-cyan">ENGINE</span>
          </div>
          <div className="text-[10px] tracking-[0.25em] text-[#00F2FF]/80 uppercase mt-1">
            // HIGH PERFORMANCE PARALLEL COMPUTATION
          </div>
          <div className="text-[9px] tracking-[0.2em] text-slate-400 uppercase">
            AUTOMATED EVALUATION SYSTEM
          </div>
        </div>
      )}
    </div>
  );
};
