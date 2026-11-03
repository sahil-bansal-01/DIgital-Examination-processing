import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitCommit,
  CheckCircle2,
  Cpu,
  Calculator,
  Award,
  Play,
  RotateCcw,
  FastForward,
  Clock,
  Zap,
  ArrowRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';

const STAGES = [
  {
    id: 'submit',
    stepNumber: '01',
    name: 'Submit',
    description: 'Candidate answer scripts ingested via shared bus',
    icon: GitCommit,
    color: '#00F2FE',
    glow: 'rgba(0, 242, 254, 0.25)',
    hardwareUnit: 'Bus Master Receiver / Input FIFO',
    typicalLatency: '0.85 ms',
  },
  {
    id: 'validate',
    stepNumber: '02',
    name: 'Validate',
    description: 'Roll number, attendance & answer sheet CRC checks',
    icon: ShieldCheck,
    color: '#38BDF8',
    glow: 'rgba(56, 189, 248, 0.25)',
    hardwareUnit: 'Instruction Decode & Sanity ALU',
    typicalLatency: '1.12 ms',
  },
  {
    id: 'evaluate',
    stepNumber: '03',
    name: 'Evaluate',
    description: 'Marks scored, grading boundaries & grace criteria',
    icon: Cpu,
    color: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.25)',
    hardwareUnit: 'SIMD Floating-Point Vector Units',
    typicalLatency: '2.45 ms',
  },
  {
    id: 'total_marks',
    stepNumber: '04',
    name: 'Total Marks',
    description: 'Credit-weighted summation, SGPA & backlog check',
    icon: Calculator,
    color: '#EC4899',
    glow: 'rgba(236, 72, 153, 0.25)',
    hardwareUnit: 'Accumulator & Reduction Barrier',
    typicalLatency: '1.05 ms',
  },
  {
    id: 'result',
    stepNumber: '05',
    name: 'Result',
    description: 'Class rank compilation & transcript serialization',
    icon: Award,
    color: '#10B981',
    glow: 'rgba(16, 185, 129, 0.25)',
    hardwareUnit: 'Writeback Memory Interface',
    typicalLatency: '1.35 ms',
  },
];

