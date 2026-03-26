"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal } from "lucide-react";
import { useEffect } from "react";
import { tacticalAudio } from "@/lib/sounds";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function TacticalModal({ isOpen, onClose, title, subtitle, children }: ModalProps) {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-100 bg-surface/80 backdrop-blur-sm cursor-zoom-out"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-101 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] bg-surface-low border border-outline/20 relative pointer-events-auto overflow-hidden flex flex-col mx-2 sm:mx-0 shadow-2xl shadow-primary/5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HUD Accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary" />

              {/* Header */}
              <div className="flex items-center justify-between p-7 border-b border-outline/10 bg-surface-medium">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-primary">
                    <Terminal size={16} />
                    <span className="text-[11px] font-mono font-extrabold tracking-[0.2em] uppercase">SYSTEM_DIAGNOSTIC</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tighter uppercase text-on-surface">{title}</h2>
                  {subtitle && <p className="text-xs text-on-surface-muted/80 font-mono font-bold uppercase tracking-widest">{subtitle}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="p-3 hover:bg-surface-high text-on-surface-muted hover:text-tertiary transition-colors border border-outline/10 group"
                  title="CLOSE_MODULE"
                >
                  <X size={20} className="group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              {/* Content Area */}
              <div className="p-8 max-h-[70vh] overflow-y-auto scrollbar-tactical bg-surface">
                {children}
              </div>

              {/* Footer / Status Bar */}
              <div className="flex items-center justify-between px-7 py-4 border-t border-outline/10 bg-surface-medium text-xs font-mono text-on-surface-muted font-bold uppercase tracking-widest">
                <div className="flex items-center gap-6">
                  <span>AUTH: LVL_05</span>
                  <span className="text-primary">[{new Date().toLocaleDateString()}]</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span>UPLINK_STABLE</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
