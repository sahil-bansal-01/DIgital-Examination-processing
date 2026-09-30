import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  FileSpreadsheet,
  UploadCloud,
  Cpu,
  Calculator,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  GitFork,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { isReducedMotion } from '../../animations/variants';

export const STEPS_DATA = [
  {
    id: 1,
    stepNum: '01',
    title: 'Exam Data Collected',
    badge: 'Stage 1 • Ingestion',
    shortDesc: 'University syllabus schemes, course credits, student cohorts, and exam metadata are structured and synchronized into the system registry.',
    details: [
      'Multi-department course code resolution',
      'Configurable internal/external weightage matrices',
      'Automated candidate roster synchronization',
    ],
    icon: FileSpreadsheet,
    color: '#8B5CF6',
  },
  {
    id: 2,
    stepNum: '02',
    title: 'Digital Input',
    badge: 'Stage 2 • Secure Entry',
    shortDesc: 'Course evaluators and faculty enter marks through authenticated portals with instantaneous schema validation, absent checks, and bulk CSV parsing.',
    details: [
      'Role-based evaluated marksheets authorization',
      'Client-side & server-side zero-leak validation',
      'Immediate anomaly detection for absent/malpractice flags',
    ],
    icon: UploadCloud,
    color: '#A855F7',
  },
  {
    id: 3,
    stepNum: '03',
    title: 'Processing and Validation',
    badge: 'Stage 3 • CAPP Parallel Core',
    shortDesc: 'High-throughput Node.js worker_threads pool executes chunk-level parallel grading, statistical normalization, and concurrency benchmarking.',
    details: [
      'Domain & batch decomposition across CPU cores',
      'Warm worker pool eliminating thread spawning lag',
      'Amdahl’s law metrics tracking speedup & efficiency',
    ],
    icon: Cpu,
    color: '#C084FC',
  },
  {
    id: 4,
    stepNum: '04',
    title: 'Result Preparation',
    badge: 'Stage 4 • Aggregation',
    shortDesc: 'Relative grade cutoffs, semester SGPA, cumulative CGPA, and backlogs are computed with tamper-evident cryptographic hash audit trails.',
    details: [
      'Dynamic 10-point UGC grade-scale mapping',
      'Automated fail/re-appear status calculation',
      'Immutable SHA-256 audit log generation',
    ],
    icon: Calculator,
    color: '#D946EF',
  },
  {
    id: 5,
    stepNum: '05',
    title: 'Final Report Generated',
    badge: 'Stage 5 • Dissemination',
    shortDesc: 'Official university marks-sheets and PDF grade transcripts are published to student dashboards and exam cell archival storage.',
    details: [
      'Instant student self-service results lookup',
      'Print-ready official PDF grade cards with QR verification',
      'Re-evaluation tracking and grade revision workflows',
    ],
    icon: Award,
    color: '#EC4899',
  },
];

