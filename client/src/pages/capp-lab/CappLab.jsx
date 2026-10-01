import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Cpu,
  GitFork,
  Clock,
  TrendingUp,
  FlaskConical,
  Terminal,
  Zap,
} from 'lucide-react';
import { OverviewTab } from '../../components/capp-lab/OverviewTab';
import { MultiCoreMonitorTab } from '../../components/capp-lab/MultiCoreMonitorTab';
import { PipelineTab } from '../../components/capp-lab/PipelineTab';
import { ExecutionTimelineTab } from '../../components/capp-lab/ExecutionTimelineTab';
import { AmdahlsLawTab } from '../../components/capp-lab/AmdahlsLawTab';

export const CappLab = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sharedLatestRun, setSharedLatestRun] = useState(null);

  const tabs = [
    {
      id: 'overview',
      label: 'OVERVIEW',
      code: '01',
      icon: Layers,
      description: 'CAPP Concepts & Architecture Mapping',
    },
    {
      id: 'multi-core',
      label: 'MULTI-CORE MONITOR',
      code: '02',
      icon: Cpu,
      description: 'Live Hardware & Worker Pool Telemetry',
    },
    {
      id: 'pipeline',
      label: 'PIPELINE',
      code: '03',
      icon: GitFork,
      description: '5-Stage Fork-Join Concurrency',
    },
    {
      id: 'timeline',
      label: 'EXECUTION TIMELINE',
      code: '04',
      icon: Clock,
      description: 'Gantt Chart & Overhead Breakdown',
    },
    {
      id: 'amdahl',
      label: "AMDAHL'S LAW",
      code: '05',
      icon: TrendingUp,
      description: 'Theoretical vs Measured Speedup',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 font-mono">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-400 tracking-widest uppercase mb-1">
            <FlaskConical className="w-4 h-4 text-purple-400" />
            <span>ACADEMIC COMPUTE // ARCHITECTURE & PARALLEL PROCESSING LAB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide uppercase">
            CAPP Lab: Architectural Laboratory
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl font-sans">
            Interactive deep-dive into how Digital EPS implements core Computer Architecture
            and Parallel Processing principles: multi-core worker thread pools, domain decomposition,
            pipeline concurrency, Gantt barrier synchronization, and Amdahl's Law scaling.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded bg-purple-950/40 border border-purple-500/30 text-purple-300">
          <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>PARALLEL WORKER POOL ONLINE</span>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 relative ${
                isActive
                  ? 'bg-purple-950/60 border border-purple-500/80 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                  : 'bg-slate-900/50 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`text-[10px] ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                [{tab.code}]
              </span>
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>

              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {activeTab === 'overview' && (
            <OverviewTab onNavigateTab={(targetTab) => setActiveTab(targetTab)} />
          )}

          {activeTab === 'multi-core' && (
            <MultiCoreMonitorTab
              onRunFinished={(run) => {
                setSharedLatestRun(run);
              }}
            />
          )}

          {activeTab === 'pipeline' && (
            <PipelineTab externalRun={sharedLatestRun} />
          )}

          {activeTab === 'timeline' && (
            <ExecutionTimelineTab />
          )}

          {activeTab === 'amdahl' && (
            <AmdahlsLawTab />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