export const PipelineDiagram = ({ pipelineData, isRunningDemo, onStepTrigger }) => {
  const [activeStageIndex, setActiveStageIndex] = useState(-1);
  const [isSimulatingSheet, setIsSimulatingSheet] = useState(false);
  const [simulatedSheetId, setSimulatedSheetId] = useState('SCRIPT-24CS001');
  const [completedSheetsCount, setCompletedSheetsCount] = useState(50);

  // When demo is running, cycle through stages automatically
  useEffect(() => {
    if (isRunningDemo) {
      let stage = 0;
      setActiveStageIndex(0);
      const interval = setInterval(() => {
        stage++;
        if (stage < STAGES.length) {
          setActiveStageIndex(stage);
        } else {
          setActiveStageIndex(STAGES.length - 1);
          clearInterval(interval);
        }
      }, 350);

      return () => clearInterval(interval);
    } else {
      setActiveStageIndex(-1);
    }
  }, [isRunningDemo]);

  // Handle single test sheet through pipeline
  const simulateSingleScript = () => {
    if (isSimulatingSheet) return;
    setIsSimulatingSheet(true);
    const newId = `SCRIPT-24CS${String(Math.floor(Math.random() * 80) + 1).padStart(3, '0')}`;
    setSimulatedSheetId(newId);

    let stage = 0;
    setActiveStageIndex(0);

    const stepInterval = setInterval(() => {
      stage++;
      if (stage < STAGES.length) {
        setActiveStageIndex(stage);
      } else {
        clearInterval(stepInterval);
        setActiveStageIndex(-1);
        setIsSimulatingSheet(false);
        setCompletedSheetsCount((prev) => prev + 1);
      }
    }, 450);
  };

  const currentStages = pipelineData?.stages || STAGES.map((s, idx) => ({
    stageNumber: idx + 1,
    id: s.id,
    name: s.name,
    description: s.description,
    recordsProcessed: 50,
    avgLatencyMs: parseFloat(s.typicalLatency),
    status: 'READY',
    hardwareUnit: s.hardwareUnit,
  }));

  const totalPipelineLatency = pipelineData?.totalLatencyMs || 6.82;
  const throughput = pipelineData?.throughputRecordsPerSec || 3200;

  return (
    <div className="hud-panel rounded-xl p-5 border border-cyan-500/20 bg-[#080C14]/90 backdrop-blur-xl relative overflow-hidden tech-corners">
      {/* Background Pipeline Bus Glow Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500" />
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-cyan-500/15">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-400 tracking-widest uppercase">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>5-STAGE SYNCHRONOUS INSTRUCTION & DATA PIPELINE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wide mt-0.5">
            Answer Sheet Processing Pipeline
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulation status pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
            <span className="text-slate-500">THROUGHPUT:</span>
            <span className="text-cyan-300 font-bold">{throughput.toLocaleString()} SCRIPT/S</span>
          </div>

          <button
            onClick={simulateSingleScript}
            disabled={isSimulatingSheet || isRunningDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 font-mono text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(0,242,254,0.15)]"
          >
            <Play className={`w-3.5 h-3.5 ${isSimulatingSheet ? 'animate-spin' : ''}`} />
            <span>{isSimulatingSheet ? 'DISPATCHING...' : 'STEP SCRIPT'}</span>
          </button>
        </div>
      </div>

      {/* Pipeline Active Sheet Indicator */}
      {isSimulatingSheet && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 px-3 py-1.5 rounded bg-purple-950/40 border border-purple-500/30 flex items-center justify-between font-mono text-xs text-purple-300"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>PIPELINE TOKEN IN FLIGHT:</span>
            <span className="text-white font-bold">{simulatedSheetId}</span>
          </div>
          <span className="text-cyan-400 font-semibold">STAGE: {STAGES[activeStageIndex]?.name || 'TRANSIT'}</span>
        </motion.div>
      )}

      {/* 5-Stage Interconnected Diagram */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = activeStageIndex === idx || isRunningDemo;
          const isPassed = activeStageIndex > idx;
          const backendStageData = currentStages.find((s) => s.id === stage.id);
          const latency = backendStageData?.avgLatencyMs || parseFloat(stage.typicalLatency);

          return (
            <div key={stage.id} className="relative group">
              {/* Pipeline Connector Arrow (between stages on desktop) */}
              {idx < STAGES.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none items-center justify-center text-slate-600">
                  <ArrowRight
                    className={`w-4 h-4 transition-colors ${
                      isActive || isPassed ? 'text-cyan-400 animate-pulse' : 'text-slate-700'
                    }`}
                  />
                </div>
              )}

              {/* Stage Card */}
              <div
                className={`h-full flex flex-col justify-between p-3.5 rounded-lg border transition-all duration-200 relative overflow-hidden ${
                  isActive
                    ? 'bg-slate-900/90 border-cyan-400 shadow-[0_0_20px_rgba(0,242,254,0.25)]'
                    : isPassed
                    ? 'bg-slate-900/60 border-emerald-500/40'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Active scan-line effect */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent pointer-events-none"
                    animate={{ y: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  />
                )}

                <div>
                  {/* Stage Top Bar */}
                  <div className="flex items-center justify-between font-mono text-[10px] mb-2">
                    <span
                      className="px-1.5 py-0.5 rounded font-bold"
                      style={{
                        backgroundColor: `${stage.color}15`,
                        color: stage.color,
                        border: `1px solid ${stage.color}40`,
                      }}
                    >
                      STAGE {stage.stepNumber}
                    </span>

                    <span
                      className={`text-[9px] uppercase tracking-wider font-semibold ${
                        isActive
                          ? 'text-cyan-400 animate-pulse'
                          : isPassed
                          ? 'text-emerald-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {isActive ? 'ACTIVE' : isPassed ? 'PASSED' : 'STAGED'}
                    </span>
                  </div>

                  {/* Stage Title & Icon */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="p-1.5 rounded-md"
                      style={{
                        backgroundColor: `${stage.color}20`,
                        border: `1px solid ${stage.color}50`,
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: stage.color }} />
                    </div>
                    <span className="font-bold text-sm text-white font-mono tracking-wide">
                      {stage.name}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-tight mb-3">
                    {stage.description}
                  </p>
                </div>

                {/* Stage Hardware Telemetry */}
                <div className="pt-2.5 border-t border-slate-800/80 font-mono text-[10px] space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="truncate">HW: {stage.hardwareUnit.split('/')[0]}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      LATENCY:
                    </span>
                    <span className="text-cyan-300 font-bold">{latency} ms</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Telemetry Footer */}
      <div className="mt-4 pt-3 border-t border-cyan-500/15 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>TOTAL LATENCY: <strong className="text-white">{totalPipelineLatency} ms</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>HAZARDS: <strong className="text-emerald-300">0 STALLS (FORWARDING ACTIVE)</strong></span>
          </div>
        </div>

        <div className="text-slate-500">
          COMPLETED INGESTIONS: <span className="text-cyan-400 font-bold">{completedSheetsCount} SCRIPTS</span>
        </div>
      </div>
    </div>
  );
};
