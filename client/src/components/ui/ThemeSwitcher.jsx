import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme, THEMES } from '../../context/ThemeContext';

export const ThemeSwitcher = ({ showModeToggle = true, align = 'right' }) => {
  const { palette, setPalette, theme, toggleTheme, isDark, currentTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Palette Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/70 hover:border-slate-600 transition shadow-sm select-none"
        title="Change Website Theme & Color Palette"
      >
        {/* Active Theme Mini Swatch */}
        <div className="flex -space-x-1 items-center">
          {currentTheme.swatches.map((color, i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full ring-1 ring-slate-900 shrink-0"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <Palette className="w-4 h-4 text-slate-300" />
        <span className="hidden sm:inline text-xs font-semibold">{currentTheme.name.split('&')[0]}</span>
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute top-full mt-2 z-50 w-72 sm:w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 text-slate-100 backdrop-blur-xl ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Select Theme Palette
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                4 Curated Styles
              </span>
            </div>

            {/* Themes List */}
            <div className="space-y-2">
              {Object.values(THEMES).map((th) => {
                const isSelected = palette === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => {
                      setPalette(th.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition text-left select-none ${
                      isSelected
                        ? 'bg-slate-800/90 border-slate-600 shadow-md ring-1 ring-slate-500/50'
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Color Swatch Pill */}
                      <div className="flex flex-col gap-0.5 p-1 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                        <div className="flex gap-1">
                          {th.swatches.map((col, idx) => (
                            <span
                              key={idx}
                              className="w-3.5 h-3.5 rounded-full"
                              style={{ backgroundColor: col }}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-white leading-tight">
                          {th.name}
                        </p>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {th.tagline}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="p-1 rounded-full bg-cyan-500/20 text-cyan-400 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mode Switcher in Footer */}
            {showModeToggle && (
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-medium text-slate-400">
                  {isDark ? <Moon className="w-3.5 h-3.5 text-cyan-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </span>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition flex items-center gap-1.5"
                >
                  {isDark ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-cyan-400" />}
                  <span>Switch to {isDark ? 'Light' : 'Dark'}</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