export const ScrollSteps = ({ className = '', title, subtitle }) => {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef(null);
  const stepRefs = useRef([]);

  // Framer motion scroll tracking for progress line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 30,
    restDelta: 0.001,
  });

  // Determine active step based on element closest to viewport center
  useEffect(() => {
    const handleScroll = () => {
      if (!stepRefs.current.length) return;
      const viewportCenter = window.innerHeight * 0.45;
      let minDistance = Infinity;
      let closestIndex = 0;

      stepRefs.current.forEach((el, index) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distance = Math.abs(elementCenter - viewportCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      setActiveStep(closestIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const reducedMotion = isReducedMotion();

  return (
    <div ref={containerRef} className={`w-full py-12 relative ${className}`}>
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 dark:text-purple-300 light:text-purple-700 text-xs font-mono font-semibold mb-4 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>PARALLEL PIPELINE ARCHITECTURE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white light:text-slate-900">
          {title || (
            <>
              How <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400">CAPP Engine</span> Works
            </>
          )}
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 light:text-slate-600 leading-relaxed">
          {subtitle || 'An end-to-end examination governance pipeline engineered with high-concurrency Node.js worker pools and multi-threaded throughput.'}
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative">
        {/* LEFT COLUMN: Sticky Interactive Visual Illustration */}
        <div className="lg:col-span-6 lg:sticky lg:top-28 z-20">
          <div className="p-6 sm:p-8 rounded-3xl obsidian-card border border-purple-500/25 dark:border-purple-500/25 light:border-purple-300 light:bg-white/90 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
            {/* Ambient Background Aura behind sticky visual */}
            <div
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-[100px] pointer-events-none opacity-40 transition-colors duration-500"
              style={{ backgroundColor: STEPS_DATA[activeStep]?.color || '#8B5CF6' }}
            />

            {/* Visual Header */}
            <div className="flex items-center justify-between border-b border-white/10 dark:border-white/10 light:border-slate-200 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full animate-ping"
                  style={{ backgroundColor: STEPS_DATA[activeStep]?.color }}
                />
                <span className="text-xs font-mono font-bold tracking-wider text-purple-400 uppercase">
                  {STEPS_DATA[activeStep]?.badge}
                </span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                Step {activeStep + 1} of 5
              </span>
            </div>

            {/* Dynamic Step Illustration Display */}
            <div className="min-h-[290px] flex flex-col justify-center items-center py-4 relative">
              {/* STEP 1: Exam Data Collected */}
              {activeStep === 0 && (
                <motion.div
                  key="step-visual-0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-full flex flex-col items-center gap-4 text-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <FileSpreadsheet className="w-10 h-10 text-purple-300" />
                  </div>
                  <div className="w-full max-w-sm space-y-2 font-mono text-xs">
                    <div className="p-2.5 rounded-xl bg-black/40 dark:bg-black/40 light:bg-slate-100 border border-white/10 dark:border-white/10 light:border-slate-200 flex justify-between items-center text-slate-300 dark:text-slate-300 light:text-slate-700">
                      <span>Curriculum Scheme Registry</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 dark:bg-black/40 light:bg-slate-100 border border-white/10 dark:border-white/10 light:border-slate-200 flex justify-between items-center text-slate-300 dark:text-slate-300 light:text-slate-700">
                      <span>Candidate Cohorts (100k+ Records)</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Digital Input */}
              {activeStep === 1 && (
                <motion.div
                  key="step-visual-1"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-full flex flex-col items-center gap-4 text-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
                    <UploadCloud className="w-10 h-10 text-fuchsia-300" />
                  </div>
                  <div className="w-full max-w-sm grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-black/40 dark:bg-black/40 light:bg-slate-100 border border-white/10 dark:border-white/10 light:border-slate-200 text-left">
                      <p className="text-[10px] text-slate-400 uppercase">Input Sanitization</p>
                      <p className="text-emerald-400 font-bold mt-1">100% Validated</p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 dark:bg-black/40 light:bg-slate-100 border border-white/10 dark:border-white/10 light:border-slate-200 text-left">
                      <p className="text-[10px] text-slate-400 uppercase">CSV Ingestion</p>
                      <p className="text-purple-400 font-bold mt-1">Automated Audit</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Processing and Validation (PARALLEL LANES ANIMATION!) */}
              {activeStep === 2 && (
                <motion.div
                  key="step-visual-2"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-full flex flex-col items-center gap-4"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="w-6 h-6 text-purple-400 animate-spin" />
                    <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
                      Parallel Thread Pool Dispatcher
                    </span>
                  </div>

                  {/* Task Split -> Parallel Lanes -> Merge Animation */}
                  <div className="w-full max-w-md p-3.5 rounded-2xl bg-black/50 dark:bg-black/50 light:bg-slate-100 border border-purple-500/30 space-y-2">
                    {/* Master Task Queue Ingestion */}
                    <div className="text-center text-[10px] font-mono text-purple-300 pb-1 border-b border-white/10 dark:border-white/10 light:border-slate-300 flex items-center justify-center gap-1.5">
                      <GitFork className="w-3.5 h-3.5 rotate-180 text-purple-400" />
                      <span>Dataset Split into 4 Worker Chunks</span>
                    </div>

                    {/* 4 Parallel Worker Lanes */}
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {[0, 1, 2, 3].map((workerId) => (
                        <motion.div
                          key={workerId}
                          animate={
                            reducedMotion
                              ? {}
                              : {
                                  borderColor: ['rgba(168,85,247,0.3)', 'rgba(192,132,252,0.9)', 'rgba(168,85,247,0.3)'],
                                  boxShadow: [
                                    '0 0 5px rgba(168,85,247,0.2)',
                                    '0 0 15px rgba(168,85,247,0.6)',
                                    '0 0 5px rgba(168,85,247,0.2)',
                                  ],
                                }
                          }
                          transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            delay: workerId * 0.25,
                            ease: 'easeInOut',
                          }}
                          className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 flex flex-col items-center gap-1 text-center"
                        >
                          <span className="text-[9px] font-mono text-purple-300 font-bold">
                            T-{workerId + 1}
                          </span>
                          <div className="w-full h-1 bg-purple-900 rounded-full overflow-hidden">
                            <motion.div
                              animate={{ x: ['-100%', '100%'] }}
                              transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: workerId * 0.2,
                                ease: 'linear',
                              }}
                              className="w-1/2 h-full bg-gradient-to-r from-transparent via-purple-300 to-transparent"
                            />
                          </div>
                          <span className="text-[8px] font-mono text-emerald-400">ACTIVE</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Convergence / Merge Bar */}
                    <div className="text-center text-[10px] font-mono text-emerald-400 pt-1.5 border-t border-white/10 dark:border-white/10 light:border-slate-300 flex items-center justify-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Workers Aggregated • 1.6x Speedup</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Result Preparation */}
              {activeStep === 3 && (
                <motion.div
                  key="step-visual-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-full flex flex-col items-center gap-4 text-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Calculator className="w-10 h-10 text-indigo-300" />
                  </div>
                  <div className="w-full max-w-sm space-y-2 text-xs font-mono">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-black/40 dark:bg-black/40 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700">
                      <span>SGPA / CGPA Normalization</span>
                      <span className="text-purple-400 font-bold">10.0 Scale</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-black/40 dark:bg-black/40 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700">
                      <span>SHA-256 Audit Seal</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: Final Report Generated */}
              {activeStep === 4 && (
                <motion.div
                  key="step-visual-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="w-full flex flex-col items-center gap-4 text-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center shadow-lg shadow-pink-500/20">
                    <Award className="w-10 h-10 text-pink-300" />
                  </div>
                  <div className="w-full max-w-sm p-3 rounded-xl bg-black/40 dark:bg-black/40 light:bg-slate-100 border border-white/10 dark:border-white/10 light:border-slate-200 text-left font-mono text-xs space-y-1">
                    <p className="text-white dark:text-white light:text-slate-900 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                      Official University Grade Cards Ready
                    </p>
                    <p className="text-slate-400 text-[11px]">Instant Student Verification & PDF Export</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Step Description in Sticky Card */}
            <div className="mt-4 pt-4 border-t border-white/10 dark:border-white/10 light:border-slate-200">
              <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900">
                {STEPS_DATA[activeStep]?.title}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1 leading-relaxed">
                {STEPS_DATA[activeStep]?.shortDesc}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Scroll-Triggered Revealing Step Cards with Glowing Active State */}
        <div className="lg:col-span-6 relative pl-6 sm:pl-10 space-y-12">
          {/* Vertical Progress Connector Line */}
          <div className="absolute top-8 bottom-8 left-2 sm:left-4 w-1 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              style={{ scaleY: smoothProgress }}
              className="w-full h-full origin-top bg-gradient-to-b from-purple-500 via-fuchsia-500 to-pink-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]"
            />
          </div>

          {/* Cards List */}
          {STEPS_DATA.map((step, idx) => {
            const isActive = idx === activeStep;
            const IconComponent = step.icon;

            return (
              <div
                key={step.id}
                ref={(el) => (stepRefs.current[idx] = el)}
                className="relative scroll-mt-36"
              >
                {/* Node Milestone Indicator on the vertical line */}
                <div
                  className={`absolute -left-6 sm:-left-10 top-6 -translate-x-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${
                    idx <= activeStep
                      ? 'border-purple-400 bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.8)] scale-110'
                      : 'border-slate-700 bg-slate-900 text-slate-500 dark:bg-slate-900 light:bg-white light:border-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                </div>

                {/* Step Card with Active Glowing Border and Scale */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.03 : 0.97,
                    opacity: isActive ? 1 : 0.48,
                    filter: isActive ? 'blur(0px)' : 'blur(0.2px)',
                  }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className={`p-6 sm:p-7 rounded-3xl transition-all duration-300 ${
                    isActive
                      ? 'obsidian-card border-2 border-purple-500/80 shadow-[0_0_35px_rgba(168,85,247,0.4)] dark:border-purple-500/80 light:border-purple-600 light:bg-white light:shadow-xl'
                      : 'obsidian-card border border-white/5 dark:border-white/5 light:border-slate-200 light:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-md'
                            : 'bg-white/5 text-slate-400 border border-white/5'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block">
                          {step.badge}
                        </span>
                        <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white light:text-slate-900">
                          {step.title}
                        </h4>
                      </div>
                    </div>

                    <span
                      className={`text-xl sm:text-2xl font-black font-mono tracking-tighter ${
                        isActive ? 'text-purple-400' : 'text-slate-600'
                      }`}
                    >
                      {step.stepNum}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 light:text-slate-600 leading-relaxed mb-4">
                    {step.shortDesc}
                  </p>

                  {/* Bullet points */}
                  <div className="space-y-1.5 pt-2 border-t border-white/10 dark:border-white/10 light:border-slate-200">
                    {step.details.map((point, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
                        <ArrowRight
                          className={`w-3 h-3 shrink-0 ${
                            isActive ? 'text-purple-400' : 'text-slate-600'
                          }`}
                        />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
