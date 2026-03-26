"use client";

import { type Variants } from "framer-motion";

/** Smooth reveal with tactical HUD feel */
export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: "easeOut" as const },
});

/** Sequential stagger for list modules */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

/** Tactical child element entrance */
export const item: Variants = {
  hidden: { opacity: 0, x: -5 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

/** Scanning pulse animation */
export const pulse: Variants = {
  animate: {
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
};

/** Terminal-style typewriter effect variants */
export const typewriter: Variants = {
  hidden: { width: 0 },
  visible: { 
    width: "auto",
    transition: {
      duration: 0.8,
      ease: "linear" as const,
    }
  }
};
