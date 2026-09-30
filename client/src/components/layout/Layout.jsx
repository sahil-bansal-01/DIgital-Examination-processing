import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { BackgroundAmbiance } from '../ui/BackgroundAmbiance';

export const Layout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#060813] dark:bg-[#060813] light:bg-[#f8fafc] text-slate-100 dark:text-slate-100 light:text-slate-900 flex relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-white">
      {/* Dynamic Cosmic Background with Aurora Mesh, Cyber Grid & Ambient Particles */}
      <BackgroundAmbiance />

      {/* Sidebar Navigation */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px] transition-all duration-200 relative z-10">
        <Navbar setIsMobileOpen={setIsMobileOpen} />

        {/* Page Container with Smooth Fade & Slide Route Transitions */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
