import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = {
  violet: {
    id: 'violet',
    name: 'Cyber Violet & Amethyst',
    tagline: 'Deep obsidian with neon violet, electric fuchsia, and cyan highlights',
    primary: '#8b5cf6',
    secondary: '#d946ef',
    accent: '#06b6d4',
    textGradient: 'from-violet-400 via-fuchsia-300 to-cyan-400',
    primaryBtn: 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white',
    badgeVariant: 'indigo',
    glowClass: 'glow-violet',
    accentHex: '#8b5cf6',
    swatches: ['#8b5cf6', '#d946ef', '#06b6d4'],
  },
  sapphire: {
    id: 'sapphire',
    name: 'Deep Cosmic Sapphire & Hyper Cyan',
    tagline: 'Deep midnight obsidian with electric sapphire, cosmic azure, and hyper cyan glow',
    primary: '#2563eb',
    secondary: '#06b6d4',
    accent: '#38bdf8',
    textGradient: 'from-blue-400 via-cyan-300 to-indigo-300',
    primaryBtn: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25',
    badgeVariant: 'cyan',
    glowClass: 'glow-cyan',
    accentHex: '#2563eb',
    swatches: ['#2563eb', '#06b6d4', '#38bdf8'],
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Matrix & Cyber Mint',
    tagline: 'Dark forest charcoal with glowing emerald, mint, and lime accents',
    primary: '#10b981',
    secondary: '#14b8a6',
    accent: '#84cc16',
    textGradient: 'from-emerald-400 via-teal-300 to-lime-400',
    primaryBtn: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white',
    badgeVariant: 'emerald',
    glowClass: 'glow-emerald',
    accentHex: '#10b981',
    swatches: ['#10b981', '#14b8a6', '#84cc16'],
  },
  amber: {
    id: 'amber',
    name: 'Crimson Sunset & Amber Gold',
    tagline: 'Luxury obsidian with ruby crimson, warm amber, and golden highlights',
    primary: '#f43f5e',
    secondary: '#f59e0b',
    accent: '#fbbf24',
    textGradient: 'from-rose-400 via-amber-300 to-yellow-400',
    primaryBtn: 'bg-gradient-to-r from-rose-600 via-amber-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white',
    badgeVariant: 'amber',
    glowClass: 'glow-rose',
    accentHex: '#f43f5e',
    swatches: ['#f43f5e', '#f59e0b', '#fbbf24'],
  },
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('eps_theme') || 'dark';
  });

  const [palette, setPaletteState] = useState(() => {
    return localStorage.getItem('eps_palette') || 'violet';
  });

  // Apply light/dark mode and palette attributes to <html>
  useEffect(() => {
    const root = document.documentElement;

    // 1. Dark/Light class
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('eps_theme', theme);

    // 2. Palette attribute and classes
    root.setAttribute('data-theme', palette);
    root.classList.remove('theme-violet', 'theme-sapphire', 'theme-emerald', 'theme-amber');
    root.classList.add(`theme-${palette}`);
    localStorage.setItem('eps_palette', palette);
  }, [theme, palette]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setPalette = (paletteKey) => {
    if (THEMES[paletteKey]) {
      setPaletteState(paletteKey);
    }
  };

  const currentTheme = THEMES[palette] || THEMES.violet;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        isDark: theme === 'dark',
        palette,
        setPalette,
        currentTheme,
        allThemes: THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
