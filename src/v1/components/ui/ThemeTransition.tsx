"use client";

import { useTheme } from "@v1/components/providers/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function ThemeTransition() {
  const { isTransitioning } = useTheme();
  const [glitchBlocks, setGlitchBlocks] = useState<{ id: number; top: string; left: string; width: string; height: string }[]>([]);

  useEffect(() => {
    if (isTransitioning) {
      const blocks = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 50 + 10}%`,
        height: `${Math.random() * 10 + 2}%`,
      }));
      setGlitchBlocks(blocks);
    }
  }, [isTransitioning]);

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-9999 pointer-events-none bg-white/5 backdrop-blur-[1px]"
        >
          {/* Static Noise Overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay animate-pulse" />
          
          {/* Glitch Blocks */}
          {glitchBlocks.map((block) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: [0, 0.8, 0, 0.8, 0],
                x: [block.id % 2 === 0 ? -20 : 20, 0],
              }}
              transition={{ duration: 0.4, ease: "linear" }}
              className="absolute bg-primary/20"
              style={{
                top: block.top,
                left: block.left,
                width: block.width,
                height: block.height,
                boxShadow: "0 0 10px var(--color-primary)",
              }}
            />
          ))}

          {/* Flash Effect - Softened */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 0.2, times: [0, 0.5, 1] }}
            className="absolute inset-0 bg-white"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
