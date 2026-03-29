"use client";

import React, { useState, useEffect } from "react";
import { useVersion } from "@/providers/VersionProvider";
import { motion, AnimatePresence } from "framer-motion";

// V2 Components (Default)
import { Navbar as V2Navbar } from "@v2/components/layout/Navbar";
import { Footer as V2Footer } from "@v2/components/layout/Footer";
import { SystemPath as V2SystemPath } from "@v2/components/layout/SystemPath";
import { TerminalWidget as V2TerminalWidget } from "@v2/components/layout/TerminalWidget";
import { ThemeProvider as V2ThemeProvider } from "@v2/components/providers/ThemeProvider";
import { AchievementProvider as V2AchievementProvider } from "@v2/components/providers/AchievementProvider";
import { ThemeTransition as V2ThemeTransition } from "@v2/components/ui/ThemeTransition";

// V1 Components (Legacy)
import { Navbar as V1Navbar } from "@v1/components/layout/Navbar";
import { Footer as V1Footer } from "@v1/components/layout/Footer";
import { SystemPath as V1SystemPath } from "@v1/components/layout/SystemPath";
import { TerminalWidget as V1TerminalWidget } from "@v1/components/layout/TerminalWidget";
import { ThemeProvider as V1ThemeProvider } from "@v1/components/providers/ThemeProvider";
import { AchievementProvider as V1AchievementProvider } from "@v1/components/providers/AchievementProvider";
import { ThemeTransition as V1ThemeTransition } from "@v1/components/ui/ThemeTransition";

export function DispatcherLayout({ children }: { children: React.ReactNode }) {
  const { version, isTransitioning } = useVersion();

  return (
    <>
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-void flex flex-col items-center justify-center pointer-events-auto"
          >
             {/* High-Fidelity Noise Texture */}
             <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-screen overflow-hidden">
                <div className="absolute inset-0 animate-pulse bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
             </div>
             
             <div className="absolute inset-0 scanlines opacity-40 shrink-0" />
             
             {/* Chromatic Aberration & Glitch Text Container */}
             <div className="flex flex-col items-center gap-8 relative z-10 px-6 text-center">
                <motion.div 
                   animate={{ 
                      x: [0, -2, 2, -1, 1, 0],
                      skewX: [0, -5, 5, -2, 2, 0],
                      filter: [
                        "drop-shadow(0 0 0px var(--color-primary))",
                        "drop-shadow(-2px 0 1px #ff00c1) drop-shadow(2px 0 1px #00fff9)",
                        "drop-shadow(0 0 0px var(--color-primary))"
                      ]
                   }}
                   transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
                   className="text-primary font-mono text-3xl sm:text-4xl font-black tracking-[0.5em] uppercase"
                >
                  CORE_RESTRUCTURING
                </motion.div>

                {/* Industrial Progress Bar */}
                <div className="w-64 sm:w-80 h-1 bg-surface-medium relative overflow-hidden border border-primary/20">
                   <motion.div 
                      initial={{ left: "-100%" }}
                      animate={{ left: "100%" }}
                      transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                      className="absolute top-0 w-full h-full bg-primary shadow-[0_0_15px_var(--color-primary)]"
                   />
                </div>

                <div className="flex flex-col items-center gap-1">
                   <motion.div 
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="text-[10px] font-mono text-primary font-bold uppercase tracking-[0.3em]"
                   >
                      INITIATING_CORE_SWAP // VER: {version.toUpperCase()}
                   </motion.div>
                   <div className="text-[9px] font-mono text-primary/40 uppercase tracking-widest">
                      MEM_FLUSH_ACTIVE // ARCH_SYNC_PENDING
                   </div>
                </div>
             </div>
             
             {/* Fast-Scanning Glitch Stripes */}
             <div className="absolute inset-0 pointer-events-none overflow-hidden">
               {[...Array(8)].map((_, i) => (
                  <motion.div
                     key={i}
                     initial={{ y: "-100%" }}
                     animate={{ y: "200%" }}
                     transition={{ 
                        delay: i * 0.05, 
                        duration: 0.4, 
                        repeat: Infinity, 
                        repeatDelay: Math.random() * 2 
                     }}
                     className="absolute w-full h-[2px] bg-primary/10 opacity-30"
                     style={{ top: `${Math.random() * 100}%` }}
                  />
               ))}
             </div>

             {/* Vignette */}
             <div className="absolute inset-0 pointer-events-none bg-radial-vignette opacity-80" />
          </motion.div>
        )}
      </AnimatePresence>

      {version === "v2" ? (
        <V2ThemeProvider>
          <V2AchievementProvider>
            <V2ThemeTransition />
            <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.025] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none z-0 bg-primary/5 blur-[120px] rounded-full ambient-glow" />
            <V2Navbar />
            <main className="grow pt-16 relative z-10">
              <V2SystemPath />
              {children}
            </main>
            <V2TerminalWidget />
            <V2Footer />
          </V2AchievementProvider>
        </V2ThemeProvider>
      ) : (
        <V1ThemeProvider>
          <V1AchievementProvider>
            <V1ThemeTransition />
            <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.025] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
            <V1Navbar />
            <main className="grow pt-16 relative z-10">
              <V1SystemPath />
              {children}
            </main>
            <V1TerminalWidget />
            <V1Footer />
          </V1AchievementProvider>
        </V1ThemeProvider>
      )}
    </>
  );
}
