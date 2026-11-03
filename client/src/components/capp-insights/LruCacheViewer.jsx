// CAPP: Cache & Memory Hierarchy (Unit 5)
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Layers,
  Zap,
  TrendingUp,
  RotateCcw,
  Search,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  Key,
  Users,
  FileSpreadsheet,
  Clock,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';

export const LruCacheViewer = ({ cacheStats, cacheEntriesData, onRefresh }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesData, setEntriesData] = useState(cacheEntriesData || null);
  const [probingKey, setProbingKey] = useState(null);
  const [probeResult, setProbeResult] = useState(null);

  // Sync entries when prop changes
  useEffect(() => {
    if (cacheEntriesData) {
      setEntriesData(cacheEntriesData);
    }
  }, [cacheEntriesData]);

  // Fetch paginated entries when page or category changes
  const fetchEntries = async (page = 1, category = selectedCategory) => {
    try {
      const res = await api.get(`/capp-insights/cache/entries?page=${page}&limit=8&category=${category}`);
      if (res.success) {
        setEntriesData(res.data);
        setCurrentPage(page);
      }
    } catch {
      // safe catch
    }
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    fetchEntries(1, cat);
  };

  const handlePageChange = (newPage) => {
    fetchEntries(newPage, selectedCategory);
  };

  // Interactive Probe Key Test
  const handleProbeKey = async (key) => {
    try {
      setProbingKey(key);
      const res = await api.post('/capp-insights/cache/access', { key });
      if (res.success) {
        setProbeResult({
          key,
          isHit: res.data?.isHit,
          tier: res.data?.tier,
          latency: res.data?.latencyMs,
        });
        fetchEntries(currentPage, selectedCategory);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      setProbeResult({ key, isHit: false, tier: 'ERROR', latency: 0 });
    } finally {
      setTimeout(() => {
        setProbingKey(null);
        setTimeout(() => setProbeResult(null), 3500);
      }, 500);
    }
  };

  const stats = cacheStats || {
    capacity: 50,
    currentSize: 42,
    l2Size: 8,
    hits: 78,
    l1Hits: 64,
    l2Hits: 14,
    misses: 9,
    evictions: 4,
    totalLookups: 87,
    hitRatioPercent: 89.7,
    averageAccessTimeMs: 0.18,
  };

  const entries = entriesData?.entries || [];
  const pagination = entriesData?.pagination || { page: 1, limit: 8, totalEntries: 42, totalPages: 6 };
  const virtualMemory = entriesData?.virtualMemory || null;

  return (
    <div className="hud-panel rounded-xl p-5 border border-cyan-500/20 bg-[#080C14]/90 backdrop-blur-xl relative overflow-hidden tech-corners">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-cyan-500/15">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-400 tracking-widest uppercase">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>HIERARCHICAL LRU CACHE & VIRTUAL MEMORY FRAMES (UNIT 5)</span>
          </div>
          <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wide mt-0.5">
            Memory Locality & Cache Telemetry
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchEntries(1, selectedCategory);
              if (onRefresh) onRefresh();
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-cyan-500/40 transition"
            title="Refresh cache statistics"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* 4 Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {/* Card 1: Hit Ratio */}
        <div className="p-3.5 rounded-lg bg-slate-950/80 border border-cyan-500/30 font-mono relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
            <span>// CACHE HIT RATIO</span>
            <span className="text-cyan-400 font-bold">{stats.hitRatioPercent}%</span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight my-1">
            {stats.hitRatioPercent}%
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
              style={{ width: `${Math.min(100, stats.hitRatioPercent)}%` }}
            />
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold uppercase">
            [EXCELLENT LOCALITY OF REFERENCE]
          </span>
        </div>

        {/* Card 2: Hits vs Misses */}
        <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 font-mono">
          <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
            <span>// LOOKUP BREAKDOWN</span>
            <span className="text-slate-500">{stats.totalLookups} TOTAL</span>
          </div>
          <div className="flex items-baseline gap-2 text-2xl font-bold text-emerald-400 my-1">
            <span>{stats.hits}</span>
            <span className="text-xs text-slate-400 font-normal">HITS</span>
            <span className="text-slate-600 font-normal">/</span>
            <span className="text-sm text-rose-400">{stats.misses}</span>
            <span className="text-xs text-slate-400 font-normal">MISSES</span>
          </div>
          <div className="text-[10px] text-slate-400">
            L1: <strong className="text-cyan-300">{stats.l1Hits || 0}</strong> | L2:{' '}
            <strong className="text-purple-300">{stats.l2Hits || 0}</strong>
          </div>
        </div>

        {/* Card 3: Capacity & Evictions */}
        <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 font-mono">
          <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
            <span>// L1 CAPACITY / EVICTIONS</span>
            <span className="text-slate-500">MAX: {stats.capacity}</span>
          </div>
          <div className="text-2xl font-bold text-white my-1">
            {stats.currentSize} <span className="text-xs text-slate-400 font-normal">/ {stats.capacity}</span>
          </div>
          <div className="text-[10px] text-amber-400 font-semibold uppercase">
            {stats.evictions} LRU EVICTIONS TO L2 BUFFER
          </div>
        </div>

        {/* Card 4: Average Access Latency */}
        <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 font-mono">
          <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
            <span>// MEAN ACCESS LATENCY</span>
            <span className="text-cyan-400">HIERARCHY</span>
          </div>
          <div className="text-2xl font-bold text-cyan-300 my-1">
            {stats.averageAccessTimeMs} <span className="text-xs text-slate-400 font-normal">MS</span>
          </div>
          <div className="text-[10px] text-slate-400">
            L1 ~0.05ms | L2 ~0.45ms | DB ~12ms
          </div>
        </div>
      </div>

      {/* Interactive Probe Toast */}
      <AnimatePresence>
        {probeResult && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-4 px-3.5 py-2 rounded-lg font-mono text-xs flex items-center justify-between border ${
              probeResult.isHit
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>PROBED: <strong className="text-white">{probeResult.key}</strong></span>
              <span>- [{probeResult.isHit ? 'CACHE HIT' : 'CACHE MISS -> DB FETCH'}]</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-300">
              <span>TIER: {probeResult.tier}</span>
              <span className="font-bold">({probeResult.latency} ms)</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cache Entries Explorer & Virtual Memory Pagination */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 font-mono">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold uppercase tracking-wider">PAGINATED CACHE NODES (MRU &rarr; LRU)</span>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-[10px]">
            {[
              { id: 'all', label: 'ALL CATEGORIES' },
              { id: 'answer_key', label: 'ANSWER KEYS', icon: Key },
              { id: 'student_record', label: 'STUDENT RECORDS', icon: Users },
              { id: 'recent_result', label: 'RECENT RESULTS', icon: FileSpreadsheet },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-2.5 py-1 rounded uppercase font-semibold transition ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Entries Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/70 mb-3">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[10px] uppercase">
                <th className="py-2.5 px-3">Position</th>
                <th className="py-2.5 px-3">Cache Key</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Memory Tier</th>
                <th className="py-2.5 px-3">Accesses</th>
                <th className="py-2.5 px-3 text-right">Interactive Probe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                    No cache entries found for category "{selectedCategory}".
                  </td>
                </tr>
              ) : (
                entries.map((item) => {
                  const isProbing = probingKey === item.key;
                  const tierColor = item.tier === 'L1' ? 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30' : 'text-purple-400 bg-purple-950/60 border-purple-500/30';

                  return (
                    <tr key={item.key} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-2 px-3 text-slate-400 font-bold whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <span>#{item.position}</span>
                          {item.isMRU && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold">
                              MRU
                            </span>
                          )}
                          {item.isLRU && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-950 text-amber-400 border border-amber-500/40 font-bold">
                              LRU
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-white font-semibold text-[11px] truncate max-w-[220px]">
                        {item.key}
                      </td>
                      <td className="py-2 px-3 text-slate-300 text-[10px] uppercase">
                        {item.category.replace('_', ' ')}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${tierColor}`}>
                          {item.tier || 'L1'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-cyan-300 font-bold">
                        {item.accessCount}x
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => handleProbeKey(item.key)}
                          disabled={isProbing}
                          className="px-2.5 py-1 rounded bg-slate-900 hover:bg-cyan-950 text-cyan-300 hover:text-cyan-200 border border-slate-700 hover:border-cyan-500/50 text-[10px] font-bold uppercase transition"
                        >
                          {isProbing ? 'PROBING...' : 'PROBE (HIT)'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Virtual Memory Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 font-mono text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>PAGE {pagination.page} OF {pagination.totalPages || 1}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">TOTAL NODES: {pagination.totalEntries}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 text-[11px]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>PREV</span>
            </button>
            <button
              onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={currentPage >= pagination.totalPages}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 text-[11px]"
            >
              <span>NEXT</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
