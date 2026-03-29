"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { tacticalAudio } from "@v1/lib/sounds";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function TacticalModal({ isOpen, onClose, title, subtitle, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Handle open/close sounds
  useEffect(() => {
    if (isOpen) {
      tacticalAudio?.hum();
    }
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Static Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10000 bg-surface/60 backdrop-blur-md"
            aria-hidden="true"
            onClick={onClose}
          />

          {/* Scrolling Container */}
          <div
            className="fixed inset-0 z-10001 overflow-y-auto overflow-x-hidden px-4 sm:px-8 pb-8 flex items-start justify-center cursor-zoom-out"
            onClick={onClose}
          >
            {/* Modal Card wrapper - Precisely aligned below SystemPath bar */}
            <div className="min-h-full flex items-start justify-center w-full max-w-4xl pt-12">
              <motion.div
                initial={{ opacity: 0, scaleY: 0, originY: 0 }}
                animate={{ opacity: 1, scaleY: 1, originY: 0 }}
                exit={{ opacity: 0, scaleY: 0.8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full bg-surface-medium border border-primary/20 relative pointer-events-auto flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] cursor-default"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
              >
                {/* HUD Corner Accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />

                {/* Tactical Top Tape */}
                <div className="h-2 w-full bg-primary overflow-hidden opacity-80">
                  <div className="w-full h-full opacity-40 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,#000_4px,#000_8px)]" />
                </div>

                {/* Header */}
                <div className="flex items-start justify-between p-6 sm:p-8 border-b border-outline/10 bg-surface">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-primary">
                      <Terminal size={14} />
                      <span className="text-[10px] font-mono font-black tracking-[0.3em] uppercase">CLASSIFIED_INTEL // DEBRIEF</span>
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase text-on-surface leading-tight">{title}</h2>
                      {subtitle && <p className="text-xs text-on-surface-muted font-mono font-bold uppercase tracking-widest mt-1">{subtitle}</p>}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 sm:p-3 bg-surface-high border border-outline/10 text-on-surface-muted hover:text-tertiary hover:border-tertiary/40 transition-all group shrink-0"
                    title="CLOSE_MODULE"
                  >
                    <X size={18} className="group-hover:rotate-90 transition-transform" />
                  </button>
                </div>

                {/* Content Area - Removed max-H and internal scroll */}
                <div className="p-6 sm:p-8 bg-surface-low flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                    <Terminal size={200} />
                  </div>
                  {children}
                </div>

                {/* Bottom Tape & Status */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between px-6 sm:px-8 py-3 border-t border-outline/10 bg-surface text-[10px] font-mono text-on-surface-muted font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-4">
                      <span>AUTH: LVL_05</span>
                      <span className="text-primary hidden sm:inline">[{new Date().toLocaleDateString()}]</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-secondary animate-pulse" />
                      <span>UPLINK_STABLE</span>
                    </div>
                  </div>
                  <div className="h-1 w-full bg-secondary overflow-hidden opacity-60">
                    <div className="w-full h-full opacity-40 bg-[repeating-linear-gradient(-45deg,transparent,transparent_4px,#000_4px,#000_8px)]" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
