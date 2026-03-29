"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface TacticalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export function TacticalModal({ isOpen, onClose, title, subtitle, children, className }: TacticalModalProps) {
  const [bufferedChildren, setBufferedChildren] = useState<React.ReactNode>(children);
  const [bufferedTitle, setBufferedTitle] = useState(title);
  const [bufferedSubtitle, setBufferedSubtitle] = useState(subtitle);

  useEffect(() => {
    if (isOpen && children) {
      setBufferedChildren(children);
      setBufferedTitle(title);
      setBufferedSubtitle(subtitle);
    }
  }, [isOpen, children, title, subtitle]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-void/80 backdrop-blur-md"
          />

          {/* Sheet */}
          <motion.div
            key="modal-sheet"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.8 }}
            className={`relative z-1001 w-full max-w-3xl max-h-[90dvh] flex flex-col bg-surface glow-card shadow-[0_32px_80px_rgba(0,0,0,0.6)] ${className ?? ""}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-4 shrink-0 border-b border-outline">
              <div className="flex flex-col gap-0.5 pr-8">
                <h2 className="font-display font-bold text-xl text-on-surface leading-tight tracking-tight">
                  {bufferedTitle}
                </h2>
                {bufferedSubtitle && (
                  <p className="text-xs font-mono text-on-surface-muted">
                    {bufferedSubtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-on-surface-muted hover:text-on-surface hover:bg-surface-high transition-all shrink-0 -mr-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
              {bufferedChildren}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
